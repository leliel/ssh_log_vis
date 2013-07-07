package JSONtypes;

import java.sql.Timestamp;

import enums.SubSystem;

public class SubSystemReq implements JSONtypes.Line {
	private final int id;
	private final Timestamp time;
	private final Server server;
	private final int connectID;
	private final SubSystem system;
	private final String rawLine;

	public SubSystemReq(int id, Timestamp time, Server server, int connectID,
			SubSystem system, String rawLine) {
		super();
		this.id = id;
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.system = system;
		this.rawLine = rawLine;
	}

	public int getId(){
		return id;
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
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + connectID;
		result = prime * result + id;
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
		if (id != other.id) {
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
		StringBuilder jsonString = new StringBuilder("{");
		jsonString.append("\"id\":"); jsonString.append(this.id);
		jsonString.append(",\"time\":"); jsonString.append(time.getTime());
		if (this.server != null){
		jsonString.append(",\"server\":"); jsonString.append(this.server.toJsonString());
		} else {
			jsonString.append(",\"server\":"); jsonString.append("null");
		}
		jsonString.append(",\"connectId\":"); jsonString.append(this.connectID);
		jsonString.append(",\"subsystem\":\""); jsonString.append(this.system.toString());
		jsonString.append("\",\"rawLine\":\""); jsonString.append(this.rawLine);
		jsonString.append("\"}");
		return jsonString.toString();
	}

	@Override
	public String toString() {
		return "SubSystemReq [rawLine=" + rawLine + "]";
	}
}
