var request = require("request");
var Promise = require("q");
var cheerio = require("cheerio");

// example with promises
// we can use q's nfcall function to convert a
// node-style callback API to a promise api
var getBody = function (url) {
    //console.log("getting " + url);
    return Promise.nfcall(request.get, url).then(function (response) {
        return response[0].body;
    });
};

// this function is synchronous
var getFirstUrl = function (document) {
    var $ = cheerio.load(document);
    return $("a").filter(function (index, link) {
        return $(link).attr("href").indexOf("http") > -1;
    }).first().attr("href");
};

var composeWithPromises = function ( /* funcs */ ) {
    var args = Array.prototype.slice.call(arguments, 0);

    return function (arg) {
        return args.reduce(function (resultSoFar, currentFunc) {
            if (Promise.isPromise(resultSoFar)) {
                return resultSoFar.then(currentFunc);
            } else {
                return currentFunc(resultSoFar);
            }
        }, arg);
    };
};

var program = composeWithPromises(
    getBody,
    getFirstUrl,
    getBody,
    getFirstUrl
);

/*program("http://www.example.com").then(function (link) {
    console.log("from first example: " + link);
});*/

// and with the possibility of having functions with side-effects
var composeWithPromisesAndEmptyFuncs = function ( /* funcs */ ) {
    var args = Array.prototype.slice.call(arguments, 0);

    return function (arg) {
        return args.reduce(function (resultSoFar, currentFunc) {
            if (Promise.isPromise(resultSoFar)) {
                return resultSoFar.then(function (value) {
                    return currentFunc(value) || value;
                });
            } else {
                return currentFunc(resultSoFar) || resultSoFar;
            }
        }, arg);
    };
};

// works with our original example
var program2 = composeWithPromisesAndEmptyFuncs (
    lazyLog("about to multiply by 10"),
    multiplyByTen,
    lazyLog("about to add 5"),
    addFive,
    lazyLog("about to multiply by 100"),
    multiplyByOneHundred,
    lazyLog("finished")
);

console.log(program2(15));
//=> 15500

// now with asynchronicity!
var program3 = composeWithPromisesAndEmptyFuncs (
    lazyLog("about to do first request"),
    getBody,
    lazyLog("about to get first url"),
    getFirstUrl,
    lazyLog("about to do second request"),
    getBody,
    lazyLog("about to get first url from second document"),
    getFirstUrl
);

program3("http://www.example.com").then(function (link) {
    console.log(link);
});
//=> http://www.icann.org/topics/idn/

// funcs from example 1
function lazyLog (msg) {
    return function () {
        console.info(msg);
    };
};

function multiplyByTen (value) {
    return value * 10;
};

function addFive (value) {
    return value + 5;
};

function multiplyByOneHundred (value) {
    return value * 100;
};

function last (arr) {
    return arr[arr.length - 1];
};
