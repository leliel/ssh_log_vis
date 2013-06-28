package JSONtypes;

import java.sql.Timestamp;


public class Entry {
	private Timestamp start;
	private Timestamp end;
	private String flags;
	private final int subElemCount;
	private int acceptedConn;
	private int failedConn;
	private int invalidAttempts;
	private final Line elem;

	public Entry(Timestamp start, Timestamp end, String flags,
			int subElemCount, int acceptedConn, int failedConn, int invalidAttempts, Line elem) {
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
		this.invalidAttempts = invalidAttempts;
		this.elem = elem;
	}

	public Entry(int subElemCount, Line elem) {
		super();
		this.subElemCount = subElemCount;
		this.elem = elem;
		this.acceptedConn = 0;
		this.failedConn = 0;
		this.invalidAttempts = 0;
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

	public boolean hasFlag(String f){
		return this.flags.contains(f);
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

	public void incInvalid() {
		this.invalidAttempts++;
	}

	public int getInvalidAttempts() {
		return invalidAttempts;
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
