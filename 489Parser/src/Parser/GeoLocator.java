package Parser;

import java.net.InetAddress;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class GeoLocator {
	private final static int priv_loc = 15389;//chosen semirandomly
	
	public static int getLocFromIp(InetAddress source, Connection conn)
			throws SQLException {
		Statement s = conn.createStatement();
		if (source.isSiteLocalAddress()){
			return priv_loc;
		}
		ResultSet rs = s
				.executeQuery("SELECT geo.locId FROM geo LEFT JOIN ip ON geo.locId=ip.locID WHERE INET_NTOA('"
						+ source.getHostAddress()
						+ "') BETWEEN ip.startIpNum AND ip.endIpNum LIMIT 1");
		if (!rs.first()) {
			rs.close();
			s.close();
			return -1;
		} else {
			int res = rs.getInt(1);
			rs.close();
			s.close();
			return res;
		}
	}

}
