#!/bin/bash

# Create a bunch of files and folder with random names
# TBD Later

# Start the server
wwwserve . > /dev/null &&

# Start the testing script
node test/test.js

