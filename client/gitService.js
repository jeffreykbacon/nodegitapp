app.service('gitService', ['$http', function($http) {
	this.clone = function(name, url) {
		// console.log('clone', url);
		var clone = {name: name, url: url};
		$http.post('http://localhost/clone', clone).success(function(data) {
			console.log('Clone Return', data);
		});
	};

	this.commit = function(name, text) {
		// console.log('commit', text);
		var commit = {name: name, text: text};
		$http.post('http://localhost/commit', commit).success(function(data) {
			console.log('Commit Return', data);
		});
	};

	this.pull = function(name) {
		// console.log('pull', name);
		var pull = {name: name};
		$http.post('http://localhost/pull', pull).success(function(data) {
			console.log('Pull Return', data);
		});
	};

	this.push = function(name) {
		// console.log('push');
		var push = {name: name};
		$http.post('http://localhost/push', push).success(function(data) {
			console.log('Push Return', data);
		});
	};
}]);