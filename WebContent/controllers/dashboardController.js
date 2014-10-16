var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("dashboardController", function($scope, $http, userService, networkHierarchyService) {
	$scope.user = userService.user;
	$scope.network = networkHierarchyService.network;

	$scope.resetSelectedEntity = function(hierarchyId) {
		networkHierarchyService.setSelectedNode(hierarchyId);
		$scope.$broadcast("BREADCRUMB_ENTITY_SELECTION");
		
		return false;
	};
});
