'use strict';

var _ = require('lodash');



// Returns a function that will extract the specified
// path from an object.
exports.from = function() {
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


exports.to = function() {
  var path = _.flatten(_.toArray(arguments));
  var dest = path.pop();

  return function(obj, value) {
    var target = obj;

    for(var i = 0; i < path.length; ++i) {
      var p = path[i];

      var nextTarget = target[p];
      if(_.isUndefined(nextTarget)) {
        nextTarget = target[p] = {}
      }

      target = nextTarget;
    }

    target[dest] = value
    return value;
  }
}

