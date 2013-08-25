package experiment_Frame;

import java.io.IOException;
import java.sql.SQLException;

import javax.naming.NamingException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import data_source_interface.DataSourceException;
import data_source_interface.LogDataSource;
import data_source_interface.Mysql_Datasource;

public class Question_Page extends HttpServlet {


	/**
	 * 
	 */
	private static final long serialVersionUID = 3153350496051606938L;
	private LogDataSource datasource;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public Question_Page() {
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
		HttpSession session = request.getSession(true);
		if (session.isNew()){
			session.setAttribute("database", true);
			session.setAttribute("currentQuestion", 0);
			try {
				session.setAttribute("participant", this.datasource.getParticipantID(session.getId()));
			} catch (DataSourceException e) {
				this.getServletContext().log(e.getMessage(), e.getCause());
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				return;
			}
		} else {
			int currentQ = ((Integer)session.getAttribute("currentQuestion")).intValue();
			session.setAttribute("currentQuestion", ++currentQ);
			boolean db = !((Boolean)session.getAttribute("database")).booleanValue();
			session.setAttribute("database", db);
		}
		if (request.getParameter("getQuestion") != null){
			getQuestion(request, response);
			return;
		} else if (request.getParameter("sendAnswer") != null) {
			sendAnswer(request, response);
			return;
		}
	}
	
	private void sendAnswer(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		HttpSession sess = request.getSession();
		int part_id = ((Integer)sess.getAttribute("participant")).intValue();
		String answer = request.getParameter("ans");
		if (answer == null || part_id == -1) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
		}
		//FIXME implement writing.
		this.datasource.writeAnswer(part_id, answer);
	}
	
	private void getQuestion(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		HttpSession session = request.getSession();
		int q_ID = ((Integer)session.getAttribute("currentQuestion")).intValue();
		String question;
		try {
			question = this.datasource.getNextQuestion(q_ID);
		} catch (DataSourceException e) {
			this.getServletContext().log(e.getMessage(), e.getCause());
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return;
		}
		
		response.setContentType("text");
		response.getWriter().write(question);
	}
	
}
