package dataTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;

public class Other implements Line {
	private final long time;
	private final Server server;
	private final int connectID;
	private final String message;
	private final String rawLine;

	public Other(long time, Server server, int connectID, String message,
			String rawLine) {
		super();
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.message = message;
		this.rawLine = rawLine;
	}

	public long getTime() {
		return time;
	}
	public Server getServer() {
		return server;
	}
	public int getConnectID(){
		return connectID;
	}
	public String getMessage() {
		return message;
	}

	public String getRawLine() {
		return rawLine;
	}

	@Override
	public void writeToDB(PreparedStatement insert) throws SQLException {
		insert.setLong(1, this.time);
		insert.setInt(2, this.server.getId());
		insert.setInt(3, this.connectID);
		insert.setString(4, "other");
		insert.setNull(5, Types.CHAR);
		insert.setNull(6, Types.CHAR);
		insert.setNull(7, Types.INTEGER);
		insert.setNull(8, Types.CHAR);
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
		result = prime * result + ((message == null) ? 0 : message.hashCode());
		result = prime * result + ((rawLine == null) ? 0 : rawLine.hashCode());
		result = prime * result + ((server == null) ? 0 : server.hashCode());
		result = prime * result + (int) (time ^ (time >>> 32));
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
		Other other = (Other) obj;
		if (connectID != other.connectID) {
			return false;
		}
		if (message == null) {
			if (other.message != null) {
				return false;
			}
		} else if (!message.equals(other.message)) {
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
		if (time != other.time) {
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
		return "Other [rawLine=" + rawLine + "]";
	}
}
