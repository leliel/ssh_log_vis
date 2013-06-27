package Parser;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Time;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;

import dataTypes.Connect;
import dataTypes.Disconnect;
import dataTypes.Invalid;
import dataTypes.Line;
import dataTypes.Other;
import dataTypes.Server;
import dataTypes.SubSystemReq;
import dataTypes.User;
import enums.AuthType;
import enums.Status;
import enums.SubSystem;

//TODO - get algorithm from ian for IP anonymizing.
//TODO refactor database connection.
public class Parser {

	private final static String url = "jdbc:mysql://localhost:3306/";
	private final static String dbName = "leliel_engr489_2013";
	private final static String userName = "leliel";
	private final static String pass = "iBoo3Ang";

	private Map<String, User> users;
	private Map<InetAddress, InetAddress> addresses;
	private Map<String, Server> servers;
	private List<Line> lines;
	private final boolean anonymise;

	public Parser(boolean anonymise) {
		users = new HashMap<String, User>();
		addresses = new HashMap<InetAddress, InetAddress>();
		servers = new HashMap<String, Server>();
		lines = new ArrayList<Line>();
		this.anonymise = anonymise;
	}

	private void parseLogs(String[] logName) {
		for (String s : logName) {
			BufferedReader read;
			try {
				read = new BufferedReader(new FileReader(new File(s)));
				parseLog(read);
			} catch (FileNotFoundException e) {
				// fall down go boom
				e.printStackTrace();
			} catch (IOException e) {
				// fall down go boom
				e.printStackTrace();
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
	}

	private void parseLog(BufferedReader read) throws IOException,
			ParseException {
		String line;
		while ((line = read.readLine()) != null) {
			Line res = parseLine(line);
			if (res != null) {
				lines.add(res);
			}
		}
	}

	public Line parseLine(String line) throws ParseException,
			UnknownHostException {
		if (line.contains("subsystem")) {
			return parseSubsystem(line);
		} else if (line.contains("disconnect")) {
			return parseDiscon(line);
		} else if (line.contains("Accept") || line.contains("Fail")) {
			return parseConn(line);
		} else if (line.contains("Invalid")) {
			return parseInvalid(line);
		} else if (line.contains("Server") || line.contains("error")) {
			return parseOther(line);
		} else
			return null;
	}

	private Line parseOther(String line) throws ParseException {
		int idx = 0; // use as a counter to traverse tokens produced by split.
		String[] parts = line.split("\\s+");

		SimpleDateFormat format = new SimpleDateFormat("MMM:dd", Locale.ENGLISH);
		Date date = new Date(format.parse(parts[idx++] + ":" + parts[idx++])
				.getTime());

		format.applyPattern("HH:mm:ss");
		Time time = new Time(format.parse(parts[idx++]).getTime());

		Server s = getServer(parts[idx++]);

		String service = parts[idx].substring(0, parts[idx].indexOf("["));
		if (!"sshd".equals(service)) {
			throw new ParseException("invalid daemon", 0);
		}
		String temp = parts[idx].substring(1 + parts[idx].indexOf("["),
				parts[idx++].indexOf("]"));
		int connectID = Integer.parseInt(temp);

		int offset = 5; // spaces
		for (int i = 0; i <= idx; i++) {
			offset += parts[i].length();
		}

		String msg = line.substring(offset); // we're just gonna treat the bulk
												// as a text for now.

		return new Other(date, time, s, connectID, msg, line);
	}

	private Line parseConn(String line) throws ParseException,
			UnknownHostException {
		int idx = 0; // use as a counter to traverse tokens produced by split.
		String[] parts = line.split("\\s+");

		SimpleDateFormat format = new SimpleDateFormat("MMM:dd", Locale.ENGLISH);
		Date date = new Date(format.parse(parts[idx++] + ":" + parts[idx++])
				.getTime());

		format.applyPattern("HH:mm:ss");
		Time time = new Time(format.parse(parts[idx++]).getTime());

		Server s = getServer(parts[idx++]);

		String service = parts[idx].substring(0, parts[idx].indexOf("["));
		if (!"sshd".equals(service)) {
			throw new ParseException("invalid daemon", 0);
		}
		String temp = parts[idx].substring(1 + parts[idx].indexOf("["),
				parts[idx++].indexOf("]"));
		int connectID = Integer.parseInt(temp);

		Status status;
		if (parts[idx].equals("Accepted")) {
			status = Status.ACCEPTED;
			idx++;
		} else if (parts[idx].equals("Failed")) {
			status = Status.FAILED;
			idx++;
		} else
			throw new ParseException("Illegal status for connection attempt", 0);

		AuthType auth;
		if (parts[idx].equalsIgnoreCase("password")) {
			auth = AuthType.PASS;
			idx++;
		} else if (parts[idx].equalsIgnoreCase("host")) {
			auth = AuthType.HOST;
			idx += 2;
		} else if (parts[idx].equalsIgnoreCase("publickey")) {
			auth = AuthType.KEY;
			idx++;
		} else if (parts[idx].startsWith("gssapi-")) {
			auth = AuthType.GSSAPI;
			idx++;
		} else if (parts[idx].equalsIgnoreCase("none")) {
			auth = AuthType.NONE;
			idx++;
		} else
			throw new ParseException("Illegal authentication method string", 0);

		idx++; // there's a constant string here, just skip over it.

		User user;
		if (parts[idx].equals("invalid")) {
			idx += 2; // skip over the word user, it's a constant string.
			user = getUser(parts[idx++]);
		} else { // User must be valid, so parts[idx] is a username.
			user = getUser(parts[idx++]);
		}

		idx++; // constant word from

		InetAddress address = anonymiseIP(InetAddress.getByName(parts[idx++]));

		idx++; // constant word port;

		int port = Integer.parseInt(parts[idx]); // port's an unsigned short but
													// java doesn't have
													// unsigned. why?

		return new Connect(date, new Time(time.getTime()), s, connectID,
				status, auth, user, address, port, line);
	}

	private Line parseInvalid(String line) throws ParseException,
			UnknownHostException {
		int idx = 0; // use as a counter to traverse tokens produced by split.
		String[] parts = line.split("\\s+");

		SimpleDateFormat format = new SimpleDateFormat("MMM:dd", Locale.ENGLISH);
		Date date = new Date(format.parse(parts[idx++] + ":" + parts[idx++])
				.getTime());

		format.applyPattern("HH:mm:ss");
		Time time = new Time(format.parse(parts[idx++]).getTime());

		Server s = getServer(parts[idx++]);

		String service = parts[idx].substring(0, parts[idx].indexOf("["));
		int connectID;
		if (!"sshd".equals(service)) {
			throw new ParseException("invalid daemon", 0);
		} else {
			String temp = parts[idx].substring(1 + parts[idx].indexOf("["),
					parts[idx++].indexOf("]"));
			connectID = Integer.parseInt(temp);
		}

		User user;
		if (parts[idx].equalsIgnoreCase("Invalid")) {
			idx += 2;
			user = getUser(parts[idx++]);
		} else {
			throw new ParseException("user is not invalid", 0);
		}

		idx++; // constant string, skip past it.

		InetAddress addr = anonymiseIP(InetAddress.getByName(parts[idx]));

		return new Invalid(date, time, s, connectID, user, addr, line);
	}

	private Line parseDiscon(String line) throws ParseException,
			UnknownHostException {
		int idx = 0; // use as a counter to traverse tokens produced by split.
		String[] parts = line.split("\\s+");

		SimpleDateFormat format = new SimpleDateFormat("MMM:dd", Locale.ENGLISH);
		Date date = new Date(format.parse(parts[idx++] + ":" + parts[idx++])
				.getTime());

		format.applyPattern("HH:mm:ss");
		Time time = new Time(format.parse(parts[idx++]).getTime());

		Server s = getServer(parts[idx++]);

		String service = parts[idx].substring(0, parts[idx].indexOf("["));
		int connectID;
		if (!"sshd".equals(service)) {
			throw new ParseException("invalid daemon", 0);
		} else {
			connectID = Integer.parseInt(parts[idx].substring(
					1 + parts[idx].indexOf("["), parts[idx++].indexOf("]")));
		}

		idx += 3; // constant words "recieved disconnect from", skipping

		InetAddress addr = anonymiseIP(InetAddress.getByName((parts[idx++]
				.replace(":", "")))); // strip
		// trailing
		// colon
		// before
		// parsing
		int code = Integer.parseInt(parts[idx].replace(":", "")); // strip
																	// trailing
																	// colon
																	// before
																	// parsing

		return new Disconnect(date, time, s, connectID, code, addr, line);
	}

	private Line parseSubsystem(String line) throws ParseException {
		int idx = 0; // use as a counter to traverse tokens produced by split.
		String[] parts = line.split("\\s+");

		SimpleDateFormat format = new SimpleDateFormat("MMM:dd", Locale.ENGLISH);
		Date date = new Date(format.parse(parts[idx++] + ":" + parts[idx++])
				.getTime());

		format.applyPattern("HH:mm:ss");
		Time time = new Time(format.parse(parts[idx++]).getTime());

		Server s = getServer(parts[idx++]);

		String service = parts[idx].substring(0, parts[idx].indexOf("["));
		int connectID;
		if (!"sshd".equals(service)) {
			throw new ParseException("invalid daemon", 0);
		} else {
			connectID = Integer.parseInt(parts[idx].substring(
					1 + parts[idx].indexOf("["), parts[idx++].indexOf("]")));
			idx++;
		}

		idx += 2; // skip constant string "subsystem request for"

		SubSystem sys;
		if (parts[idx].equals("sftp")) {
			sys = SubSystem.SFTP;
		} else if (parts[idx].equals("scp")) {
			sys = SubSystem.SCP;
		} else
			throw new ParseException(
					"unrecognised subsystem in subsystem request", 0);

		return new SubSystemReq(date, time, s, connectID, sys, line);
	}

	private Server getServer(String name) {
		if (servers.containsKey(name)) {
			return servers.get(name);
		} else {
			Server s = new Server(name, "");
			servers.put(name, s);
			return s;
		}
	}

	private User getUser(String name) {
		if (users.containsKey(name)) {
			return users.get(name);
		} else {
			User temp = new User(name);
			users.put(name, temp);
			return temp;
		}
	}

	private InetAddress anonymiseIP(InetAddress ip) {
		if (addresses.containsKey(ip)) {
			return addresses.get(ip);
		} else if (this.anonymise) {
			InetAddress temp = ip;
			addresses.put(ip, temp);
			// TODO implement IP anonymisation.
			return temp;
		} else {
			addresses.put(ip, ip);
			return ip;
		}
	}

	private void writeToDB() {
		try {
			Connection conn = DriverManager.getConnection(url + dbName,
					userName, pass);

			writeUsersToDB(conn); // ensures users updated with ID's
			writeServersToDB(conn); // ensures users updated with ID's

			PreparedStatement insertLine = conn
					.prepareStatement("INSERT INTO entry VALUES("
							+ "DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?)");
			for (int i = 0; i < lines.size(); i++) {
				//writing location/time also tests if entry prompting write counts as frequent.
				lines.get(i).writeLoc(conn); //must be written before entries are written to db.
				// lines.get(i).writeTime(conn);
				lines.get(i).writeToDB(insertLine);
				if ((i % 1000) == 0) { // write it out every thousand lines,
										// just to be sure it all writes.
					insertLine.executeBatch();
					System.out.printf("inserted %d lines\n", i);
				}
			}
			insertLine.executeBatch(); // flush what's left.

		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	private void writeUsersToDB(Connection conn) throws SQLException {
		CallableStatement s = conn.prepareCall("{call insert_user(?, ?)}");
		for (Entry<String, User> u : this.users.entrySet()) {
			if (u.getValue().getName().equals("Ftp")) {
				System.out.printf("key %s, name %s", u.getKey(), u.getValue()
						.getName());
			}
			u.getValue().writeToDB(s);
		}
	}

	private void writeServersToDB(Connection conn) throws SQLException {
		CallableStatement serve = conn
				.prepareCall("{call insert_server(?, ?)}");
		for (Server s : this.servers.values()) {
			s.writeToDB(serve);
		}
	}

	public static void main(String[] args) {
		if (args.length == 0) {
			System.out.print("Logfile parser and database loader for SSHDVis");
			System.out
					.print("Usage: commandline arguments should be a space seperated list of filenames, full paths allowable.");
			System.exit(0);
		} else {
			Parser p = new Parser(false);
			p.parseLogs(args);
			p.writeToDB();
		}
	}
}
