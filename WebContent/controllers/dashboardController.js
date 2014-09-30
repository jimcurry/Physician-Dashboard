var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("dashboardController", function($scope, $http, UserService) {
	$scope.user = UserService.user;
	console.log('got into dashboardController');
});
