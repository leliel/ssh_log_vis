package JSONtypes;

import java.sql.Timestamp;


public interface Line {

	public StringBuilder toJSONString(StringBuilder json);
	public Timestamp getTime();
	public Server getServer();
	public int getConnectID();

}
