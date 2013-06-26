package dataTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

public class Server {

	private int id;
	private final String name;
	private final String block;

	public Server(String name, String block) {
		super();
		this.name = name;
		this.block = block;
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

	public String getBlock() {
		return block;
	}

	public void writeToDB(CallableStatement insert) throws SQLException{
		insert.setString(1, this.name);
		insert.registerOutParameter(2, Types.INTEGER);
		insert.execute();
		this.id = insert.getInt(2);
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((block == null) ? 0 : block.hashCode());
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
		Server other = (Server) obj;
		if (block == null) {
			if (other.block != null) {
				return false;
			}
		} else if (!block.equals(other.block)) {
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
