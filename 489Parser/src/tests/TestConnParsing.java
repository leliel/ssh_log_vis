package tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.net.InetAddress;
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
import dataTypes.Connect;
import dataTypes.Server;
import dataTypes.User;
import enums.AuthType;
import enums.Status;

public class TestConnParsing {
	private Parser p;
	private SimpleDateFormat t;

	@Rule
    public ExpectedException thrown = ExpectedException.none();

	@Before
	public void setUp() {
		p = new Parser(true);
		t = new SimpleDateFormat("YYY MMM dd HH:mm:ss", Locale.ENGLISH);
	}

	@Test
	public void testConnParseGood() {
		String[] input = {
				"Apr 19 17:28:05 app-1 sshd[950]: Accepted password for user1 from 76.191.195.140 port 34472 ssh2",
				"Apr 19 16:56:50 app-1 sshd[817]: Failed password for root from 122.102.64.54 port 56210 ssh2",
				"Jan 28 11:52:05 server sshd[1003]: Accepted publickey for fred from 192.168.3.60 port 20042 ssh2" };
		try {
			Connect[] output = {
					new Connect(
							new Timestamp(t.parse("2013 APR 19 17:28:05").getTime()),
							new Server("app-1", ""),
							950,
							Status.ACCEPTED,
							AuthType.PASS,
							new User("user1"),
							InetAddress.getByName("76.191.195.140"),
							34472,
							"Apr 19 17:28:05 app-1 sshd[950]: Accepted password for user1 from 76.191.195.140 port 34472 ssh2"),
					new Connect(
							new Timestamp(t.parse("2013 APR 19 17:28:05").getTime()),
							new Server("app-1", ""),
							817,
							Status.FAILED,
							AuthType.PASS,
							new User("root"),
							InetAddress.getByName("122.102.64.54"),
							56210,
							"Apr 19 16:56:50 app-1 sshd[817]: Failed password for root from 122.102.64.54 port 56210 ssh2"),
					new Connect(
							new Timestamp(t.parse("2013 APR 19 17:28:05").getTime()),
							new Server("server", ""),
							1003,
							Status.ACCEPTED,
							AuthType.KEY,
							new User("user3"),
							InetAddress.getByName("192.168.3.60"),
							20042,
							"Jan 28 11:52:05 server sshd[1003]: Accepted publickey for fred from 192.168.3.60 port 20042 ssh2") };

			assertEquals("parsing Failed, object do not match", output[0],
					p.parseLine(input[0]));
			assertEquals("parsing Failed, object do not match", output[1],
					p.parseLine(input[1]));
			assertEquals("parsing Failed, object do not match", output[2],
					p.parseLine(input[2]));
		} catch (ParseException e) {
			e.printStackTrace();
			fail("Parsing threw an exception.");
		} catch (UnknownHostException e) {
			e.printStackTrace();
			fail("Unreachable exception");
		}
	}

	@Test
	public void testConnParseBad1() throws ParseException {
		String input = "Apr 19 17:28:05 app-1 sshd[950]: Accept password for user1 from 76.191.195.140 port 34472 ssh2";

		thrown.expect(ParseException.class);
		thrown.expectMessage("Illegal status for connection attempt");
		try {
			p.parseLine(input);
		} catch (UnknownHostException e) {
			e.printStackTrace();
			fail("unreachable exception");
		}

	}

	@Test
	public void testConnParseBad2() throws ParseException {
		String input = "Apr 19 16:56:50 app-1 sshd[817]: Failed passwords for root from 122.102.64.54 port 56210 ssh2";

		thrown.expect(ParseException.class);
		thrown.expectMessage("Illegal authentication method string");
		try {
			p.parseLine(input);
		} catch (UnknownHostException e) {
			e.printStackTrace();
			fail("unreachable exception");
		}
	}
}
