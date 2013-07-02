package JSONtypes;


import java.sql.Timestamp;

public class Invalid implements JSONtypes.Line {
	private final Timestamp time;
	private final Server server;
	private final int connectID;
	private final String user;
	private final String source;
	private final String rawLine;

	public Invalid(Timestamp time, Server server, int connectID,
			String user, String addr, String rawLine) {
		super();
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.user = user;
		this.source = addr;
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

	public String getUser() {
		return user;
	}

	public String getSource() {
		return source;
	}

	public String getRawLine() {
		return rawLine;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + connectID;
		result = prime * result + ((rawLine == null) ? 0 : rawLine.hashCode());
		result = prime * result + ((server == null) ? 0 : server.hashCode());
		result = prime * result + ((source == null) ? 0 : source.hashCode());
		result = prime * result + ((time == null) ? 0 : time.hashCode());
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
		if (time == null) {
			if (other.time != null) {
				return false;
			}
		} else if (!time.equals(other.time)) {
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
		jsonString.append(", user : \""); jsonString.append(this.user);
		jsonString.append("\", source : \""); jsonString.append(this.source);
		jsonString.append("\", rawLine : \""); jsonString.append(this.rawLine);
		jsonString.append("\"}");
		return jsonString;
	}
}
