package JSONtypes;


public class Other implements Line {
	private final int id;
	private final long time;
	private final Server server;
	private final int connectID;
	private final String message;
	private final String rawLine;

	public Other(int id, long time, Server server, int connectID, String message,
			String rawLine) {
		super();
		this.id = id;
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.message = message;
		this.rawLine = rawLine;
	}

	public int getId(){
		return id;
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
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + connectID;
		result = prime * result + id;
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
		if (id != other.id) {
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
	public String toJSONString() {
		StringBuilder jsonString = new StringBuilder("{");
		jsonString.append("\"id\":"); jsonString.append(this.id);
		jsonString.append(",\"time\":"); jsonString.append(time);
		if (this.server != null){
		jsonString.append(",\"server\":"); jsonString.append(this.server.toJsonString());
		} else {
			jsonString.append(",\"server\":"); jsonString.append("null");
		}
		jsonString.append(",\"connectId\":"); jsonString.append(this.connectID);
		jsonString.append(",\"message\":\""); jsonString.append(this.message);
		jsonString.append("\",\"rawLine\":\""); jsonString.append(this.rawLine);
		jsonString.append("\"}");
		return jsonString.toString();
	}

	@Override
	public String toString() {
		return "Other [rawLine=" + rawLine + "]";
	}
}
