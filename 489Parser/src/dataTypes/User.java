package dataTypes;

import java.sql.CallableStatement;
import java.sql.SQLException;
import java.sql.Types;


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

	public void writeToDB(CallableStatement call) throws SQLException {
		call.setString(1,  this.name);
		call.setBoolean(2, this.isValid);
		call.registerOutParameter(3, Types.INTEGER);
		if (this.name.equals("user3")){
			System.out.println("breaking here");
		}
		call.execute();
		this.id = call.getInt(3);
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
