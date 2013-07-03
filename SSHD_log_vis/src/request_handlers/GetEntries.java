package request_handlers;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import request_utils.Request_utils;
import JSONtypes.Connect;
import JSONtypes.Disconnect;
import JSONtypes.Entry;
import JSONtypes.Invalid;
import JSONtypes.Line;
import JSONtypes.Other;
import JSONtypes.SubSystemReq;
import data_source_interface.Mysql_Datasource;
import data_source_interface.SSHD_log_vis_datasource;
import enums.Status;



/**
 * Servlet implementation class GetEntries
 * Implements fetching of timebinned log entries for sshd_log_vis tool.
 * Requests must provide startTime, endTime and maxBins.
 * maxBins indicates the maximum number of timebins the server should produce. where the natural number of bins (sqrt(log_entries))
 * would exceed maxBins, it is clamped to maxBins for displayability reasons.
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
		int bins;
		List<Line> lines = new ArrayList<Line>();
		List<Entry> entries = new ArrayList<Entry>();

		SSHD_log_vis_datasource datasource = new Mysql_Datasource();
		if (request.getParameter("startTime") == null){
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}
		if (request.getParameter("endTime") == null){
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}
		if (request.getParameter("maxBins") == null){
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
		}
		lines = datasource.getEntriesFromDataSource(request.getParameter("serverName"), request.getParameter("startTime"), request.getParameter("endTime"));

		if (lines.isEmpty()){
			response.sendError(HttpServletResponse.SC_NO_CONTENT);
			return;
		}

		PrintWriter w;
		if (Request_utils.isGzipSupported(request)
				&& !Request_utils.isGzipDisabled(request)) {
			w = Request_utils.getGzipWriter(response);
		} else {
			w = response.getWriter();
		}

		response.setContentType(GetEntries.JSONMimeType);
		String bins1 = request.getParameter("maxBins");

		//TODO math don't work right for little bins, fix this.
		int maxBins = Integer.parseInt(bins1);
		if (Math.round(Math.sqrt(lines.size())) < maxBins) {
			bins = (int) Math.round(Math.sqrt(lines.size()));
		} else {
			bins = Integer.parseInt(request.getParameter("maxBins"));
		}
		int elemPerBin = lines.size() / bins;
		//int count = 1;

		StringBuilder json = new StringBuilder();
		/*if (lines.size() == 1) {
			Line l = lines.get(0);
			e = new Entry(0, l.getTime(), l.getTime(), null, 1, 0, 0, 0, l);
			setFlags(l, e);
			String out = e.toJSONString();
			w.print(out);
			return; // all done here, we've sent the one line.
		}*/
		Entry e = (elemPerBin == 1) ? new Entry(1, elemPerBin, lines.get(0)) : new Entry(1, elemPerBin, null);
		e.setStart(lines.get(0).getTime()); //if we're here there must be at least one element in lines.
		Line l;
		for (int i =0; i< lines.size(); i++){
			l = lines.get(i);
			setFlags(l, e);
			if (i%elemPerBin == 0 && i != 0){
				e.setEnd(l.getTime());
				entries.add(e);
				e = (elemPerBin == 1) ? new Entry(1, elemPerBin, l) : new Entry(i, elemPerBin, null);
				e.setStart(l.getTime());
			}
		}
		/*for (Line l : lines) {
			setFlags(l, e);
			if (count % elemPerBin == 0) { //TODO math not working right for small bins.. needs fixing.
				e.setEnd(l.getTime());
				entries.add(e);
				e = (elemPerBin == 1) ? new Entry((count/bins),elemPerBin, l) : new Entry((count/bins), elemPerBin, null);
				e.setStart(l.getTime());
			}
		}*/

		json.append("[");
		for (Entry es : entries) {
			json.append(es.toJSONString());
			json.append(",");
		}
		json.deleteCharAt(json.length()-1); //clunky, but should strip out trailing ,
		json.append("]");
		w.print(json.toString());
	}

	private void setFlags(Line l, Entry e) {
		Connect con;
		Disconnect discon;
		Invalid inv;
		SubSystemReq subs;
		Other other;
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
