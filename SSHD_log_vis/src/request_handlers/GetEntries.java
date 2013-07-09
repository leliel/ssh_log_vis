package request_handlers;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import JSONtypes.Connect;
import JSONtypes.Disconnect;
import JSONtypes.Entry;
import JSONtypes.Invalid;
import JSONtypes.Line;
import JSONtypes.Other;
import JSONtypes.SubSystemReq;
import data_source_interface.DataSourceException;
import data_source_interface.Mysql_Datasource;
import data_source_interface.SSHD_log_vis_datasource;
import enums.Status;

/**
 * Servlet implementation class GetEntries Implements fetching of timebinned log
 * entries for sshd_log_vis tool. Requests must provide startTime, endTime,
 * maxBins and binLength. maxBins indicates the maximum number of timebins the
 * server should produce. where the natural number of bins
 * ((endTime-startTime)/binLength) would exceed maxBins, it is clamped to
 * maxBins for displayability reasons.
 */
public class GetEntries extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String JSONMimeType = "application/json";

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public GetEntries() {
		super();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		List<Line> lines = new ArrayList<Line>();
		List<Entry> entries = new ArrayList<Entry>();

		SSHD_log_vis_datasource datasource = new Mysql_Datasource();
		if (request.getParameter("startTime") == null
				|| request.getParameter("endTime") == null
				|| request.getParameter("maxBins") == null
				|| request.getParameter("binLength") == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}

		try {
			lines = datasource.getEntriesFromDataSource(
					request.getParameter("serverName"),
					request.getParameter("startTime"),
					request.getParameter("endTime"));
		} catch (DataSourceException e2) {
			this.getServletContext().log(e2.getMessage(), e2.getCause());
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return;
		}

		if (lines.isEmpty()) {
			response.sendError(HttpServletResponse.SC_NO_CONTENT);
			return;
		}

		PrintWriter w;
		// TODO fix the damned gzip support.
		/*
		 * if (Request_utils.isGzipSupported(request) &&
		 * !Request_utils.isGzipDisabled(request)) { w =
		 * Request_utils.getGzipWriter(response);
		 * response.setHeader("Content-Encoding", "gzip"); } else {
		 */
		w = response.getWriter();
		// }

		long binLength;
		long requestLength;
		long bins;
		long maxBins;
		long startTime;
		long endTime;

		try {
			binLength = Long.parseLong(request.getParameter("binLength"));
			endTime = Long.parseLong(request.getParameter("endTime"));
			startTime = Long.parseLong(request.getParameter("startTime"));
			maxBins = Long.parseLong(request.getParameter("maxBins"));
			requestLength = endTime - startTime;
		} catch (NumberFormatException e1) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}

		if (requestLength < 0) { // start time must be before end time.
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}

		/**
		 * compute bin widths and maximum possible bin count. if number of bins
		 * based on request length and bin length exceeds max Bins set number of
		 * bins to max bins, and recompute bin length based on the length of
		 * request and maxbins
		 */
		bins = (int) (Math.ceil(requestLength / (double) binLength));
		bins = (bins < maxBins) ? bins : maxBins;
		binLength = (bins == maxBins) ? (long) Math.ceil(requestLength
				/ binLength) : binLength;
		response.setContentType(GetEntries.JSONMimeType);

		//TODO refactor this, it's too hard to understand and maintain.
		Entry e = new Entry(lines.get(0).getId(), null);
		e.setStart(startTime);
		e.setEnd(startTime + binLength);
		while (e.getEnd() < lines.get(0).getTime()){
			e.setStart(e.getEnd());
			e.setEnd(e.getEnd() + binLength);
		}
		if (e.getStart() <= lines.get(0).getTime()
				&& lines.get(0).getTime() <= e.getEnd()) {
			entries.add(e);
		}
		
		if (lines.size() == 1){
			e.setElem(lines.get(0));
		}

		
		Line l;
		for (int i = 0; i < lines.size(); i++) {
			l = lines.get(i);
			// this element is inside the current bin
			if (l.getTime() < e.getEnd()) { 
				setFlags(l, e);
				// we're right on the edge of a bin 
			} else if (l.getTime() == e.getEnd()) {
				setFlags(l, e);
				// if lines.size == count, this is the last iteration anyway, so don't bother setting up a new element.
				if (lines.size() > (i + 1) 
						// lookahead, if the next elem exist and is in a new bin, make it.
						&& lines.get(i + 1).getTime() > (l.getTime())) { 
					if (e.getSubElemCount() == 1) {
						e.setElem(l);
					}
					e = new Entry(l.getId(), null);
					entries.add(e);
					e.setStart(l.getTime());
					e.setEnd(startTime + binLength);
				}
			} else { // this element is past the end of the current bin
				// it may be more than one binLength past 
				while (l.getTime() > startTime + binLength) { 
					startTime += binLength;// increment startTime in binLength increments, skipping N bins.
				}
				if (e.getSubElemCount() == 1) {
					e.setElem(l);
				}
				if (lines.size() > i + 1) {
					e = new Entry(l.getId(), null);
					entries.add(e);
					e.setStart(startTime);
					setFlags(l, e);
					e.setEnd(startTime + binLength);
				}
			}
		}
		//END REFACTOR BLOCK

		StringBuilder json = new StringBuilder("[");
		for (Entry es : entries) {
			json.append(es.toJSONString());
			json.append(",");
		}
		json.deleteCharAt(json.length() - 1); // clunky, but should strip out
												// trailing ,
		json.append("]");
		w.print(json.toString());
		w.flush();
		response.flushBuffer();
	}

	private void setFlags(Line l, Entry e) {
		Connect con;
		Disconnect discon;
		Invalid inv;
		SubSystemReq subs;
		Other other;
		e.incSubElemCount();
		if (l.getClass().equals(Connect.class)) {
			con = (Connect) l;
			if (con.getStatus() == Status.ACCEPTED) {
				e.incAcceptedConn();
			} else {
				e.incFailedConn();
				if (con.getUser().equals("root")) {
					e.addFlag("");
				}
			}
			if (con.getFreqLoc() == 0) { // jdbc turns nulls to 0's
				e.addFlag(""); // TODO define flags for entry.
			}
			if (con.getFreqTime() == 0) { // jdbc turns nulls to 0's
				e.addFlag("");
			}
		} else if (l.getClass().equals(Disconnect.class)) {
			discon = (Disconnect) l;
			// do we need to do anything here or are these mostly pointless at
			// this level?
		} else if (l.getClass().equals(Invalid.class)) {
			inv = (Invalid) l;
			e.addFlag("");
			e.incInvalid();
		} else if (l.getClass().equals(Other.class)) {
			other = (Other) l;
			if (other.getMessage().toLowerCase().startsWith("error")) {
				e.addFlag("");
			}
		} else {
			subs = (SubSystemReq) l;
			// do we actually need to do anything with this?
		}
	}

}
