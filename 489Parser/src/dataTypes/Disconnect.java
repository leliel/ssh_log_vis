package dataTypes;

import java.net.InetAddress;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Time;
import java.sql.Timestamp;
import java.sql.Types;

public class Disconnect implements dataTypes.Line {
	private final Date date;
	private final Time time;
	private final Server server;
	private final int connectID;
	private final int code;
	private final InetAddress addr;
	private final String rawLine;

	public Disconnect(Date date, Time time, dataTypes.Server server,
			int connectID, int code, InetAddress addr2, String rawLine) {
		super();
		this.date = date;
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.code = code;
		this.addr = addr2;
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

	public int getCode() {
		return code;
	}

	public InetAddress getAddress(){
		return addr;
	}

	public String getRawLine(){
		return rawLine;
	}

	@Override
	public void writeToDB(PreparedStatement insert) throws SQLException {
		insert.setTimestamp(1, new Timestamp(this.date.getTime() + this.time.getTime()));
		insert.setInt(2, this.server.getId());
		insert.setInt(3, this.connectID);
		insert.setString(4, "disconnect");
		insert.setNull(5, Types.CHAR);
		insert.setNull(6, Types.CHAR);
		insert.setNull(7, Types.INTEGER);
		insert.setString(8, this.addr.getHostAddress());
		insert.setNull(9, Types.INTEGER);
		insert.setNull(10, Types.CHAR);
		insert.setInt(11, this.code);
		insert.setNull(12, Types.BOOLEAN);
		insert.setNull(13, Types.BOOLEAN);
		insert.setString(14, this.rawLine);
		insert.addBatch();
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((addr == null) ? 0 : addr.hashCode());
		result = prime * result + code;
		result = prime * result + connectID;
		result = prime * result + ((date == null) ? 0 : date.hashCode());
		result = prime * result + ((rawLine == null) ? 0 : rawLine.hashCode());
		result = prime * result + ((server == null) ? 0 : server.hashCode());
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
		Disconnect other = (Disconnect) obj;
		if (addr == null) {
			if (other.addr != null) {
				return false;
			}
		} else if (!addr.equals(other.addr)) {
			return false;
		}
		if (code != other.code) {
			return false;
		}
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
	public void writeLoc(Connection conn) throws SQLException {
		return; //do nothing, nothing to do
	}

	@Override
	public void writeTime(Connection conn) throws SQLException {
		return; //nothing to do.
	}

}
