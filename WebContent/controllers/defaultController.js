var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("defaultController", function($scope, $http, $state, userService) {

	console.log('got into defaultController');

	if (userService.redirectSpec.view) {
		console.log("Overriden redirect");
		$state.go(userService.redirectSpec.view, userService.redirectSpec.params);
		userService.redirectSpec.view = null;
	}
	else {
		console.log("standard redirect");
		$state.go('measureComparativeView', {});
	}

});
