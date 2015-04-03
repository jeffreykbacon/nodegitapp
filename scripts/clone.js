var Git = require("nodegit");

Git.Clone(
  "https://github.com/jeffreykbacon/nodegittest.git", 
  "testrepo", 
  {
    remoteCallbacks: {
      certificateCheck: function() {
        // github will fail cert check on some OSX machines
        // this overrides that check
        return 1;
      }
    }
  }).then(function(repository) {
  console.log("should have cloned");
  // Work with the repository object here.
});

console.log("should print");
