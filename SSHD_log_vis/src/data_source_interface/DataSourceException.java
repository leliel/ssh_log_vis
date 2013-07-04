package data_source_interface;

public class DataSourceException extends Exception {

	/**
	 *
	 */
	private static final long serialVersionUID = 746134071568260973L;

	public DataSourceException() {
		super();
	}
	public DataSourceException(String message, Throwable cause) {
		super(message, cause);
	}
	public DataSourceException(String message) {
		super(message);
	}
	public DataSourceException(Throwable cause) {
		super(cause);
	}
}
