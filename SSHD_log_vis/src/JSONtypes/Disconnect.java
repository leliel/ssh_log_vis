package JSONtypes;


public class Disconnect implements JSONtypes.Line {
	private final int id;
	private final long time;
	private final Server server;
	private final int connectID;
	private final int code;
	private final String addr;
	private final String rawLine;

	public Disconnect(int id, long time, Server server,
			int connectID, int code, String addr2, String rawLine) {
		super();
		this.id = id;
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.code = code;
		this.addr = addr2;
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
		result = prime * result + id;
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
		jsonString.append(",\"code\":"); jsonString.append(this.code);
		jsonString.append(",\"source\":\""); jsonString.append(this.addr);
		jsonString.append("\",\"rawLine\":\""); jsonString.append(this.rawLine);
		jsonString.append("\"}");
		return jsonString.toString();
	}

	@Override
	public String toString() {
		return "Disconnect [rawLine=" + rawLine + "]";
	}
}
