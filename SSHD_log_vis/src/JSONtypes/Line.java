package JSONtypes;



public interface Line {

	public String toJSONString();
	public long getTime();
	public Server getServer();
	public int getConnectID();
	public int getId();
}
