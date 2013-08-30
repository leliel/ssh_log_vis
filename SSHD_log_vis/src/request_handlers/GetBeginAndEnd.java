package request_handlers;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;

import javax.naming.NamingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import data_source_interface.DataSourceException;
import data_source_interface.Mysql_Datasource;
import data_source_interface.LogDataSource;

/**
 * Servlet implementation class GetBeginAndEnd
 */
public class GetBeginAndEnd extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private LogDataSource datasource;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetBeginAndEnd() {
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
		long[] answer;
		try {
			String data = request.getParameter("dataset");
			answer = this.datasource.getStartAndEndOfUniverse(Integer.parseInt(data));
		} catch (DataSourceException e) {
			this.getServletContext().log(e.getMessage(), e.getCause());
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return;
		}

		PrintWriter w = response.getWriter();
		w.print("{\"start\": " + answer[0] +
				", \"end\":" + answer[1] +
				"}");
		w.flush();
		response.flushBuffer();
		return;
	}

}
