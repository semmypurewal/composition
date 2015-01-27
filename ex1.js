// simple example -- we want to apply these functions
var multiplyByTen = function (value) {
    return value * 10;
};

var addFive = function (value) {
    return value + 5;
};

var multiplyByOneHundred = function (value) {
    return value * 100;
};

// obvious composition using 15 as an argument
// result is ((15 * 10) + 5) * 100 = 15500
var result = multiplyByOneHundred(addFive(multiplyByTen(15)));
console.log(result);
//=> 15500

// we can generalize this approach using 'compose'
var compose = function ( /* funcs */ ) {
    var funcs = Array.prototype.slice.call(arguments, 0);

    return function (arg) {
        return funcs.reduce(function (resultSoFar, currentFunc) {
            return currentFunc(resultSoFar);
        }, arg);
    };
};

var program = compose(
    multiplyByTen,
    addFive,
    multiplyByOneHundred
);

console.log(program(15));
//=> 15500

// why is this better? readability mainly, but we can also play games

// more interesting compose, admits functions that don't return anything
// we can generalize this approach using 'compose'
var composeWithEmptyFuncs = function ( /* funcs */ ) {
    var funcs = Array.prototype.slice.call(arguments, 0);

    return function (arg) {
        return funcs.reduce(function (resultSoFar, currentFunc) {
            // if the result of the currentFunc on the current
            // value is undefined, we just return the last value
            return currentFunc(resultSoFar) || resultSoFar;
        }, arg);
    };
};

// now we can do side-effect oriented stuff
// outside of our pure functions
var lazyLog = function (msg) {
    return function () {
        console.info(msg);
    };
};

var program2 = composeWithEmptyFuncs(
    lazyLog("about to multiply by 10"),
    multiplyByTen,
    lazyLog("about to add 5"),
    addFive,
    lazyLog("about to multiply by 100"),
    multiplyByOneHundred
);

console.log(program2(15));
//=> about to multiply by 10
//=> about to add 5
//=> about to multiply by 100
//=> 15500

// we could also track intermediate computations
// so if things go wrong we have more clarity into
// the problem

// helper to get the last value of an array
var last = function (arr) {
    return arr[arr.length - 1];
};

var composeWithTracking = function ( /* funcs */ ) {
    var funcs = Array.prototype.slice.call(arguments, 0);

    return function (arg) {
        var allResults = funcs.reduce(function (resultsSoFar, currentFunc) {
            var result = currentFunc(last(resultsSoFar));

            if (typeof result !== "undefined") {
                resultsSoFar.push(result);
            }

            return resultsSoFar;
        }, [ arg ]);

        return last(allResults);
    };
};

var program3 = composeWithTracking(
    lazyLog("about to multiply by 10"),
    multiplyByTen,
    lazyLog("about to add 5"),
    addFive,
    lazyLog("about to multiply by 100"),
    multiplyByOneHundred
);

console.log(program3(15));
