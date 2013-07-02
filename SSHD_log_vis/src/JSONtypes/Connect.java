package JSONtypes;

import java.sql.Timestamp;

import enums.AuthType;
import enums.Status;



public class Connect implements JSONtypes.Line {
	private final Timestamp time;
	private final Server server;
	private final int connectID;
	private final Status status;
	private final AuthType type;
	private final String user;
	private final String source;
	private final int port;
	private final long freqTime;
	private final int freqLoc;
	private final String rawLine;

	public Connect(Timestamp time, Server server, int connectID,
			Status status, AuthType type, String user, String address, int port,
			long freqTime, int freqLoc, String rawLine) {
		super();
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.status = status;
		this.type = type;
		this.user = user;
		this.source = address;
		this.port = port;
		this.freqTime = freqTime;
		this.freqLoc = freqLoc;
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

	public Status getStatus() {
		return status;
	}

	public AuthType getType() {
		return type;
	}

	public String getUser() {
		return user;
	}

	public String getSource() {
		return source;
	}

	public int getPort() {
		return port;
	}

	public long getFreqTime() {
		return freqTime;
	}

	public int getFreqLoc() {
		return freqLoc;
	}

	public String getRawLine() {
		return rawLine;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + connectID;
		result = prime * result + freqLoc;
		result = prime * result + (int) (freqTime ^ (freqTime >>> 32));
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
		if (freqLoc != other.freqLoc) {
			return false;
		}
		if (freqTime != other.freqTime) {
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

	@Override
	public StringBuilder toJSONString(StringBuilder jsonString) {
		// jsonString reassigned to self in ternaries as compiler error without assignment of result to something
		jsonString.append("{");
		jsonString.append("time : \""); jsonString.append(time.getTime());
		jsonString.append("\", server : "); jsonString = (this.server != null) ? jsonString.append("\"" + server.getName() + "\"") :  jsonString.append("null");
		jsonString.append(", connectId : "); jsonString.append(this.connectID);
		jsonString.append(", status : \""); jsonString.append(this.status.toString());
		jsonString.append("\", authtype : \""); jsonString.append(this.type.toString());
		jsonString.append("\", user : \""); jsonString.append(this.user);
		jsonString.append("\", source : \""); jsonString.append(this.source);
		jsonString.append("\", port : "); jsonString.append(this.port);
		jsonString.append(", freqTime : "); jsonString.append(this.freqTime);
		jsonString.append(", freqLoc : "); jsonString.append(this.freqLoc);
		jsonString.append(", rawLine : \""); jsonString.append(this.rawLine);
		jsonString.append("\"}");
		return jsonString;
	}

}
