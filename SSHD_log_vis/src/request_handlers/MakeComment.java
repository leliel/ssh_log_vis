package request_handlers;

import java.io.IOException;
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
 * Servlet implementation class MakeComment
 */
public class MakeComment extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private LogDataSource datasource;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public MakeComment() {
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
		boolean success = false;
		
		if (request.getParameter("entry_id") == null || request.getParameter("entry_id").equals("")
				|| request.getParameter("comment") == null || request.getParameter("comment").equals("")){
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
		}
		
		try {
			long id = Long.parseLong(request.getParameter("entry_id")); 
			success = this.datasource.writeComment(id, request.getParameter("comment"));
		} catch (DataSourceException e) {
			this.getServletContext().log(e.getMessage(), e.getCause());
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return;
		} catch (NumberFormatException e){
			this.getServletContext().log(e.getMessage(), e.getCause());
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
		}
		
		if (success){
			response.sendError(HttpServletResponse.SC_NO_CONTENT);
		} else {
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
		}
	}

}
