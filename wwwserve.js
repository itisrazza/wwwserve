#!/usr/bin/env node

/*
 * wwwserve
 * A simple web server written in Node.js
 * 
 * Written by Raresh Nistor
 *
 */

// Import dem libz
var fs      = require("fs")        // Because JavaScript by itself has little IO
var path    = require("path")      // Because Windows uses back-slashes (to be tested)
var http    = require("http")      // HTTP. Need I say more?
var chalk   = require("chalk")     // Output colouriser. Makes errors look dangerous.
var cheerio = require("cheerio")   // jQuery-like DOM for manipulation of server pages
var program = require("commander") // Command-line interface switchy thing

// Include the package.json
var package = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json")))

// Server default settings
var httpPort     = 3000 
var httpIndex    = "index.html"
var httpOmitExt  = false
var httpDirList  = true
var httpFolder   = process.cwd()

// Do the commander stuff
program.version(package.version)
       .description(package.description)
       .arguments("<directory>")
       .action(function(directory) {
            httpFolder = directory;
       })
       .option("-p, --port <port>", "HTTP port", parseInt)
       .option("-e, --use-ext", "use file extention")
       .option("-E, --omit-ext", "omit file extention")
       .option("-d, --dir-listing", "show files in index-less directory")
       .option("-D, --no-dir-listing", "return 404 in index-less directory")
       .option("-i, --index <filename>", "filename of index file")
       .parse(process.argv)

console.log("Ideally... there should be a server running using the files from " + httpFolder)