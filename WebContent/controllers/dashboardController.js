var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("dashboardController", function($scope, $http, $state, userService, networkHierarchyService, programService,
		reportingPeriodService, measureService, progressBarService) {
	
	$scope.user = userService.user;
	$scope.network = networkHierarchyService.network;
	$scope.progressBarData = progressBarService.progressBarData;

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

	$scope.switchToDefaultDomainComparativeView = function() {
		$state.go("domainComparativeView", {
			"hierarchyId" : networkHierarchyService.network.selectedHierarchyNode.hierarchyId,
			"reportingPeriod" : reportingPeriodService.reportingPeriod.selectedItem.useValue
		});
	};

	$scope.switchToDefaultMeasureDetailView = function() {
		$state.go("measureDetailView", {
			"hierarchyId" : networkHierarchyService.network.selectedHierarchyNode.hierarchyId,
			"reportingPeriod" : reportingPeriodService.reportingPeriod.selectedItem.useValue,
			"measureGroupCode" : measureService.measureData.data.measureGroupCode,
			"measureCode" : measureService.measureData.data.measureCode
		});
	};
	
	$scope.switchToDefaultDomainSummaryView = function() {
		$state.go("domainSummaryView", {
			"hierarchyId" : networkHierarchyService.network.selectedHierarchyNode.hierarchyId,
			"reportingPeriod" : reportingPeriodService.reportingPeriod.selectedItem.useValue
		});
	};
	$scope.switchToDefaultView = function() {
		$state.go("default", {});
	};

});
