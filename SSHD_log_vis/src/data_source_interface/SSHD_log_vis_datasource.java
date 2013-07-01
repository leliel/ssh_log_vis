package data_source_interface;

import java.util.List;

import JSONtypes.Line;

public interface SSHD_log_vis_datasource {

	public List<Line> getEntriesFromDataSource(String serverName, String startTime, String endTime);

}
