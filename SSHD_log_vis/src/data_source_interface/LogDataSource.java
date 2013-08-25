package data_source_interface;

import java.util.List;

import JSONtypes.Line;
import JSONtypes.Server;

public interface LogDataSource {

	/**
	 * Fetches log entries for a specified time period.
	 * Optionally server may be left null, this indicates a request for data from *all* servers
	 * in the requested time period.
	 *
	 * Start and end times must not be null, and must be valid UNIX time values
	 * (milliseconds since midnight Jan 1 1970)
	 *
	 * @param serverName String name of the server to fetch data for
	 * @param startTime String representation of the earliest time to fetch
	 * @param endTime String representation of the latest time to fetch
	 * @return Empty List if no data found, or a List containing every log entry fetched.
	 * @throws DataSourceException on any database error
	 */
	public List<Line> getEntriesFromDataSource(String serverName, String source, String user, String startTime, String endTime) throws DataSourceException;

	/**
	 * Fetches earliest and latest entry timestamps in the database
	 * timestamps are read for all servers.
	 *
	 * @return long[] containing start and end
	 * @throws DataSourceException on any database error.
	 */
	public long[] getStartAndEndOfUniverse() throws DataSourceException;

	/**
	 * Fetches list of servers from datastore.
	 * @return List containing all servers known to the database.
	 * @throws DataSourceException if no data returned(this indicates a *serious* data consistency problem, or on any database error)
	 */
	public List<Server> getAllServers() throws DataSourceException;

	/**
	 *  Writes a client provided comment on an event into the database.
	 *
	 * @param entry_id entry identifier the comment should be associated, throws DataSourceException if entry_id does not exist in underlying datasource
 	 * @param comment String containing comment text, this cannot be null or empty.
	 * @return true iff the comment is successfully stored
	 * @throws DataSourceException on any error from underlying datasource.
	 */
	public boolean writeComment(long entry_id, String comment) throws DataSourceException;

	/**
	 * Called when containing servlet unloaded, used to ensure all resources closed appropriately.
	 * @throws DataSourceException if underlying resources fail to close properly.
	 */
	public void destroy() throws DataSourceException;


	public String getNextQuestion(int question_ID) throws DataSourceException;

	public int getParticipantID(String session_id) throws DataSourceException;
}

