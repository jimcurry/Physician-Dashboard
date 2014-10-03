var tree;

var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller('networkHierarchyController', function($scope, $timeout, networkHierarchy) {
	$scope.selectedLabel = networkHierarchy.network.selectedHierarchyNode.label;
	
	
	$scope.my_tree_handler = function(branch) {
		networkHierarchy.network.tempSelectedHierarchyNode = branch;
	};

	$scope.my_data = networkHierarchy.network.hierarchy;

	$scope.my_tree = tree = {};
});