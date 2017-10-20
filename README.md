# wwwserve
A simple web-server written in Node.js

> ## Please note
>
> This is still in development and a number of things are still not implmented.
> Please use [the issues tab](https://github.com/thegreatrazz/wwwserve/issues) whenever possible.

## What's the point of this?
The point of this is for me to get my hands dirty and learn Node.js web servery things.

This is meant to be simplistic. For now, the idea is to have this in the command-line, ready to
fire when I need a static web server up. Namely testing non-Jekyll [GitHub Pages](https://pages.github.com/) stuff.

I know similar tools which do the same thing (and probably better), such as [sèvè](https://github.com/leny/seve).

Hopefully, whatever this is will be a framework for another project I have planned down the pipeline. Don't quote me on that, though.

## Install
You must have Git, Node.js and NPM installed.
```
git clone https://github.com/thegreatrazz/wwwserve.git
npm install
npm link
```

## Usage
```
wwwserve [options] <directory>
```
### Options
| Short | Long               | Arguments             | Explanation                                  |
|-------|--------------------|-----------------------|----------------------------------------------|
| `-v`  | `--version`        | none                  | output the version number                    |
| `-p`  | `--port`           | port number (integer) | HTTP port (default 3000)                     |
| `-e`  | `--use-ext`        | none                  | use file extention (default)                 |
| `-E`  | `--omit-ext`       | none                  | omit file extention (prioritises `.html`)    |
| `-d`  | `--dir-listing`    | none                  | show files in index-less directory (default) |
| `-D`  | `--no-dir-listing` | none                  | return `404` in index-less directory         |
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