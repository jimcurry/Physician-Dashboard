(function() {
	var tree;
	var app = angular.module('dashboardApp');
	
	app.controller('networkHierarchyController', function($scope, $timeout, networkHierarchyService, userService) {
		$scope.user = userService.user;
		$scope.selectedLabel = networkHierarchyService.network.selectedHierarchyNode.label;
		
		
		$scope.my_tree_handler = function(branch) {
			networkHierarchyService.network.tempSelectedHierarchyNode = branch;
		};

		$scope.my_data = networkHierarchyService.network.hierarchy;

		$scope.my_tree = tree = {};

	});

}).call(this);