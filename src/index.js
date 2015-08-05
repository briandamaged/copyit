'use strict';

var _ = require('lodash');


// Determines whether or not the value that has
// been provided can be used as a path spec.
var isPathSpec = exports.isPathSpec = function(thing) {
  return(
    ((typeof thing) === 'string') ||
    ((typeof thing) === 'number') ||
    (_.isArray(thing))            ||
    (_.isArguments(thing))        ||
    ((typeof thing) === 'boolean')
  )
}



// Returns a function that will extract the specified
// path from an object.
var from = exports.from = function() {
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


// Will attempt to create a 'from' using the spec.  If
// no spec was provided, then return undefined.
exports.buildFrom = function(spec) {
  if(spec) {
    if(isPathSpec(spec)) {
      return from(spec);
    } else {
      return spec;
    }
  }
}




var to = exports.to = function() {
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



// Attempt to create a 'to' from the spec.  If the spec
// is undefined, then return undefined.
exports.buildTo = function(spec) {
  if(spec) {
    if(isPathSpec(spec)) {
      return to(spec);
    } else {
      return spec;
    }
  }
}


