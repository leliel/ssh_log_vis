package request_handlers;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;

import JSONtypes.Connect;
import JSONtypes.Disconnect;
import JSONtypes.Entry;
import JSONtypes.Invalid;
import JSONtypes.Line;
import JSONtypes.Other;
import JSONtypes.Server;
import JSONtypes.SubSystemReq;
import enums.AuthType;
import enums.Status;
import enums.SubSystem;

/**
 * Servlet implementation class GetEntries
 */
//@WebServlet(description = "gets sshd log entries in JSON format", urlPatterns = { "/GetEntries" })
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
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub\
		int bins;
		List<Line> lines = new ArrayList<Line>();
		List<Entry> entries = new ArrayList<Entry>();
		try {
			Context context = new InitialContext();
			DataSource dataSource = (DataSource)context.lookup("java:comp/env/jdbc/sshd_vis_db");
			Connection connection = dataSource.getConnection();

			SimpleDateFormat formatter = new SimpleDateFormat("", Locale.ENGLISH);

			PreparedStatement state;


			if (request.getParameter("serverName") != null){
				state = connection.prepareStatement("SELECT entry.timestamp, entry.connid, entry.reqtype, " +
						"entry.authtype, entry.status, user.name as user, entry.source, entry.port, entry.subsystem, entry.code, " +
						"entry.isfreqtime, entry.isfreqloc, entry.rawline " +
						"FROM entry LEFT JOIN server ON entry.server = server.id " +
						"LEFT JOIN user ON entry.user = user.id " +
						"WHERE server.name = ? AND" +
						"entry.timestamp BETWEEN ? AND ?;");
				state.setString(1, request.getParameter("serverName"));
				state.setTimestamp(2, new Timestamp(formatter.parse(request.getParameter("startDateTime")).getTime()));
				state.setTimestamp(3, new Timestamp(formatter.parse(request.getParameter("endDateTime")).getTime()));
			} else {
				state = connection.prepareStatement("SELECT entry.timestamp, server.name as server, entry.connid, entry.reqtype, " +
						"entry.authtype, entry.status, user.name as user, entry.source, entry.port, entry.subsystem, entry.code, " +
						"entry.isfreqtime, entry.isfreqloc, entry.rawline " +
						"FROM entry LEFT JOIN server ON entry.server = server.id " +
						"LEFT JOIN user ON entry.user = user.id " +
						"WHERE entry.timestamp BETWEEN ? AND ?;");
				state.setTimestamp(1, new Timestamp(formatter.parse(request.getParameter("startDateTime")).getTime()));
				state.setTimestamp(2, new Timestamp(formatter.parse(request.getParameter("endDateTime")).getTime()));
			}
			state.execute();

			ResultSet result = state.getResultSet();
			Line res;
			while (result.next()){
				if (result.getString("entry.reqtype") == "connect"){
					res = loadConnect(result);
				} else if (result.getString("entry.reqtype") == "disconnect"){
					res = loadDisconnect(result);
				} else if (result.getString("entry.reqtype") == "subsystem"){
					res = loadSubsystem(result);
				} else if (result.getString("entry.reqtype") == "invalid"){
					res = loadInvalid(result);
				} else {
					res = loadOther(result);
				}
				lines.add(res);
			}
			/*done with database, cleanup*/
			result.close();
			state.close();
			connection.close();
			/*done with database, cleanup*/

			response.setContentType(GetEntries.JSONMimeType);
			PrintWriter w = response.getWriter();

			if (Math.round(Math.sqrt(lines.size())) < Integer.parseInt(request.getParameter("maxBins"))){
				bins = (int)Math.round(Math.sqrt(lines.size()));
			} else {
				bins = Integer.parseInt(request.getParameter("maxBins"));
			}
			int elemPerBin = lines.size()/bins;
			int count = 1;
			Entry e = new Entry(elemPerBin, null);

			if (lines.size() == 1){
				Line l = lines.get(0);
				e = new Entry(l.getTime(), l.getTime(), null, 1, 0, 0, 0, l);
				setFlags(l, e);
				w.print(e.toJSONString());
				//TODO finish sending response for single entry;
			}

			for (Line l : lines){
				setFlags(l, e);
				if (count%elemPerBin == 0){
					entries.add(e);
					e = new Entry(elemPerBin, null);
				}
			}



		} catch (NamingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private void setFlags(Line l, Entry e){
		Connect con;
		Disconnect discon;
		Invalid inv;
		SubSystemReq subs;
		Other other;
		if (l.getClass().equals(Connect.class)){
			con = (Connect)l;
			if (con.getStatus() == Status.ACCEPTED){
				e.incAcceptedConn();
			} else {
				e.incFailedConn();
				if (con.getUser().equals("root")){
					e.addFlag("");
				}
			}
			if (!con.isFreqLoc()){
				e.addFlag(""); //TODO define flags for entry.
			}
			if (!con.isFreqTime()){
				e.addFlag("");
			}
		} else if (l.getClass().equals(Disconnect.class)){
			discon = (Disconnect)l;
			//do we need to do anything here or are these mostly pointless at this level?
		} else if (l.getClass().equals(Invalid.class)){
			inv = (Invalid)l;
			e.addFlag("");
			e.incInvalid();
		} else if (l.getClass().equals(Other.class)){
			other = (Other)l;
			if (other.getMessage().toLowerCase().startsWith("error")){
				e.addFlag("");
			}
		} else {
			subs = (SubSystemReq)l;
			//do we actually need to do anything with this?
		}
	}

	private Line loadOther(ResultSet result) throws SQLException {
		Timestamp time = result.getTimestamp("timestamp");
		Server s;
		if (result.getMetaData().getColumnCount() == 11) {
			s = new Server(null, null);
		} else {
			s = new Server(result.getString("server"), null);
		}
		String msg = result.getString("rawline");
		msg = msg.substring(msg.indexOf("]:") + 2);
		return new Other(time, s, result.getInt("connectid"), msg, result.getString("rawline"));
	}

	private Line loadInvalid(ResultSet result) throws SQLException {
		Timestamp time = result.getTimestamp("timestamp");
		Server s;
		if (result.getMetaData().getColumnCount() == 11) {
			s = new Server(null, null);
		} else {
			s = new Server(result.getString("server"), null);
		}
		return new Invalid(time, s, result.getInt("connectid"), result.getString("user"), result.getString("source"), result.getString("rawlwine"));
	}

	private Line loadSubsystem(ResultSet result) throws SQLException {
		Timestamp time = result.getTimestamp("timestamp");
		Server s;
		if (result.getMetaData().getColumnCount() == 11) {
			s = new Server(null, null);
		} else {
			s = new Server(result.getString("server"), null);
		}
		SubSystem sub;
		if (result.getString("subsystem").equals("sftp")){
			sub = SubSystem.SFTP;
		} else {
			sub = SubSystem.SCP;
		}
		return new SubSystemReq(time, s, result.getInt("connectid"), sub, result.getString("rawline"));
	}

	private Line loadDisconnect(ResultSet result) throws SQLException {
		Timestamp time = result.getTimestamp("timestamp");
		Server s;
		if (result.getMetaData().getColumnCount() == 11) {
			s = new Server(null, null);
		} else {
			s = new Server(result.getString("server"), null);
		}
		return new Disconnect(time, s, result.getInt("connectid"), result.getInt("code"), result.getString("source"), result.getString("rawline"));
	}

	private Line loadConnect(ResultSet result) throws SQLException {
		Timestamp time = result.getTimestamp("timestamp");
		Server s;
		if (result.getMetaData().getColumnCount() == 11) {
			s = new Server(null, null);
		} else {
			s = new Server(result.getString("server"), null);
		}

		AuthType auth;
		String temp = result.getString("authtype");
		if (temp.equals("pass")){
			auth = AuthType.PASS;
		} else if (temp.equals("key")){
			auth = AuthType.KEY;
		} else if (temp.equals("host")){
			auth = AuthType.HOST;
		} else if (temp.equals("gssapi")){
			auth = AuthType.GSSAPI;
		} else {
			auth = AuthType.NONE;
		}

		Status status;
		if (result.getString("status").equals("accepted")){
			status = Status.ACCEPTED;
		} else {
			status = Status.FAILED;
		}

		return new Connect(time, s, result.getInt("connectid"), status, auth, result.getString("user"), result.getString("source"), result.getInt("port"), result.getBoolean("isfreqtime"), result.getBoolean("isfreqloc"), result.getString("rawline"));
	}

}
