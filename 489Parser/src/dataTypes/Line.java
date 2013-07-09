package dataTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public interface Line {

	public void writeToDB(PreparedStatement insertLine) throws SQLException;

	public void writeLoc(CallableStatement freq_loc_add, PreparedStatement geoIP, PreparedStatement lookup) throws SQLException;

	public void writeTime(CallableStatement freq_time_add, PreparedStatement lookup) throws SQLException;
}
