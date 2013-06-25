package tests;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses({ TestConnParsing.class, TestDisconParsing.class,
		TestSubParsing.class})//, TestInvalidParsing.class})
public class AllTests {

}
