package Parser;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class GeoLocator {

	private static long IptoNum(String ip) {
		String[] parts = ip.trim().split(".");
		long result = 0;
		for (int i = 0; i < parts.length; i++) {
			result += (long) (Long.parseLong(parts[i]) * (Math.pow(256d,
					(3 - i))));
		}
		return result;
	}

	private static String NumtoIP(long num) {
		String res = "";
		String temp;
		for (int i = 0; i < 4; i++) {
			temp = ((num / Math.pow(256, (3 - i))) % 256) + "";
			if (i == 3) {
				res += temp;
			} else {
				res += temp + ".";
			}
		}
		return res;
	}

	public static String[] getLocFromIp(String ip, Connection conn)
			throws SQLException {
		Statement s = conn.createStatement();
		long num = IptoNum(ip);
		ResultSet rs = s
				.executeQuery("SELECT geo.city, geo.country FROM geo NATURAL JOIN IP WHERE "
						+ num
						+ " BETWEEN ip.startIpNum AND ip.endIpNum LIMIT 1");
		if (!rs.first()) {
			rs.close();
			s.close();
			return null;
		} else {
			String[] res = new String[2];
			res[0] = rs.getString(2);
			res[1] = rs.getString(1);
			rs.close();
			s.close();
			return res;
		}
	}

}
