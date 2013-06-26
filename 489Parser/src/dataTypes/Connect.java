package dataTypes;

import java.net.InetAddress;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Time;
import java.sql.Timestamp;
import java.sql.Types;

import Parser.GeoLocator;
import enums.AuthType;
import enums.Status;

public class Connect implements dataTypes.Line {
	private final Date date;
	private final Time time;
	private final Server server;
	private final int connectID;
	private final Status status;
	private final AuthType type;
	private final User user;
	private final InetAddress source;
	private final int port;
	private final String rawLine;

	public Connect(Date date, Time time, Server server, int connectID,
			Status status, AuthType type, User user, InetAddress address, int port,
			String rawLine) {
		super();
		this.date = date;
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.status = status;
		this.type = type;
		this.user = user;
		this.source = address;
		this.port = port;
		this.rawLine = rawLine;
	}

	public Date getDate() {
		return date;
	}

	public Time getTime() {
		return time;
	}

	public Server getServer() {
		return server;
	}

	public int getConnectID() {
		return connectID;
	}

	public Status getStatus() {
		return status;
	}

	public AuthType getType() {
		return type;
	}

	public User getUser() {
		return user;
	}

	public InetAddress getSource() {
		return source;
	}

	public int getPort() {
		return port;
	}

	public String getRawLine() {
		return rawLine;
	}

	@Override
	public void writeToDB(PreparedStatement insert) throws SQLException {
		insert.setTimestamp(1,
				new Timestamp(this.date.getTime() + this.time.getTime()));
		insert.setInt(2, this.server.getId());
		insert.setInt(3, this.connectID);
		insert.setString(4, "connect");
		insert.setString(5, this.type.toString().toLowerCase());
		insert.setString(6, this.status.toString().toLowerCase());
		insert.setInt(7, this.user.getId());
		insert.setString(8, this.source.getHostAddress());
		insert.setInt(9, this.port);
		insert.setNull(10, Types.CHAR);
		insert.setNull(11, Types.INTEGER);
		insert.setString(12, this.rawLine);
		insert.addBatch();
	}

	@Override
	public void writeLoc(Connection conn) throws SQLException {
		if (this.status == Status.ACCEPTED) { // don't record locations for
												// failed logins
			if (this.user.getName().equals("user3")){
				System.out.println("user3 being used. id = " + this.user.getId());
			}
			CallableStatement s = conn.prepareCall("{call freq_loc_add(?, ?, ?)}");
			String[] loc = GeoLocator.getLocFromIp(this.source, conn);
			if (loc != null && !loc[1].equals("") ) {
				s.setInt(1, this.user.getId());
				s.setString(2, loc[0]);
				s.setString(3, loc[1]);
				s.execute();
				return;
			} else if (loc != null && loc[1].equals("")){
				s.setInt(1, this.user.getId());
				s.setString(2, loc[0]);
				s.setNull(3, Types.CHAR);
				s.execute();
				return;
			}
		}
	}

	@Override
	public void writeTime(Connection conn) throws SQLException {
		// TODO Auto-generated method stub

	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + connectID;
		result = prime * result + ((date == null) ? 0 : date.hashCode());
		result = prime * result + port;
		result = prime * result + ((rawLine == null) ? 0 : rawLine.hashCode());
		result = prime * result + ((server == null) ? 0 : server.hashCode());
		result = prime * result + ((source == null) ? 0 : source.hashCode());
		result = prime * result + ((status == null) ? 0 : status.hashCode());
		result = prime * result + ((time == null) ? 0 : time.hashCode());
		result = prime * result + ((type == null) ? 0 : type.hashCode());
		result = prime * result + ((user == null) ? 0 : user.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		Connect other = (Connect) obj;
		if (connectID != other.connectID) {
			return false;
		}
		if (date == null) {
			if (other.date != null) {
				return false;
			}
		} else if (!date.equals(other.date)) {
			return false;
		}
		if (port != other.port) {
			return false;
		}
		if (rawLine == null) {
			if (other.rawLine != null) {
				return false;
			}
		} else if (!rawLine.equals(other.rawLine)) {
			return false;
		}
		if (server == null) {
			if (other.server != null) {
				return false;
			}
		} else if (!server.equals(other.server)) {
			return false;
		}
		if (source == null) {
			if (other.source != null) {
				return false;
			}
		} else if (!source.equals(other.source)) {
			return false;
		}
		if (status != other.status) {
			return false;
		}
		if (time == null) {
			if (other.time != null) {
				return false;
			}
		} else if (!time.equals(other.time)) {
			return false;
		}
		if (type != other.type) {
			return false;
		}
		if (user == null) {
			if (other.user != null) {
				return false;
			}
		} else if (!user.equals(other.user)) {
			return false;
		}
		return true;
	}

}
