// jshint esversion: 6
// Copyright 2017 Uche Akotaobi.
//
// This file is part of BOT.
//
// BOT is free software: you can redistribute it and/or modify it under the
// terms of the GNU General Public License as published by the Free Software
// Foundation, either version 3 of the License, or (at your option) any later
// version.
//
// BOT is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
// details.
//
// You should have received a copy of the GNU General Public License along
// with BOT.  If not, see <http://www.gnu.org/licenses/>.

/////////////////////////////////////////////////////////////////
// Utility functions and classes used throughout the codebase. //
/////////////////////////////////////////////////////////////////

// An arbitrary object-cloning function taken from
// http://stackoverflow.com/a/1042676.  Note that this function performs an
// actual cloning operation if 'to' is null; otherwise, it merely copies those
// attributes of 'from' which 'to' does not have yet.
//
// extends 'from' object with members from 'to'. If 'to' is null, a deep clone of 'from' is returned
function extend(from, to)
{
    if (from === null || typeof from != "object") return from;

    // This line here disallows the cloning of Robot objects, which is the
    // whole reason I imported extend() in the first place.  I'd like to
    // understand the reasoning behind this logic, because not being able to
    // extend objects with custom constructors sure smells like a bug.
    //
    // if (from.constructor != Object && from.constructor != Array) return from;

    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
        from.constructor == String || from.constructor == Number || from.constructor == Boolean)
        return new from.constructor(from);

    let cloning = (to === null);
    to = to || new from.constructor();

    if (from.constructor == Robot && cloning) {
        // Right now, 'to' is a Munchkin (like any new Robot() with no args.)
        // We don't need the Munchkin itself, and we are in fact about to
        // overwrite it, so it makes sense to unregister it beforehand.
        to.unregister();
    }

    for (var name in from)
    {
        to[name] = (typeof to[name] == "undefined" || cloning) ? extend(from[name], null) : to[name];
    }

    return to;
}


// A (very simplified) C#-style String.Format()-like function from
// StackOverflow.  The only format specifiers it understands are {0}, {1},
// {2}, and the like.
//
// See http://stackoverflow.com/a/4673436.

if (!String.format) {
    String.format = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}


// Just returns a random integer between a and b, inclusive.
function random(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Assigns the given path to an in-memory Image object.  The Image will load
// the resource asynchronously, and you can check on its progress by checking
// myImage.complete.
//
// We understand HTTP and HTTPS URIs, relative paths, and
// url("http://example.net/foo/bar") strings.
//
// Returns the Image object if the imagePath could be parsed, and null
// otherwise.
function preload(imagePath) {

    const urlExpressionRegex = /^url\([\'\"](.*)[\'\"]\)$/i;
    const fileRegex = /^file:\/\/.*$/i;
    const relativePathRegex = /^.{1,2}\/.*/i;

    // This is @stephenhay's regex from
    // https://mathiasbynens.be/demo/url-regex, with the forward slashes in
    // the middle escaped appropriately.
    const uriRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

    let uri = "";

    let urlExpressionMatch = imagePath.match(urlExpressionRegex);
    if (urlExpressionMatch !== null) {
        uri = urlExpressionMatch[1];
    } else {
        let uriRegexMatch = imagePath.match(uriRegex);
        if (uriRegexMatch !== null) {
            uri = uriRegexMatch[0];
        } else {
            let fileRegexMatch = imagePath.match(fileRegex);
            if (fileRegexMatch !== null) {
                uri = fileRegexMatch[0];
            } else {
                let relativePathRegexMatch = imagePath.match(relativePathRegex);
                if (relativePathRegexMatch !== null) {
                    uri = relativePathRegexMatch[0];
                }
            }
        }
    }

    if (uri === "") {
        console.warn("Cannot preload \"%s\" because it is neither a CSS url()" +
                     " expression, a relative path, nor a valid file://," +
                     " http://, https://, or ftp:// URI.",
                     imagePath);
        return null;
    }

    let img = new Image;
    img.src = uri;
    return img;
}
