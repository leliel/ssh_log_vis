//============================================================================
// Name        : ip_anonymizer.cpp
// Author      : 
// Version     :
// Copyright   : Your copyright notice
// Description : Hello World in C++, Ansi-style
//============================================================================

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
	struct in_addr bits;
	boost::smatch match;
	try {
		boost::regex addr("(?>[0-9]{1,3}\\.){3}[0-9]{1,3}",
				boost::regex_constants::ECMAScript);
		boost::regex local_addr("^(10\\.*|172\\.16\\.*|192\\.168\\.*)",
				boost::regex_constants::ECMAScript); //got to be a better way.
		while (getline(input, str)) {
			if (boost::regex_search(str, match, addr)) {
				res = string(match[0].first, match[0].second);
				if (!boost::regex_match(res, local_addr)) {
					inet_pton(AF_INET, res.c_str(), &bits);
					bits.s_addr = anon.anonymize(bits.s_addr);
					inet_ntop(AF_INET, &bits, rep, INET_ADDRSTRLEN);
					res = std::string(rep);
					str = boost::regex_replace(str, addr, res);
				}
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
