var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("dashboardController", function($scope, $http, $state, userService, networkHierarchyService, programService,
		reportingPeriodService) {
	$scope.user = userService.user;
	$scope.network = networkHierarchyService.network;

	$scope.resetSelectedEntity = function(hierarchyId) {
		networkHierarchyService.setSelectedNode(hierarchyId);
		$scope.$broadcast("BREADCRUMB_ENTITY_SELECTION");

		return false;
	};

	$scope.switchToDefaultMeasureComparativeView = function() {
		$state.go("measureComparativeView", {
			"hierarchyId" : networkHierarchyService.network.selectedHierarchyNode.hierarchyId,
			"reportingPeriod" : reportingPeriodService.reportingPeriod.selectedItem.useValue,
			"domainId" : programService.programData.selectedDomain.id
		});
	};

	$scope.switchToDefaultView = function() {
		$state.go("default", {});
	};

});
