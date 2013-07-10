package JSONtypes;

import java.util.HashMap;
import java.util.Map;

public class Flags {
	private Map<String, Integer> map;

	public Flags() {
		this.map = new HashMap<String, Integer>();
	}

	public void addFlag(String flag){
		if (this.map.containsKey(flag)){
			this.map.put(flag, this.map.get(flag)+1);
		} else {
			this.map.put(flag, 1);
		}
	}

	public boolean contains(String flag){
		return this.map.containsKey(flag) && this.map.get(flag) != null;
	}

	public String toJSONString(){
		StringBuilder json = new StringBuilder("{");
		for (Map.Entry<String, Integer> e : this.map.entrySet()){
			json.append("\"" + e.getKey() + "\":");
			json.append(e.getValue() + ",");
		}
		json.deleteCharAt(json.length() - 1); // clunky, but should strip out trailing ,
		json.append("}");
		return json.toString();
	}

	public boolean empty() {
		return this.map.isEmpty();
	}

}
