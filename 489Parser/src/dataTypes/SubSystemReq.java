package dataTypes;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;

import enums.SubSystem;

public class SubSystemReq implements dataTypes.Line {
	private final Timestamp time;
	private final Server server;
	private final int connectID;
	private final SubSystem system;
	private final String rawLine;

	public SubSystemReq(Timestamp time, Server server, int connectID,
			SubSystem system, String rawLine) {
		super();
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.system = system;
		this.rawLine = rawLine;
	}

	public Timestamp getTime() {
		return time;
	}

	public Server getServer() {
		return server;
	}

	public int getConnectID() {
		return connectID;
	}

	public SubSystem getSystem() {
		return system;
	}

	public String getRawLine() {
		return rawLine;
	}

	@Override
	public void writeToDB(PreparedStatement insert) throws SQLException {
		insert.setTimestamp(1, this.time);
		insert.setInt(2, this.server.getId());
		insert.setInt(3, this.connectID);
		insert.setString(4, "subsystem");
		insert.setNull(5, Types.CHAR);
		insert.setNull(6, Types.CHAR);
		insert.setNull(7, Types.INTEGER);
		insert.setNull(8, Types.CHAR);
		insert.setNull(9, Types.INTEGER);
		insert.setString(10, this.system.toString().toLowerCase());
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
		result = prime * result + ((system == null) ? 0 : system.hashCode());
		result = prime * result + ((time == null) ? 0 : time.hashCode());
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
		SubSystemReq other = (SubSystemReq) obj;
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
		if (system != other.system) {
			return false;
		}
		if (time == null) {
			if (other.time != null) {
				return false;
			}
		} else if (!time.equals(other.time)) {
			return false;
		}
		return true;
	}

	@Override
	public void writeLoc(CallableStatement freq_loc_add, PreparedStatement geoIP, PreparedStatement lookup) throws SQLException {
		return; //nothing to do
	}

	@Override
	public void writeTime(Connection conn) throws SQLException {
		return; //nothing to do
	}

}
