package Parser;

import java.net.InetAddress;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class GeoLocator {
	private final static String[] priv_loc = {"US", "Redmond"};
	
	private static long inet_ntoa(InetAddress ip){
		long res = 0;
		byte[] bits = ip.getAddress();
		for (int i = 0; i < bits.length; i++){
			res +=  (long)(bits[i] << (i*8));
		}
		return res;
	}

	public static String[] getLocFromIp(InetAddress source, Connection conn)
			throws SQLException {
		Statement s = conn.createStatement();
		if (source.isAnyLocalAddress()){
			return priv_loc;
		}
		ResultSet rs = s
				.executeQuery("SELECT geo.country, geo.city FROM geo LEFT JOIN ip ON geo.locId=ip.locID WHERE "
						+ inet_ntoa(source)
						+ " BETWEEN ip.startIpNum AND ip.endIpNum LIMIT 1");
		if (!rs.first()) {
			rs.close();
			s.close();
			return null;
		} else {
			String[] res = new String[2];
			res[0] = rs.getString(1);
			res[1] = rs.getString(2);
			rs.close();
			s.close();
			return res;
		}
	}

}
