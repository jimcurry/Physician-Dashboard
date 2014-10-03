var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("networkHierarchyService", function($http, $q, DropwizardURL, userService) {

	var network = {
		hierarcy : null,
		selectedHierarchyNode : null,
		tempSelectedHierarchyNode : null
	};

	function initialize() {
		console.log('Initialize NetworkHierarchyService');
		var deferred = $q.defer();
		if (network.hierarchy) {
			console.log('NetworkHierarchyService Already Initialized');
			deferred.resolve(network.hierarchy);
		}
		else {
			$http.get(DropwizardURL + "/organization/hierarchy?userName=" + userService.user.userName).success(function(data) {
				network.hierarchy = data;
				network.selectedHierarchyNode = network.hierarchy[0];
				deferred.resolve(network.hierarchy);
			}).error(function(data, status) {
				deferred.reject(status);
			});
		}
		return deferred.promise;
	}
	;

	return {
		network : network,
		initialize : initialize
	};

});
