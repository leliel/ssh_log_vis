package dataTypes;

import java.net.InetAddress;
import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;



public class Invalid implements dataTypes.Line {
	private final long time;
	private final Server server;
	private final int connectID;
	private final User user;
	private final InetAddress source;
	private final String rawLine;

	public Invalid(long time, Server server, int connectID,
			User user, InetAddress addr, String rawLine) {
		super();
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.user = user;
		this.source = addr;
		this.rawLine = rawLine;
	}

	public long getTime() {
		return time;
	}

	public Server getServer() {
		return server;
	}

	public int getConnectID() {
		return connectID;
	}

	public User getUser() {
		return user;
	}

	public InetAddress getSource() {
		return source;
	}

	public String getRawLine() {
		return rawLine;
	}

	@Override
	public void writeToDB(PreparedStatement insert) throws SQLException {
		insert.setLong(1, this.time);
		insert.setInt(2, this.server.getId());
		insert.setInt(3, this.connectID);
		insert.setString(4, "invalid");
		insert.setNull(5, Types.CHAR);
		insert.setNull(6, Types.CHAR);
		insert.setInt(7, this.user.getId());
		insert.setString(8, this.source.getHostAddress());
		insert.setNull(9, Types.INTEGER);
		insert.setNull(10, Types.CHAR);
		insert.setNull(11, Types.INTEGER);
		insert.setNull(12, Types.INTEGER);
		insert.setNull(13, Types.INTEGER);
		insert.setString(14, this.rawLine);
		insert.addBatch();
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + connectID;
		result = prime * result + ((rawLine == null) ? 0 : rawLine.hashCode());
		result = prime * result + ((server == null) ? 0 : server.hashCode());
		result = prime * result + ((source == null) ? 0 : source.hashCode());
		result = prime * result + (int) (time ^ (time >>> 32));
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
		Invalid other = (Invalid) obj;
		if (connectID != other.connectID) {
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
		if (time != other.time) {
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

	@Override
	public void writeLoc(CallableStatement freq_loc_add, PreparedStatement geoIP, CallableStatement lookup) throws SQLException {
		return; //do nothing, nothing to do
	}

	@Override
	public void writeTime(CallableStatement freq_time_add,
			CallableStatement lookup) throws SQLException {
		return; //nothing to do.
	}

	@Override
	public int compareTo(Line o) {
		return (int)Math.signum(this.time - o.getTime());
	}

	@Override
	public String toString() {
		return "Invalid [rawLine=" + rawLine + "]";
	}
}
