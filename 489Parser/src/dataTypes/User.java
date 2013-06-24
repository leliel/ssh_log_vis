package dataTypes;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class User {
	private int id;
	private final String name;
	private final boolean isValid;
	
	public User(String name, boolean isValid) {
		super();
		this.name = name;
		this.isValid = isValid;
	}
	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}
	public boolean isValid() {
		return isValid;
	}
	
	public void writeToDB(PreparedStatement s1, PreparedStatement s2) throws SQLException{
		s1.setString(1, this.name);
		s1.setBoolean(2, this.isValid);
		s1.executeUpdate();
		ResultSet rs = s2.executeQuery();
		rs.next();
		this.id = rs.getInt(1);
		rs.close();
	}
	
	
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (isValid ? 1231 : 1237);
		result = prime * result + ((name == null) ? 0 : name.hashCode());
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
		User other = (User) obj;
		if (isValid != other.isValid) {
			return false;
		}
		if (name == null) {
			if (other.name != null) {
				return false;
			}
		} else if (!name.equals(other.name)) {
			return false;
		}
		return true;
	}
}
