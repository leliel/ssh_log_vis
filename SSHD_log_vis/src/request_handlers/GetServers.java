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

import JSONtypes.Server;
import data_source_interface.DataSourceException;
import data_source_interface.Mysql_Datasource;
import data_source_interface.LogDataSource;

/**
 * Servlet implementation class GetServers
 */
public class GetServers extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private LogDataSource source;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetServers() {
        super();
    }

	public void init(ServletConfig context){
		try {
			super.init(context);
			this.source = new Mysql_Datasource();
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
			this.source.destroy();
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
		List<Server> servers;
		try {
			servers = this.source.getAllServers(Integer.parseInt(request.getParameter("dataset")));
		} catch (DataSourceException e) {
			this.getServletContext().log(e.getMessage(), e.getCause());
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return;
		}

		PrintWriter w = response.getWriter();
		StringBuilder json = new StringBuilder("[");
		for (Server s :  servers){
			json.append(s.toJsonString());
			json.append(",");
		}
		json.deleteCharAt(json.length() -1);
		json.append("]");
		w.write(json.toString());
		response.flushBuffer();
		return;
	}

}
