package request_utils;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.zip.GZIPOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class Request_utils {

	public static boolean isGzipSupported(HttpServletRequest request){
		String header = request.getHeader("Accepted-Encoding");
		return (header != null) && (header.contains("gzip"));
	}

	public static boolean isGzipDisabled(HttpServletRequest request){
		String header = request.getHeader("disableGzip");
		return (header != null) && (!header.equalsIgnoreCase("false"));
	}

	public static PrintWriter getGzipWriter(HttpServletResponse response) throws IOException{
		return new PrintWriter(new GZIPOutputStream(response.getOutputStream()));
	}
}
