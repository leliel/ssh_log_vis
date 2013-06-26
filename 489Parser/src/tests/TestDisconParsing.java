package tests;

import static org.junit.Assert.assertEquals;

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
import dataTypes.Disconnect;
import dataTypes.Line;
import dataTypes.Server;

public class TestDisconParsing {
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
	public void test() throws ParseException, UnknownHostException {
		String input = "Nov 23 22:04:58 server sshd[30487]: Received disconnect from 200.54.84.233: 11: Bye Bye ";

		Line output = new Disconnect(new Date(d.parse("Nov 23").getTime()),
				new Time(t.parse("22:04:58").getTime()),
				new Server("server", ""),
				30487,
				11,
				InetAddress.getByName("200.54.84.233"),
				input);

		assertEquals("Parsing failed", output, p.parseLine(input));
	}

}
