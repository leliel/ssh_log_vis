//============================================================================
// Name        : ip_anonymizer.cpp
// Author      : 
// Version     :
// Copyright   : Your copyright notice
// Description : Hello World in C++, Ansi-style
//============================================================================

#include <iostream>
#include <fstream>
#include <regex>
#include <arpa/inet.h>
#include "panonymizer.h"

int main(int argc, char* argv[]) {
	using namespace std;
	if (argc < 3) {
		cout << "Usage: invoke with source and dest filenames, in that order"
				<< endl;
		return 1;
	}

	ifstream input;
	ofstream output;
	input.open(argv[1], ios::in);
	output.open(argv[2], ios::out);

	unsigned char my_key[32] = { 21, 34, 23, 141, 51, 164, 207, 128, 19, 10, 91,
			22, 73, 144, 125, 16, 216, 152, 143, 131, 121, 121, 101, 39, 98, 87,
			76, 45, 42, 132, 34, 2 };

	PAnonymizer anon(my_key);

	string str, res;
	char rep[INET_ADDRSTRLEN];
	struct in_addr bits;
	smatch match;
	try {
		//TODO rebuild with Boost regex library. G++ C++11 support questionable.
		regex addr("([0-9]{1,3}\\.){3}[0-9]{1,3}", std::regex_constants::ECMAScript);
		regex local_addr("^(10\\.*|172\\.16\\.*|192\\.168\\.*)");
		while (getline(input, str)) {
			regex_match(str, match, addr);
			if (!regex_match(str, local_addr)) {
				for (uint i = 0; i < match.size(); ++i) {
					cout << match.str(i) << endl;
					inet_pton(AF_INET, match.str(i).c_str(), &bits);
					bits.s_addr = anon.anonymize(bits.s_addr);
					inet_ntop(AF_INET, &bits, rep, INET_ADDRSTRLEN);
					res = std::string(rep);
					regex_replace(str, addr, res);
				}
			}
			output << str << endl;
		}
	} catch (std::regex_error& e){
	     if (e.code() == std::regex_constants::error_badrepeat){
	       std::cerr << "Repeat was not preceded by a valid regular expression.\n";
	     } else if (e.code() == std::regex_constants::error_collate){
	    	 cerr << "The expression contained an invalid collating element name.\n";
	     } else if (e.code() == regex_constants::error_complexity){
	    	 cerr <<  "The complexity of an attempted match against a regular expression exceeded a pre-set level.\n";
	     } else if (e.code() == regex_constants::error_ctype){
	    	 cerr << "The expression contained an invalid character class name.\n";
	     } else if (e.code() == regex_constants::error_escape){
	    	 cerr << "The expression contained an invalid escaped character, or a trailing escape.\n";
	     }  else if (e.code() == regex_constants::error_backref){
	    	 cerr << "The expression contained an invalid back reference.\n";
	     }  else if (e.code() == regex_constants::error_brack){
	    	 cerr << "The expression contained mismatched brackets ([ and ]).\n";
	     }  else if (e.code() == regex_constants::error_paren){
	    	 cerr << "The expression contained mismatched parentheses (( and )).\n";
	     }  else if (e.code() == regex_constants::error_brace){
	    	 cerr << "The expression contained mismatched braces ({ and }).\n";
	     }  else if (e.code() == regex_constants::error_badbrace){
	    	 cerr << "The expression contained an invalid range between braces ({ and }).\n";
	     }  else if (e.code() == regex_constants::error_range){
	    	 cerr << "The expression contained an invalid character range.\n";
	     }  else if (e.code() == regex_constants::error_space){
	    	 cerr << "There was insufficient memory to convert the expression into a finite state machine.\n";
	     }  else if (e.code() == regex_constants::error_stack){
	    	 cerr << "There was insufficient memory to determine whether the regular expression could match the specified character sequence.\n";
	     } else {
	    	 std::cerr << "Some other regex exception happened.\n";
	     }
	}
	output.close();
	input.close();
	return (0);
}
