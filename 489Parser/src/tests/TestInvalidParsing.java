package tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.sql.Date;
import java.sql.Time;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Locale;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import Parser.Parser;
import dataTypes.Invalid;
import dataTypes.Server;
import dataTypes.User;

public class TestInvalidParsing {

	private Parser p;
	private SimpleDateFormat d, t;

	@Rule
    public ExpectedException thrown = ExpectedException.none();

	@Before
	public void setUp() {
		p = new Parser(true);
		d = new SimpleDateFormat("MMM dd", Locale.ENGLISH);
		t = new SimpleDateFormat("HH:mm:ss");
	}

	@Test
	public void testInvalidParseGood() throws UnknownHostException {
		String input = "Apr 19 04:36:49 app-1 sshd[6990]: Invalid user tomcat from 203.81.226.86";
		try {
			Invalid output =
					new Invalid(
							new Date(d.parse("Apr 19").getTime()),
							new Time(t.parse("04:36:49").getTime()),
							new Server("app-1", ""),
							6990,
							new User("user1"),
							InetAddress.getByName("203.81.226.86"),
							"Apr 19 04:36:49 app-1 sshd[6990]: Invalid user tomcat from 203.81.226.86");


			assertEquals("parsing Failed, object do not match", output,
					p.parseLine(input));
		} catch (ParseException e) {
			e.printStackTrace();
			fail("Parsing threw an exception.");
		}
	}
}
