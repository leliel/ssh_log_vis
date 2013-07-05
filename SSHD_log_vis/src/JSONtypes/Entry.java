package JSONtypes;

import java.sql.Timestamp;


public class Entry {
	private final int id;
	private Timestamp start;
	private Timestamp end;
	private String flags;
	private long subElemCount;
	private int acceptedConn;
	private int failedConn;
	private int invalidAttempts;
	private Line elem;

	public Entry(int id, Line elem) {
		super();
		this.id = id;
		this.elem = elem;
		this.subElemCount = 0;
		this.acceptedConn = 0;
		this.failedConn = 0;
		this.invalidAttempts = 0;
	}

	public int getId(){
		return id;
	}

	public Timestamp getStart() {
		return start;
	}

	public void setStart(Timestamp t){
		this.start = t;
	}

	public Timestamp getEnd() {
		return end;
	}

	public void setEnd(Timestamp t){
		this.end = t;
	}

	public String getFlags() {
		return flags;
	}

	public void addFlag(String f){
		if (f != null && !f.equals("")){
			this.flags += f;
		}
	}

	public boolean hasFlag(String f){
		return this.flags.contains(f);
	}

	public long getSubElemCount() {
		return subElemCount;
	}

	public void incSubElemCount(){
		this.subElemCount++;
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
		StringBuilder json = new StringBuilder("{");
		json.append("\"id\":"); json.append(this.id);
		json.append(",\"startTime\":"); json.append(this.start.getTime());
		json.append(",\"endTime\":"); json.append(this.end.getTime());
		if (this.flags == null || this.flags.equals("")) {
			json.append(",\"flags\":"); json.append("null");
		} else {
			json.append(",\"flags\":\""); json.append(this.flags + "\"");
		}
		json.append(",\"subElemCount\":"); json.append(this.subElemCount);
		json.append(",\"acceptedConn\":"); json.append(this.acceptedConn);
		json.append(",\"failedConn\":"); json.append(this.failedConn);
		json.append(",\"invalidAttempts\":"); json.append(this.invalidAttempts);
		if (this.elem == null){
			json.append(",\"elem\":"); json.append("null");
		} else {
			json.append(",\"elem\":"); json.append(this.elem.toJSONString());
		}
		json.append("}");
		return json.toString();
	}

	public void setElem(Line l) {
		this.elem = l;
	}
}
