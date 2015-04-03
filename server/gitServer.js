var express = require('express');
var bodyParser = require('body-parser');
var nodegit = require("nodegit");
var path = require("path");
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));
fse.ensureDir = promisify(fse.ensureDir);
var app = express();
app.use(bodyParser());
app.use('/', express.static('../client/'));
// app.use('/', express.static('./static')).
// 	use('/images', express.static( '../images')).
// 	use('/lib', express.static( '../lib'));

// app.get('/', function(req, res) {
// 	res.send("Server Root");
// });

app.post('/clone', function(req, res) {
	// console.log(req.body);

	console.log('Repo Name', req.body.name);
	console.log('Repo Url', req.body.url);

	nodegit.Clone(
		req.body.url,
		"../repos/" + req.body.name,
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

	res.send("Server Cloned");
});

app.post('/commit', function(req, res) {
	// var promisify = require("promisify-node");
	// var fse = promisify(require("fs-extra"));
	var fileName = "newfile.txt";
	var fileContent = req.body.text;
	/**
	* This example creates a certain file `newfile.txt`, adds it to the git
	* index and commits it to head. Similar to a `git add newfile.txt`
	* followed by a `git commit`
	**/
	var repo;
	var index;
	var oid;
	nodegit.Repository.open(path.resolve(__dirname, "../repos/" + req.body.name + "/.git"))
		.then(function(repoResult){
			repo = repoResult;
			return fse.writeFile(path.join(repo.workdir(), fileName), fileContent);
		})
		.then(function() {
			return repo.openIndex();
		})
		.then(function(indexResult) {
			index = indexResult;
			return index.read(1);
		})
		.then(function() {
			// this file is in the root of the directory and doesn't need a full path
			return index.addByPath(fileName);
		})
		.then(function() {
			// this will write both files to the index
			return index.write();
		})
		.then(function() {
			return index.writeTree();
		})
		.then(function(oidResult) {
			oid = oidResult;
			return nodegit.Reference.nameToId(repo, "HEAD");
		})
		.then(function(head) {
			return repo.getCommit(head);
		})
		.then(function(parent) {
			var author = nodegit.Signature.create("Jake Welbin",
			"jwelbin@gmail.com", 123456789, 60);
			var committer = nodegit.Signature.create("Jake Welbin",
			"jwelbin@github.com", 987654321, 90);
			return repo.createCommit("HEAD", author, committer, "message", oid, [parent]);
		})
		.done(function(commitId) {
			console.log("New Commit: ", commitId);
		});

	res.send("Server Committed");
});

app.post('/pull', function(req, res) {
	console.log('__dirname', req.body.name);
	// var __dirname = "../repos";

	var repoDir = "../repos/" + req.body.name;

	var repository;

	// Open a repository that needs to be fetched and fast-forwarded
	nodegit.Repository.open(path.resolve(__dirname, repoDir))
		.then(function(repo) {
	    	repository = repo;

	    	return repository.fetchAll({
	      	credentials: function(url, userName) {
	        	return nodegit.Cred.sshKeyFromAgent(userName);
	      	},
	      	certificateCheck: function() {
	        	return 1;
	    	}
	    	});
		})
		// Now that we're finished fetching, go ahead and merge our local branch
		// with the new one
		.then(function() {
			console.log("Merging");
	    	return repository.mergeBranches("master", "origin/master");
	  	})
		.done(function() {
	    	console.log("Done!");
		});

	res.send("Server Pulled");
});

app.post('/push', function(req, res) {
	var repoDir = "../repos/" + req.body.name + "/.git";
	var repository;
	var remote;
	var signature = nodegit.Signature.create("Jake Welbin",
	"jwelbin@github.com", 123456789, 60);
	fse.remove(path.resolve(__dirname, repoDir))
		.then(function(repoResult) {
			repository = repoResult;
			return fse.ensureDir(path.resolve(__dirname, repoDir));
		})
		// Add a new remote
		.then(function() {
			return nodegit.Remote.create(repository, "origin",
			"https://github.com/jeffreykbacon/nodegittest.git")
		.then(function(remoteResult) {
			remote = remoteResult;
			remote.setCallbacks({
				credentials: function(url, userName) {
					return nodegit.Cred.sshKeyFromAgent(userName);
				}
			});
			// Create the push object for this remote
			return remote.push(
				["refs/heads/master:refs/heads/master"],
				null,
				repository.defaultSignature(),
				"Push to master");
			});
		}).done(function() {
		console.log("Done!");
	});

	res.send("Server Pushed");
});

app.listen(80);