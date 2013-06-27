package JSONtypes;

import java.sql.Date;
import java.sql.Time;

import enums.SubSystem;

public class SubSystemReq implements JSONtypes.Line {
	private final Date date;
	private final Time time;
	private final Server server;
	private final int connectID;
	private final SubSystem system;
	private final String rawLine;

	public SubSystemReq(Date date, Time time, Server server, int connectID,
			SubSystem system, String rawLine) {
		super();
		this.date = date;
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.system = system;
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

	public SubSystem getSystem() {
		return system;
	}

	public String getRawLine() {
		return rawLine;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + connectID;
		result = prime * result + ((date == null) ? 0 : date.hashCode());
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
	public String toJSONString() {
		// TODO Auto-generated method stub
		return null;
	}

}
