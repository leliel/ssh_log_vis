package dataTypes;

import java.sql.PreparedStatement;
import java.sql.SQLException;

public interface Line {

	public void writeToDB(PreparedStatement insertLine) throws SQLException;
}
