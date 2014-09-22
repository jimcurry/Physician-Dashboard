var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("dashboardController", function($scope, $http, UserService) {

	UserService.initialize();
	
	$scope.user = UserService.user;
});
