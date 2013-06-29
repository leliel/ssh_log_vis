package tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.net.UnknownHostException;
import java.sql.Timestamp;
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
	private SimpleDateFormat t;

	@Rule
    public ExpectedException thrown = ExpectedException.none();

	@Before
	public void setUp() {
		p = new Parser(true);
		t = new SimpleDateFormat("YYYY MMM dd HH:mm:ss", Locale.ENGLISH);
	}

	@Test
	public void testSubParseGood() throws UnknownHostException {
		String[] input = {
				"Jan 28 11:43:11 server sshd[9813]: subsystem request for sftp",
				"Apr 20 12:02:49 app-1 sshd[30800]: subsystem request for scp"};
		try {
			SubSystemReq[] output = {
					new SubSystemReq(
							new Timestamp(t.parse("2013 Jan 28 11:43:11").getTime()),
							new Server("server", ""),
							9813,
							SubSystem.SFTP,
							"Jan 28 11:43:11 server sshd[9813]: subsystem request for sftp"),
					new SubSystemReq(
							new Timestamp(t.parse("2013 Apr 20 12:02:49").getTime()),
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
