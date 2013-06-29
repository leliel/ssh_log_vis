package Parser;

import java.net.InetAddress;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class GeoLocator {
	private final static int priv_loc = 15389;//chosen semirandomly
	
	public static int getLocFromIp(InetAddress source, PreparedStatement geoIP)
			throws SQLException {

		if (source.isSiteLocalAddress()){
			return priv_loc;
		}
		geoIP.setString(1, source.getHostAddress());
		ResultSet rs = geoIP.executeQuery();
		if (!rs.first()) {
			rs.close();
			return -1;
		} else {
			int res = rs.getInt(1);
			rs.close();
			return res;
		}
	}

}
