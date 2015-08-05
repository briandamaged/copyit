'use strict';

var _ = require('lodash');



// Returns a function that will extract the specified
// path from an object.
var extractor = exports.extractor = function() {
  var path = _.flatten(_.toArray(arguments));

  return function(obj) {
    var retval = obj;

    for(var i = 0; retval && (i < path.length); ++i) {
      var p = path[i];
      retval = retval[path[i]];
    }

    return retval;
  }
}


var from = exports.from = function() {
  return extractor(arguments);
}


exports.fromParams = function() {
  return extractor("params", arguments);
}


exports.fromBody = function() {
  return extractor("body", arguments);
}


exports.fromQuery = function() {
  return extractor("query", arguments);
}

