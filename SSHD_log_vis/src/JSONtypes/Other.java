package JSONtypes;

import java.sql.Timestamp;

public class Other implements Line {
	private final Timestamp time;
	private final Server server;
	private final int connectID;
	private final String message;
	private final String rawLine;

	public Other(Timestamp time, Server server, int connectID, String message,
			String rawLine) {
		super();
		this.time = time;
		this.server = server;
		this.connectID = connectID;
		this.message = message;
		this.rawLine = rawLine;
	}

	public Timestamp getTime() {
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
		result = prime * result + ((message == null) ? 0 : message.hashCode());
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
