package JSONtypes;

import java.sql.Timestamp;


public interface Line {

	public String toJSONString();
	public Timestamp getTime();
	public Server getServer();
	public int getConnectID();

}
