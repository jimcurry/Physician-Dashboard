var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("defaultController", function($scope, $http, $location, $state, userService, progressBarService) {

	//console.log('got into defaultController');
	
	progressBarService.progressBarData.visable = false;
	
	if (userService.redirectSpec.view != null) {
		//console.log("Overridden redirect");
		var view = userService.redirectSpec.view;
		userService.redirectSpec.view = null;
		$state.go(view, userService.redirectSpec.params);
	}
	else {
		//console.log("Standard redirect");
		$scope.switchToDefaultDomainSummaryView();
	}

});
