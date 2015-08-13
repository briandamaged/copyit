# copyit #

This module allows you to declare how data will move into and out of your middleware.


## Installation ##

```
npm install copyit
```


## Usage ##

### Refactoring Hard-coded Assumptions ###

Let's imagine that we're writing a piece of middleware called ```getUser```.  This middleware fetches a ```User``` record from the database before passing control to the next piece of middleware.  Let's start with something simple:

```javascript
exports.getUser = function(req, res, next) {
  var id   = req.params.id;

  fetchUserById(id, function(user) {
    req.user = user;
    next();
  });
}
```

Most of the time, this implementation is fine.  But, there are a couple of problems:

 * It *always* reads the ```id``` from ```req.params.id```.
 * It *always* stores the ```User``` instance to ```req.user```.

If your controller needs to break either of these assumptions, then it cannot use the ```getUser()``` middleware.

We can fix this by allowing the developers to declare the dataflow behaviors when the middleware is initialized.  For example:


```javascript
var copyit = require('copyit');
var from   = copyit.from,
    to     = copyit.to;

router.get('/users/:userId',

  getUser({
    // Obtain the user's id from req.params.userId
    input:  from("params", "userId"),

    // Save the User instance to req.the_user
    output: to("the_user")
  }),

  function(req, res) {
    // See -- the User was saved to req.the_user
    //        instead of req.user
    res.json(req.the_user);
  }
)
```

The ```from``` and ```to``` functions return new functions that get and set values, respectively.  These getter and setter functions are then passed into the middleware to manage the dataflow.  Therefore, the middleware can be rewritten as follows:



```javascript
var copyit = require('copyit');
var from   = copyit.from,
    to     = copyit.to;

exports.getUser = function(options) {
  options = options || {}

  // Use the getter / setter functions that were provided
  // by the developer, or fallback to the default behaviors.
  var getId   = req.input  || from("params", "id");
  var setUser = req.output || to("user");

  return function(req, res, next) {
    var id   = getId(req);  // Use the getter to obtain the id
    var user = fetchUserById(id);

    setUser(req, user);     // Use the setter to store the User
    next();
  }
}
```

Ta-da!  Now your middleware's dataflow assumptions are no longer hard-coded!  You can rely on the default behaviors most of the time, but you also have the option to override them on an as-needed basis.


### Simplified Declaration ###

Of course, it's a little inconvenient to require the developers to use the ```copyit``` library just for minor adjustments to the behaviors.  Wouldn't it be nice if they could just do something like this instead?


```javascript
router.get('/users/:userId',

  getUser({
    // Obtain the user's id from req.params.userId
    input:  "userId",

    // Save the User instance to req.the_user
    output: "the_user"
  }),

  function(req, res) {
    res.json(req.the_user);
  }
)
```

Well, today is your lucky day -- that actually *is* possible!  We just need to modify our middleware so that it automatically coerces the developer's input into getter and setter functions:



```javascript
var copyit = require('copyit');
var from   = copyit.from,
    to     = copyit.to;

exports.getUser = function(options) {
  options = options || {}

  // If the developer provided values, then coerce them into
  // getter / setter functions.  Otherwise, return undefined.
  var getId   = from.coerce(req.input, {prefix: "params"})
  var setUser = to.coerce(req.output);

  // If no behavior overrides were provided, then fallback to
  // the default behaviors.
  getId   = getId   || from("params", "id");
  setUser = setUser || to("user")

  return function(req, res, next) {
    var id   = getId(req);  // Use the getter to obtain the id
    var user = fetchUserById(id);

    setUser(req, user);     // Use the setter to store the User
    next();
  }
}
```

Notice that we specified ```{prefix: "params"}``` when invoking ```from.coerce```.  The influences the way that ```from.coerce``` will convert Strings and Arrays into getter / setter functions.  In this particular case, it will append ```"params"``` to the front of every lookup path.  In other words:

```javascript
// This:
getUser({
  input:  "userId",
  output: "the_user"
});


// Is equivalent to this:
getUser({
  input:  from("params", "userId"),
  output: to("the_user")
});
```

What if a developer needs to obtain the user's id from ```req.body``` instead of ```req.params```?  Simple -- they just need to specify the full path by calling ```from(...)```:

```javascript
getUser({
  input:  from("body", "id"),
  output: "the_user"
});
```

And that, as they say, is that!
