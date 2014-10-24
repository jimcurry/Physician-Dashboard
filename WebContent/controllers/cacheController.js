var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("cacheController", function($scope, $state, cacheService) {

	if (cacheService.cacheData.isEnabled) {
		cacheService.enable(false);
	}
	else {
		cacheService.enable(true);
	}
	$scope.switchToDefaultMeasureComparativeView();
});
