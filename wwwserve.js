#!/usr/bin/env node

/*
 * wwwserve
 * A simple web server written in Node.js
 * 
 * Written by Raresh Nistor
 *
 */

// Import dem libz
var fs      = require("fs")              // Because JavaScript by itself has little IO
var path    = require("path")            // Because Windows uses back-slashes (to be tested)
var http    = require("http")            // HTTP. Need I say more?
var chalk   = require("chalk")           // Output colouriser. Makes errors look dangerous.
var cheerio = require("cheerio")         // jQuery-like DOM for manipulation of server pages
var process = require("process")         // Because things are more complicated than they need
var program = require("commander")       // Command-line interface switchy thing
var mime    = require("mime-types")      // How else am I going to give the Content-Type header?
var pad     = require("node-string-pad") // String padding (string.prototype.padRight doesn't work yet)

// Include the package.json
var package = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json")))

// Server default settings
var serverRoot = process.cwd()

// Do the commander stuff
program.version(package.version)
       .description(package.description)
       .arguments("<directory>")
       .action(function(directory) {
            serverRoot = directory;
       })
       .option("-p, --port <port>", "HTTP port", parseInt)
       .option("-c, --custom-404 [filename]", "custom 404 page (defaults to 404.html)")
       .option("-d, --dir-listing", "show files in index-less directory")
       .option("-D, --no-dir-listing", "return 404 in index-less directory")
       .option("-i, --index <filename>", "filename of index file")
       .parse(process.argv)

// Check if the folder exists
if (!fs.existsSync(serverRoot))
{
    console.error(chalk.red(`"${serverRoot}" doesn't exist. Server halted.`))
    process.exit(1)
}

// Error handling
function errorPage(errorHeader, errorDescription)
{
    try // Try-catch to prevent errors while error-handling
    {
        // Read the HTML content from the error template
        var errorTemplate = fs.readFileSync(path.join(__dirname, "wwwdata", "error.html"))
        var $ = cheerio.load(errorTemplate)

        // Replace the include[resource] with the actual stuff
        $("[data-resource]").each(function()
        {
            if ($(this).data("resource") == "error-header")
                $(this).html(errorHeader)
            if ($(this).data("resource") == "error-description")
                $(this).html(errorDescription)
        })

        // Include the CSS file
        $("link[rel='stylesheet'][href]").each(function()
        {
            // Create stylesheet element to house embedded CSS
            var style = $("<style />")
            style.text(fs.readFileSync(path.join(__dirname, "wwwdata", $(this).attr("href"))))

            // Add to page and delete this one
            style.appendTo($(this).parent())
            $(this).remove()
        })

        // Finally return the final result
        return $.html()
    }
    catch (e) // If something bad happens during error handling
    {
        // Screw it. Just return some boring text
        return `<h1>${ errorHeader }</h1><p>${ errorDescription }</p><hr><p><small>Additional error occured: </p><pre>${ e }</pre>`
    }
}

// Create a server (I'll bother with the settings later)
var httpServer = http.createServer(function(request, response)
{
    // Add a few server-specific headers
    response.setHeader("Server", `${ package.name }/${ package.version } (${ process.platform })`)

    // Try-catch for server errors
    try
    {
        // Check if.. the file exists
        if (fs.existsSync(path.join(serverRoot, request.url)) &&              // The file exists, and...
        !fs.lstatSync(path.join(serverRoot, request.url)).isDirectory()) // is not a directory
        {   
            // Respond with the file
            response.write(fs.readFileSync(path.join(serverRoot, request.url)))
            response.end()
        }
        else if (fs.existsSync(path.join(serverRoot, request.url, program.index || "index.html")))
        {
            // Respond with the file
            response.write(fs.readFileSync(path.join(serverRoot, request.url, program.index || "index.html")))
            response.end()
        }
        else
        {
            // Headers
            response.statusCode = 404

            // Throw a 404 page
            response.write(errorPage("404 Not Found", "Whatever you were trying to find... we didn't.<br>How about trying to sit back, take 30 and try again?"))
            response.end()

            // TODO: Custom 404 pages... Just like GitHub Pages.
        }
    }
    catch (e)
    {
        // TODO: Reorganise this mess.
        //       You can't really remove the response body once you sent it.
        //       I'll replace everything with a variable that'll be sent at the very end
        //       in a future commit.

        // Error information
        response.statusCode = 500

        // Throw a 500 page
        response.write(errorPage("500 Internal Server Error", "Good job on breaking the server!<br><br><a href='https://github.com/thegreatrazz/wwwserve/issues' target='_blank'>Submit an issue</a>"))
        response.end()
    }

    // Finally, display request information
    var statusCodeOut;
    if (response.statusCode >= 200 && response.statusCode < 300) // 2XX or 418   - Okay         - Green
        statusCodeOut = chalk.green(response.statusCode)
    if (response.statusCode >= 300 && response.statusCode < 400) // 3XX          - Redirect     - ???
        statusCodeOut = chalk.green(response.statusCode)
    if (response.statusCode >= 400 && response.statusCode < 500) // 4XX (no 418) - Client error - Yellow
        statusCodeOut = chalk.yellow(response.statusCode)
    if (response.statusCode >= 500) // 5XX          - Server error - Red
        statusCodeOut = chalk.red(response.statusCode)

    console.log(pad(request.method, 8) +
                statusCodeOut + " " +
                request.url)

}).listen(program.port || 3000)

// GET
// POST
// PUT
// HEAD
// OPTIONS
// CONNECT
// INFO

console.log(`Server started on port ${ httpServer.address().port }.`)