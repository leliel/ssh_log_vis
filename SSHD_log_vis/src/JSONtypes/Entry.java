package JSONtypes;

import java.sql.Timestamp;


public class Entry {
	private Timestamp start;
	private Timestamp end;
	private String flags;
	private final int subElemCount;
	private int acceptedConn;
	private int failedConn;
	private final Line elem;
	
	public Entry(Timestamp start, Timestamp end, String flags,
			int subElemCount, int acceptedConn, int failedConn, Line elem) {
		super();
		if (subElemCount != 0 && elem != null){
			throw new IllegalArgumentException("elem only exists for singleton Entries");
		}
		this.start = start;
		this.end = end;
		this.flags = flags;
		this.subElemCount = subElemCount;
		this.acceptedConn = acceptedConn;
		this.failedConn = failedConn;
		this.elem = elem;
	}
	
	public Entry(int subElemCount, Line elem) {
		super();
		this.subElemCount = subElemCount;
		this.elem = elem;
	}


	public Timestamp getStart() {
		return start;
	}

	public Timestamp getEnd() {
		return end;
	}

	public String getFlags() {
		return flags;
	}
	
	public void addFlag(String f){
		this.flags += f;
	}

	public int getSubElemCount() {
		return subElemCount;
	}

	public int getAcceptedConn() {
		return acceptedConn;
	}
	
	public void incAcceptedConn(){
		this.acceptedConn++;
	}

	public int getFailedConn() {
		return failedConn;
	}
	
	public void incFailedConn(){
		this.failedConn++;
	}

	public Line getElem() {
		return elem;
	}
	
	public String toJSONString(){
		String res = "";
		//TODO complete Entry toJSON method.
		if (elem != null){
			res += "{" + elem.toJSONString() + "}";
		}
		return res;
	}
}
