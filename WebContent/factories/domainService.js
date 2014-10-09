var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("domainService", function($http, $q, userService, DropwizardURL) {
	var domainData = {
		data : null,
		selectedDomain : null
	};
	

	function initialize() {
		console.log('Initialize domainService');
		var deferred = $q.defer();
		if (domainData.data) {
			console.log('domainService Already Initialized');
			deferred.resolve('Already Initialized');
		}
		else {
			$http.get(DropwizardURL + "/domain?userName=" + userService.user.userName).success(function(data) {
				domainData.data = data;
				domainData.selectedDomain = domainData.data[0];
				deferred.resolve('Initialized');
			}).error(function(data, status) {
				deferred.reject('failed -' + status);
			});
		}
		return deferred.promise;
	}
	;
	
	return {
		domainData : domainData,
		initialize : initialize
	};
});
