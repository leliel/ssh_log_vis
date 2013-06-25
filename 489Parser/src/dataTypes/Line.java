package dataTypes;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public interface Line {

	public void writeToDB(PreparedStatement insertLine) throws SQLException;

	public void writeLoc(Connection conn) throws SQLException;

	public void writeTime(Connection conn) throws SQLException;
}
