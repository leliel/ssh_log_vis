package tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

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
import dataTypes.Other;
import dataTypes.Server;

public class TestOtherParsing {


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
	public void testOtherParseGood() throws UnknownHostException {
		String[] input = {"Mar 16 08:25:22 app-1 sshd[4884]: Server listening on :: port 22.",
						"Mar 16 08:25:22 app-1 sshd[4884]: error: Bind to port 22 on 0.0.0.0 failed: Address already in use."};
		try {
			Other[] output = {
					new Other(
							new Date(d.parse("Mar 16").getTime()),
							new Time(t.parse("08:25:22").getTime()),
							new Server("app-1", ""),
							4884,
							"Server listening on :: port 22.",
							"Mar 16 08:25:22 app-1 sshd[4884]: Server listening on :: port 22."),
					new Other(new Date(d.parse("Mar 16").getTime()),
							new Time(t.parse("08:25:22").getTime()),
							new Server("app-1", ""),
							4884,
							"error: Bind to port 22 on 0.0.0.0 failed: Address already in use.",
							"Mar 16 08:25:22 app-1 sshd[4884]: error: Bind to port 22 on 0.0.0.0 failed: Address already in use.")};


			assertEquals("parsing Failed, object do not match", output[0],
					p.parseLine(input[0]));
			assertEquals("parsing Failed, object do not match", output[1],
					p.parseLine(input[1]));
		} catch (ParseException e) {
			e.printStackTrace();
			fail("Parsing threw an exception.");
		}
	}
}
