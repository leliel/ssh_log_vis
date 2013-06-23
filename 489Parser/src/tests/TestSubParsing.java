package tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

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
import dataTypes.Server;
import dataTypes.SubSystemReq;
import enums.SubSystem;

public class TestSubParsing {
	private Parser p;
	private SimpleDateFormat d, t;
	
	@Rule
    public ExpectedException thrown = ExpectedException.none();
	
	@Before
	public void setUp() {
		p = new Parser();
		d = new SimpleDateFormat("MMM dd", Locale.ENGLISH);
		t = new SimpleDateFormat("HH:mm:ss");
	}

	@Test
	public void testSubParseGood() {
		String[] input = {
				"Jan 28 11:43:11 server sshd[9813]: subsystem request for sftp",
				"Apr 20 12:02:49 app-1 sshd[30800]: subsystem request for scp"};
		try {
			SubSystemReq[] output = {
					new SubSystemReq(
							new Date(d.parse("Jan 28").getTime()),
							new Time(t.parse("11:43:11").getTime()),
							new Server("server", ""),
							9813,
							SubSystem.SFTP,
							"Jan 28 11:43:11 server sshd[9813]: subsystem request for sftp"),
					new SubSystemReq(
							new Date(d.parse("Apr 20").getTime()),
							new Time(t.parse("12:02:49").getTime()),
							new Server("app-1", ""),
							30800,
							SubSystem.SCP,
							"Apr 20 12:02:49 app-1 sshd[30800]: subsystem request for scp")};

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
