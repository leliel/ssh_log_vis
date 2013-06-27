package JSONtypes;

import java.sql.Date;
import java.sql.Time;

public class Disconnect implements JSONtypes.Line {
	private final Date date;
	private final Time time;
	private final Server server;
	private final int connectID;
	private final int code;
	private final String addr;
	private final String rawLine;

	public Disconnect(Date date, Time time, Server server,
			int connectID, int code, String addr2, String rawLine) {
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

	public String getAddress(){
		return addr;
	}

	public String getRawLine(){
		return rawLine;
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
	public String toJSONString() {
		// TODO Auto-generated method stub
		return null;
	}
}
