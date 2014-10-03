var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("dashboardController", function($scope, $http, userService) {
	$scope.user = userService.user;
	console.log('got into dashboardController');
});
