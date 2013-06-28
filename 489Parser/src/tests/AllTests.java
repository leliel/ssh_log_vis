package tests;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses({ TestConnParsing.class, TestDisconParsing.class,
		TestSubParsing.class, TestInvalidParsing.class, TestOtherParsing.class})
public class AllTests {
//TODO fix tests for new api -using timestamps instead of seperate date and time
}
