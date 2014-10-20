var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("defaultController", function($scope, $http, $location, $state, userService) {

	console.log('got into defaultController');
	
	if (userService.redirectSpec.view != null) {
		console.log("Overriden redirect");
		var view = userService.redirectSpec.view;
		userService.redirectSpec.view = null;
		$state.go(view, userService.redirectSpec.params);
	}
	else {
		console.log("standard redirect");
		$scope.switchToDefaultMeasureComparativeView();
	}

});
