# Instazip

Instazip is an Instagram export/backup/archive tool that lives *mostly* in your browser.

Instazip uses JSZip and stuff built into Webkit browsers to dynamically build the archive.
It uses the publically accessible "media" feed that Instagram uses for its web presence via YQL to pull image metadata.

Instazip uses a small chunk of server side code to perform base64 encoding. It's written in PHP, but is only a few lines of code, and easily replaced or relocated.

A demo can be found online at: <http://instazip.orchestra.io>

## Goal
The goal was to build an export tool that could be run locally, but I got stumped trying to get base64 encoded versions of images without including a little bit of server side code. A little creative use of YQL returns base64 encoded image strings, but the maximum allowed size of each image (or base64 string, maybe) is 25KB, which is far too low a limit for this.