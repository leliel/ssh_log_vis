package dataTypes;

import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.sql.Time;

public class Invalid implements dataTypes.Line {
	private final Date date;
	private final Time time;
	private final Server server;
	private final User user;
	private final String source;
	private final String rawLine;
	

	public Invalid(Date date, Time time, Server server, User user,
			String source, String rawLine) {
		super();
		if (!user.isValid()){
			this.date = date;
			this.time = time;
			this.server = server;
			this.user = user;
			this.source = source;
			this.rawLine = rawLine;
		} else throw new IllegalArgumentException("cannot have a valid user on this line");
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

	public User getUser() {
		return user;
	}

	public String getSource() {
		return source;
	}
	
	public String getRawLine(){
		return rawLine;
	}

	@Override
	public void writeToDB(Connection conn) throws SQLException {
		// TODO Auto-generated method stub
		
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((date == null) ? 0 : date.hashCode());
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
}
