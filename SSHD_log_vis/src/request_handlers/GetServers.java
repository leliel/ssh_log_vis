package request_handlers;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import JSONtypes.Server;
import data_source_interface.DataSourceException;
import data_source_interface.Mysql_Datasource;
import data_source_interface.SSHD_log_vis_datasource;

/**
 * Servlet implementation class GetServers
 */
public class GetServers extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private SSHD_log_vis_datasource source;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetServers() {
        super();
        this.source = new Mysql_Datasource();
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
			servers = this.source.getAllServers();
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
