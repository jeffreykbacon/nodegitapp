var app = angular.module('nodeGitTest', []);

app.controller('MainCtrl', ['$scope','gitService', function($scope, gitService){
    $scope.name;
    $scope.url;
    $scope.text = 'Hello world!';

    $scope.clone = function() {
        // console.log('Project Name', $scope.name);
        // console.log('Url', $scope.url);
        gitService.clone($scope.name, $scope.url);
    };

    $scope.commit = function() {
        // console.log('Text', $scope.text);
        gitService.commit($scope.name, $scope.text);
    };

    $scope.pull = function() {
        // console.log('Pull');
        gitService.pull($scope.name);
    };

    $scope.push = function() {
        // console.log('Push');
        gitService.push($scope.name);
    };   
}]);
