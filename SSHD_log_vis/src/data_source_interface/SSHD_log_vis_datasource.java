package data_source_interface;

import java.util.List;

import JSONtypes.Line;

public interface SSHD_log_vis_datasource {

	/**
	 * Fetches log entries for a specified time period.
	 * Optionally server may be left null, this indicates a request for data from *all* servers
	 * in the requested time period.
	 *
	 * Start and end times must not be null, and must be valid dates in yyyy-MM-dd HH:mm:ss
	 * or yyyy-MM-dd patterns.
	 *
	 * @param serverName String name of the server to fetch data for
	 * @param startTime String representation of the earliest time to fetch
	 * @param endTime String representation of the latest time to fetch
	 * @return Empty List if no data found, or a List containing every log entry fetched.
	 */
	public List<Line> getEntriesFromDataSource(String serverName, String startTime, String endTime) throws DataSourceException;

}
