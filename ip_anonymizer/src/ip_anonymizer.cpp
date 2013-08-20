//============================================================================
// Name        : ip_anonymizer.cpp
// Author      :
// Version     :
// Copyright   : Your copyright notice
// Description : Hello World in C++, Ansi-style
//============================================================================

#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <arpa/inet.h>
#include <boost/regex.hpp>
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
	char repv6[INET6_ADDRSTRLEN];
	struct in_addr bits;
	struct in6_addr bitsv6;
	boost::smatch match;
	try {
		boost::regex addr(
				"\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
				boost::regex_constants::ECMAScript);
		//boost::regex addrv6("(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))"
		boost::regex addrv6("(::|(([a-fA-F0-9]{1,4}):){7}(([a-fA-F0-9]{1,4}))|(:(:([a-fA-F0-9]{1,4})){1,6})|((([a-fA-F0-9]{1,4}):){1,6}:)|((([a-fA-F0-9]{1,4}):)(:([a-fA-F0-9]{1,4})){1,6})|((([a-fA-F0-9]{1,4}):){2}(:([a-fA-F0-9]{1,4})){1,5})|((([a-fA-F0-9]{1,4}):){3}(:([a-fA-F0-9]{1,4})){1,4})|((([a-fA-F0-9]{1,4}):){4}(:([a-fA-F0-9]{1,4})){1,3})|((([a-fA-F0-9]{1,4}):){5}(:([a-fA-F0-9]{1,4})){1,2}))"
				, boost::regex_constants::perl);
		while (getline(input, str)) {
			if (boost::regex_search(str, match, addr)) {
				res = string(match[0].first, match[0].second);
				inet_pton(AF_INET, res.c_str(), &bits);
				bits.s_addr = anon.anonymize(bits.s_addr);
				inet_ntop(AF_INET, &bits, rep, INET_ADDRSTRLEN);
				res = std::string(rep);
				str = boost::regex_replace(str, addr, res);
			} else if(boost::regex_search(str, match, addrv6)){
				res = string(match[0].first, match[0].second);
				inet_pton(AF_INET6, res.c_str(), &bitsv6);
				anon.anonymizev6(&bitsv6);
				inet_ntop(AF_INET6, &bitsv6, repv6, INET6_ADDRSTRLEN);
				res = std::string(repv6);
				str = boost::regex_replace(str, addrv6, res);
			}
			output << str << endl;
		}
	} catch (boost::regex_error& e) {
		std::cerr << e.code();
	}
	output.close();
	input.close();
	return (0);
}
