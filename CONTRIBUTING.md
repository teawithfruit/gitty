# Contributing

Almost all of the `Repository` methods are simply convenience wrappers around
instances of `Command`. This makes extending the `Repository` constructor with
custom methods easy as pie! Let's run through a quick example. Let's say we
want to add a method for creating a new branch and automatically switching to
it. What do we need to do?

1. Extend the `Repository` prototype
2. Create a new instance of `Command`
3. Parse the output and pass to a callback

Three steps is all it should take to add a new method to the `Repository`
constructor, and below is how you might do it. In `lib/repository.js`:

```js
// we want to pass a branch name and callback into this method
Repository.prototype.branchAndCheckout = function(name, callback) {
  var self = this
  var cmd  = new Command(self.path, 'checkout', ['-b'], name);

  cmd.exec(function(error, stdout, stderr) {
    callback(error || stderr || null);
  });
};
```

It's a simple as that. Now you would be able to use this custom method in your
application, like so:

```js
myRepo.branchAndCheckout('myBranch', function(err) {
  if (err) {
    return console.log(err);
  }
  // ...
});
```
