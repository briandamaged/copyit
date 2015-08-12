'use strict';

var _ = require('lodash');


// Determines whether or not the value that has
// been provided can be used as a path spec.
var isPathSpec = exports.isPathSpec = function(thing) {
  var t = typeof thing;

  return(
    (t === 'string')       ||
    (t === 'number')       ||
    (_.isArray(thing))     ||
    (_.isArguments(thing)) ||
    (t === 'boolean')
  )
}



// Returns a function that will extract the specified
// path from an object.
var getter = exports.getter = exports.from = function() {
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


// Attempts to coerce the spec into a getter.
getter.coerce = function(spec, options) {
  options    = options || {}
  var prefix = options.prefix || []

  if(spec) {
    if(isPathSpec(spec)) {
      return getter(prefix, spec);
    } else {
      return spec;
    }
  }
}




var setter = exports.setter = exports.to = function() {
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



// Attempts to coerce the spec into a setter.
setter.coerce = function(spec, options) {
  options    = options || {}
  var prefix = options.prefix || []

  if(spec) {
    if(isPathSpec(spec)) {
      return setter(prefix, spec);
    } else {
      return spec;
    }
  }
}


