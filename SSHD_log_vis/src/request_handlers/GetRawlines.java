package request_handlers;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.List;

import javax.naming.NamingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import JSONtypes.Line;
import data_source_interface.DataSourceException;
import data_source_interface.Mysql_Datasource;
import data_source_interface.LogDataSource;

/**
 * Servlet implementation class GetRawlines
 */
public class GetRawlines extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String JSONMimeType = "application/json";
	private LogDataSource datasource;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetRawlines() {
        super();
    }
    
	public void init(ServletConfig context){
		try {
			super.init(context);
			this.datasource = new Mysql_Datasource();
		} catch (ServletException e) {
			this.getServletContext().log(e.getMessage(), e.getCause());
			return;
		} catch (NamingException e) {
			this.getServletContext().log(e.getMessage(), e.getCause());
			return;
		} catch (SQLException e) {
			this.getServletContext().log(e.getMessage(), e.getCause());
			return;
		}
	}
	
	public void destroy(){
		try {
			this.datasource.destroy();
		} catch (DataSourceException e) {
			this.getServletContext().log(e.getMessage(), e.getCause());
		}
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		List<Line> lines;
		if (request.getParameter("startTime") == null
				|| request.getParameter("endTime") == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}
		try {
			lines = datasource.getEntriesFromDataSource(
					request.getParameter("serverName"),
					request.getParameter("source"),
					request.getParameter("user"),
					request.getParameter("startTime"),
					request.getParameter("endTime"));
		} catch(DataSourceException e) {
			this.getServletContext().log(e.getMessage(), e.getCause());
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return;
		}

		if (lines.size() == 0){
			response.setStatus(HttpServletResponse.SC_NO_CONTENT);
			return;
		}

		response.setContentType(GetRawlines.JSONMimeType);
		PrintWriter resp = response.getWriter();
		StringBuilder json = new StringBuilder("[");
		for (Line l : lines){
			json.append(l.toJSONString());
			json.append(",");
		}
		json.deleteCharAt(json.length() - 1);
		json.append("]");
		resp.write(json.toString());
		resp.flush();
	}
}
