package dataTypes;

import java.sql.Connection;
import java.sql.SQLException;

public interface Line {

	public void writeToDB(Connection conn) throws SQLException;
}
