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
       .option("-p, --port <port>", "HTTP port (defaults to 3000)", parseInt)
       .option("-e, --error-404 [filename]", "custom 404 page (defaults to 404.html)")
       .option("-d, --no-dir-listing", "return 404 in index-less directory")
       .option("-i, --index <filename>", "custom filename for directory index")
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

    // Create variable for the response body
    var responseBody = "";

    // Try-catch for server errors
    try
    {
        // Check if.. the file exists
        if (fs.existsSync(path.join(serverRoot, decodeURI(decodeURI(request.url))) &&         // The file exists, and...
        !fs.lstatSync(path.join(serverRoot, decodeURI(request.url))).isDirectory())) // is not a directory
        {   
            // Respond with the file
            responseBody = fs.readFileSync(path.join(serverRoot, decodeURI(request.url)))
        }
        else if (fs.existsSync(path.join(serverRoot, decodeURI(request.url), program.index || "index.html")))
        {
            // Respond with the file
            responseBody = fs.readFileSync(path.join(serverRoot, decodeURI(request.url), program.index || "index.html"))
        }
        else if (fs.existsSync(path.join(serverRoot, decodeURI(request.url))) &&              // The file exists, and...
                 fs.lstatSync(path.join(serverRoot, decodeURI(request.url))).isDirectory() && // is a directory, and
                 program.dirListing)                                               // directory listing is enabled
        {
            // If the request has a trailing "/"
            if (decodeURI(request.url)[decodeURI(request.url).length - 1] === "/")
            {
                // Use the template

                // Header
                response.setHeader("X-wwwserve", "Internal")
                
                // Do some magic
                var dirviewTemplate = fs.readFileSync(path.join(__dirname, "wwwdata", "dirview.html"))
                var $ = cheerio.load(dirviewTemplate)

                // Replace URLs
                $("[data-resource='dir-url']").html(decodeURI(request.url))

                // If there is no parent, don't bother
                if (decodeURI(request.url) === "/")
                    $("[data-dir-parent]").remove()
                else // Otherwise set the time
                {
                    $("[data-resource='dir-parent-time']").html(fs.lstatSync(path.join(serverRoot, decodeURI(request.url))).mtime)
                }

                // Get a list of files
                var dirContents = fs.readdirSync(path.join(serverRoot, decodeURI(request.url)));
                var filesOmmited = false;
                for (var i = 0; i < dirContents.length; i++)
                {
                    try {
                        // Get additional information about the file
                        var fileInfo = fs.lstatSync(path.join(serverRoot, decodeURI(request.url), dirContents[i]))

                        // Copy the structure of the list item
                        var listItem = $("[data-dir-structure]").clone()

                        // Remove the data-dir-structure attr to prevent deleting all of them
                        listItem.removeAttr("data-dir-structure")

                        // Set variables
                        listItem.children("[data-dir-file='icon']").html(fileInfo.isDirectory() ? "📁" : "📝")
                        listItem.children("[data-dir-file='file']")
                                .children("[data-dir-file='link']").attr("href", dirContents[i] + (fileInfo.isDirectory() ? "/" : ""))
                                                                .text(dirContents[i] + (fileInfo.isDirectory() ? "/" : ""))
                        listItem.children("[data-dir-file='time']").text(fileInfo.mtime)                
                        listItem.children("[data-dir-file='size']").text(!fileInfo.isDirectory() ? fileInfo.size : "-")                

                        // Add to table
                        listItem.appendTo("tbody")
                    }
                    catch (ex)
                    {
                        response.setHeader("X-File-Omitted", true);
                        continue;
                    }
                }

                // Clear out template
                $("[data-dir-structure]").remove()

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

                // Add to response
                responseBody = $.html()
            }
            else
            {
                // Otherwise, redirect
                response.statusCode = 301
                response.setHeader("Location", decodeURI(request.url) + "/")
            }
        }
        else
        {
            // Headers
            response.statusCode = 404

            // Check 
            response.setHeader("X-wwwserve", "Internal")

            // Throw a 404 page
            responseBody = errorPage("404 Not Found", "Whatever you were trying to find... we didn't.<br>How about trying to sit back, take 30 and try again?")

            // TODO: Custom 404 pages... Just like GitHub Pages.
        }
    }
    catch (e)
    {
        // Headers
        response.statusCode = 500
        response.setHeader("X-wwwserve", "Internal")
        response.setHeader("X-JS-Exception", e)

        // Throw a 500 page
        responseBody = errorPage("500 Internal Server Error",
                                 "Good job on breaking the server!<br>Go to the Network debugger and <a href='https://github.com/thegreatrazz/wwwserve/issues/new' target='_blank'>submit an issue</a>.")
    }

    // Finally, send the response
    response.write(responseBody)
    response.end()

    // Finally, display request information
    var statusCodeOut;
    if (response.statusCode >= 200 && response.statusCode < 300) // 2XX or 418   - Okay         - Green
        statusCodeOut = chalk.green(response.statusCode)
    if (response.statusCode >= 300 && response.statusCode < 400) // 3XX          - Redirect     - ???
        statusCodeOut = chalk.cyan(response.statusCode)
    if (response.statusCode >= 400 && response.statusCode < 500) // 4XX (no 418) - Client error - Yellow
        statusCodeOut = chalk.yellow(response.statusCode)
    if (response.statusCode >= 500) // 5XX          - Server error - Red
        statusCodeOut = chalk.red(response.statusCode)

    console.log(pad(request.method, 8) +
                statusCodeOut + " " +
                decodeURI(request.url))

}).listen(program.port || 3000)

console.log(`Server started on port ${ httpServer.address().port }.`)