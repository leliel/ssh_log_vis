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
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
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

	private final static String url = Messages.getString("Parser.dbLoc"); //$NON-NLS-1$
	private final static String dbName = Messages.getString("Parser.dbName"); //$NON-NLS-1$
	private final static String userName = Messages.getString("Parser.dbUser"); //$NON-NLS-1$
	private final static String pass = Messages.getString("Parser.dbPass"); //$NON-NLS-1$

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
		if (line.contains("subsystem")) { //$NON-NLS-1$
			return parseSubsystem(line);
		} else if (line.contains("disconnect")) { //$NON-NLS-1$
			return parseDiscon(line);
		} else if (line.contains("Accept") || line.contains("Fail")) { //$NON-NLS-1$ //$NON-NLS-2$
			return parseConn(line);
		} else if (line.contains("Invalid")) { //$NON-NLS-1$
			return parseInvalid(line);
		} else if (line.contains("Server") || line.contains("error")) { //$NON-NLS-1$ //$NON-NLS-2$
			return parseOther(line);
		} else
			return null;
	}

	private Line parseOther(String line) throws ParseException {
		int idx = 0; // use as a counter to traverse tokens produced by split.
		String[] parts = line.split("\\s+"); //$NON-NLS-1$

		SimpleDateFormat format = new SimpleDateFormat(Messages.getString("Parser.TimestampFormat"), Locale.ENGLISH); //$NON-NLS-1$
		Timestamp time = new Timestamp(format.parse(Messages.getString("Parser.Year") +Messages.getString("Parser.TimestampSeperator") + parts[idx++] + Messages.getString("Parser.TimestampSeperator") + parts[idx++] + Messages.getString("Parser.TimestampSeperator") + parts[idx++]) //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
				.getTime());

		Server s = getServer(parts[idx++]);

		String service = parts[idx].substring(0, parts[idx].indexOf("[")); //$NON-NLS-1$
		if (!"sshd".equals(service)) { //$NON-NLS-1$
			throw new ParseException("invalid daemon", 0); //$NON-NLS-1$
		}
		String temp = parts[idx].substring(1 + parts[idx].indexOf("["), //$NON-NLS-1$
				parts[idx++].indexOf("]")); //$NON-NLS-1$
		int connectID = Integer.parseInt(temp);

		int offset = 5; // spaces
		for (int i = 0; i <= idx; i++) {
			offset += parts[i].length();
		}

		String msg = line.substring(offset); // we're just gonna treat the bulk
												// as a text for now.

		return new Other(time, s, connectID, msg, line);
	}

	private Line parseConn(String line) throws ParseException,
			UnknownHostException {
		int idx = 0; // use as a counter to traverse tokens produced by split.
		String[] parts = line.split("\\s+"); //$NON-NLS-1$

		SimpleDateFormat format = new SimpleDateFormat(Messages.getString("Parser.TimestampFormat"), Locale.ENGLISH); //$NON-NLS-1$
		Timestamp time = new Timestamp(format.parse(Messages.getString("Parser.Year") +Messages.getString("Parser.TimestampSeperator") + parts[idx++] + Messages.getString("Parser.TimestampSeperator") + parts[idx++] + Messages.getString("Parser.TimestampSeperator") + parts[idx++]) //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
				.getTime());

		Server s = getServer(parts[idx++]);

		String service = parts[idx].substring(0, parts[idx].indexOf("[")); //$NON-NLS-1$
		if (!"sshd".equals(service)) { //$NON-NLS-1$
			throw new ParseException("invalid daemon", 0); //$NON-NLS-1$
		}
		String temp = parts[idx].substring(1 + parts[idx].indexOf("["), //$NON-NLS-1$
				parts[idx++].indexOf("]")); //$NON-NLS-1$
		int connectID = Integer.parseInt(temp);

		Status status;
		if (parts[idx].equals("Accepted")) { //$NON-NLS-1$
			status = Status.ACCEPTED;
			idx++;
		} else if (parts[idx].equals("Failed")) { //$NON-NLS-1$
			status = Status.FAILED;
			idx++;
		} else
			throw new ParseException("Illegal status for connection attempt", 0); //$NON-NLS-1$

		AuthType auth;
		if (parts[idx].equalsIgnoreCase("password")) { //$NON-NLS-1$
			auth = AuthType.PASS;
			idx++;
		} else if (parts[idx].equalsIgnoreCase("host")) { //$NON-NLS-1$
			auth = AuthType.HOST;
			idx += 2;
		} else if (parts[idx].equalsIgnoreCase("publickey")) { //$NON-NLS-1$
			auth = AuthType.KEY;
			idx++;
		} else if (parts[idx].startsWith("gssapi-")) { //$NON-NLS-1$
			auth = AuthType.GSSAPI;
			idx++;
		} else if (parts[idx].equalsIgnoreCase("none")) { //$NON-NLS-1$
			auth = AuthType.NONE;
			idx++;
		} else
			throw new ParseException("Illegal authentication method string", 0); //$NON-NLS-1$

		idx++; // there's a constant string here, just skip over it.

		User user;
		if (parts[idx].equals("invalid")) { //$NON-NLS-1$
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

		return new Connect(time, s, connectID,
				status, auth, user, address, port, line);
	}

	private Line parseInvalid(String line) throws ParseException,
			UnknownHostException {
		int idx = 0; // use as a counter to traverse tokens produced by split.
		String[] parts = line.split("\\s+"); //$NON-NLS-1$

		SimpleDateFormat format = new SimpleDateFormat(Messages.getString("Parser.TimestampFormat"), Locale.ENGLISH); //$NON-NLS-1$
		Timestamp time = new Timestamp(format.parse(Messages.getString("Parser.Year") +Messages.getString("Parser.TimestampSeperator") + parts[idx++] + Messages.getString("Parser.TimestampSeperator") + parts[idx++] + Messages.getString("Parser.TimestampSeperator") + parts[idx++]) //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
				.getTime());
		
		Server s = getServer(parts[idx++]);

		String service = parts[idx].substring(0, parts[idx].indexOf("[")); //$NON-NLS-1$
		int connectID;
		if (!"sshd".equals(service)) { //$NON-NLS-1$
			throw new ParseException("invalid daemon", 0); //$NON-NLS-1$
		} else {
			String temp = parts[idx].substring(1 + parts[idx].indexOf("["), //$NON-NLS-1$
					parts[idx++].indexOf("]")); //$NON-NLS-1$
			connectID = Integer.parseInt(temp);
		}

		User user;
		if (parts[idx].equalsIgnoreCase("Invalid")) { //$NON-NLS-1$
			idx += 2;
			user = getUser(parts[idx++]);
		} else {
			throw new ParseException("user is not invalid", 0); //$NON-NLS-1$
		}

		idx++; // constant string, skip past it.

		InetAddress addr = anonymiseIP(InetAddress.getByName(parts[idx]));

		return new Invalid(time, s, connectID, user, addr, line);
	}

	private Line parseDiscon(String line) throws ParseException,
			UnknownHostException {
		int idx = 0; // use as a counter to traverse tokens produced by split.
		String[] parts = line.split("\\s+"); //$NON-NLS-1$

		SimpleDateFormat format = new SimpleDateFormat(Messages.getString("Parser.TimestampFormat"), Locale.ENGLISH); //$NON-NLS-1$
		Timestamp time = new Timestamp(format.parse(Messages.getString("Parser.Year") +Messages.getString("Parser.TimestampSeperator") + parts[idx++] + Messages.getString("Parser.TimestampSeperator") + parts[idx++] + Messages.getString("Parser.TimestampSeperator") + parts[idx++]) //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
				.getTime());

		Server s = getServer(parts[idx++]);

		String service = parts[idx].substring(0, parts[idx].indexOf("[")); //$NON-NLS-1$
		int connectID;
		if (!"sshd".equals(service)) { //$NON-NLS-1$
			throw new ParseException("invalid daemon", 0); //$NON-NLS-1$
		} else {
			connectID = Integer.parseInt(parts[idx].substring(
					1 + parts[idx].indexOf("["), parts[idx++].indexOf("]"))); //$NON-NLS-1$ //$NON-NLS-2$
		}

		idx += 3; // constant words "recieved disconnect from", skipping

		InetAddress addr = anonymiseIP(InetAddress.getByName((parts[idx++]
				.replace(":", "")))); // strip //$NON-NLS-1$ //$NON-NLS-2$
		// trailing
		// colon
		// before
		// parsing
		int code = Integer.parseInt(parts[idx].replace(":", "")); // strip //$NON-NLS-1$ //$NON-NLS-2$
																	// trailing
																	// colon
																	// before
																	// parsing

		return new Disconnect(time, s, connectID, code, addr, line);
	}

	private Line parseSubsystem(String line) throws ParseException {
		int idx = 0; // use as a counter to traverse tokens produced by split.
		String[] parts = line.split("\\s+"); //$NON-NLS-1$

		SimpleDateFormat format = new SimpleDateFormat(Messages.getString("Parser.TimestampFormat"), Locale.ENGLISH); //$NON-NLS-1$
		Timestamp time = new Timestamp(format.parse(Messages.getString("Parser.Year") +Messages.getString("Parser.TimestampSeperator") + parts[idx++] + Messages.getString("Parser.TimestampSeperator") + parts[idx++] + Messages.getString("Parser.TimestampSeperator") + parts[idx++]) //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
				.getTime());
		
		Server s = getServer(parts[idx++]);

		String service = parts[idx].substring(0, parts[idx].indexOf("[")); //$NON-NLS-1$
		int connectID;
		if (!"sshd".equals(service)) { //$NON-NLS-1$
			throw new ParseException("invalid daemon", 0); //$NON-NLS-1$
		} else {
			connectID = Integer.parseInt(parts[idx].substring(
					1 + parts[idx].indexOf("["), parts[idx++].indexOf("]"))); //$NON-NLS-1$ //$NON-NLS-2$
			idx++;
		}

		idx += 2; // skip constant string "subsystem request for"

		SubSystem sys;
		if (parts[idx].equals("sftp")) { //$NON-NLS-1$
			sys = SubSystem.SFTP;
		} else if (parts[idx].equals("scp")) { //$NON-NLS-1$
			sys = SubSystem.SCP;
		} else
			throw new ParseException(
					"unrecognised subsystem in subsystem request", 0); //$NON-NLS-1$

		return new SubSystemReq(time, s, connectID, sys, line);
	}

	private Server getServer(String name) {
		if (servers.containsKey(name)) {
			return servers.get(name);
		} else {
			Server s = new Server(name, ""); //$NON-NLS-1$
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
			conn.setAutoCommit(false);

			writeUsersToDB(conn); // ensures users updated with ID's
			conn.commit();
			writeServersToDB(conn); // ensures users updated with ID's
			conn.commit();
			//inserts a line into the database.
			PreparedStatement insertLine = conn
					.prepareStatement("INSERT INTO entry VALUES(" //$NON-NLS-1$
							+ "DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,?, ?)"); //$NON-NLS-1$
			
			//find a single location record matching the source.
			PreparedStatement geoIp = conn.prepareStatement("SELECT geo.locId FROM geo LEFT JOIN " +
					"ip ON geo.locId=ip.locId WHERE MBRCONTAINS(ip.ip_poly, POINTFROMWKB(POINT(INET_ATON(?), 0)))"); //where are we?
			
			//find out how many times we've logged in from this location before
			PreparedStatement freq_loc_query = conn.prepareStatement("SELECT id, count FROM freq_loc WHERE freq_loc.user=? AND freq_loc.locId=?"); 
			
			//updates freq_loc entries, incrementing count if exists, or creating new entry.
			CallableStatement freq_loc_add = conn.prepareCall("{call freq_loc_add(?, ?, ?, ?)}"); //update freq_loc entry, increments if there's a matching one.
			for (int i = 0; i < lines.size(); i++) {
				//writing location/time also tests if entry prompting write counts as frequent.
				lines.get(i).writeLoc(freq_loc_add, geoIp, freq_loc_query); //must be written before entries are written to db.
				// lines.get(i).writeTime(conn);
				lines.get(i).writeToDB(insertLine);
				if ((i % 1000) == 0) { // write it out every thousand lines,
										// just to be sure it all writes.
					insertLine.executeBatch();
					conn.commit();
					System.out.printf("inserted %d lines\n", i); //$NON-NLS-1$
				}
			}
			insertLine.executeBatch(); // flush what's left.
			conn.commit();

		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	private void writeUsersToDB(Connection conn) throws SQLException {
		CallableStatement s = conn.prepareCall("{call insert_user(?, ?)}"); //$NON-NLS-1$
		for (Entry<String, User> u : this.users.entrySet()) {
			u.getValue().writeToDB(s);
		}
	}

	private void writeServersToDB(Connection conn) throws SQLException {
		CallableStatement serve = conn
				.prepareCall("{call insert_server(?, ?)}"); //$NON-NLS-1$
		for (Server s : this.servers.values()) {
			s.writeToDB(serve);
		}
	}

	public static void main(String[] args) {
		if (args.length == 0) {
			System.out.print(Messages.getString("Parser.Usage1")); //$NON-NLS-1$
			System.out
					.print(Messages.getString("Parser.Usage2")); //$NON-NLS-1$
			System.exit(0);
		} else {
			Parser p = new Parser(false);
			p.parseLogs(args);
			p.writeToDB();
		}
	}
}
