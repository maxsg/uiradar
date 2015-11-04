#!/bin/bash

g++ C_send_to_server2.cpp -o send_to_server -L/usr/lib -lstdc++ -lssl -lcrypto -lboost_system -lpqxx -lboost_date_time; ./send_to_server
