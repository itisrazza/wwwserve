# wwwserve
A simple web-server, ready to go at any time.

>
> This project is now deprecated. There are other better testing server if you're seriously looking for one:
>
> * [`http-server`](https://www.npmjs.com/package/http-server)
> * `python -m http.server 8000`
> * `php -S localhost:8000`
> * `busybox httpd -p 127.0.0.1:8000 -h $PWD`
>

## What's the point of this?
This started out as a learning excerise, but is now the thing I use whenever I need a testing server up and running.

This aims to be a simple ready-on-call web server for static content, or stuff that compiles to static content, but I would like it to become something a little bit for than that.

## Install
The version in the `master` branch will be available on npm.
```bash
npm install wwwserve -g
```

## Usage
```
wwwserve [options] <directory>
```
### Options
| Short | Long               | Arguments             | Explanation                                  |
|-------|--------------------|-----------------------|----------------------------------------------|
| `-V`  | `--version`        | none                  | output the version number                    |
| `-p`  | `--port`           | port number (integer) | HTTP port (defaults to 3000)                 |
| `-e`  | `--error-404`      | filename              | custom `404` page (defaults to `404.html`)   |
| `-d`  | `--no-dir-listing` | none                  | return `404` in index-less directory         |
| `-i`  | `--index`          | filename (string)     | custom filename for directory index          |
| `-h`  | `--help`           | none                  | output usage information                     |

### Examples
```
wwwserve ~/Sites/ --port 80
```
Run a website from the folder `~/Sites` on port 80.

```
wwwserve C:\Users\thegreatrazz\Documents\GitHub\website\ -DE --port 8080
```
Run a website from the folder `C:\Users\thegreatrazz\Documents\GitHub\website\` on port 8080.

Don't show the files in an index-less directory. Omit file extentions when possible.

## Exit codes
| Code | Meaning             |
|------|---------------------|
| `0`  | Everything is A-OK! |
| `1`  | Directory not found |
| `2`  | ...                 |

## Help out with the project
See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Wiki page](https://github.com/thegreatrazz/wwwserve/wiki/Contributions) for more information.