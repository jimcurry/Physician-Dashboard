var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("programService", function($http, $q, userService, DropwizardURL) {
	var programData = {
		data : null,
		selectedProgram : null,
		selectedDomain : null
	};
	

	function initialize() {
		console.log('Initialize programService');
		var deferred = $q.defer();
		if (programData.data) {
			console.log('programService Already Initialized');
			deferred.resolve('Already Initialized');
		}
		else {
			$http.get(DropwizardURL + "/program?userName=" + userService.user.userName).success(function(data) {
				programData.data = data;
				deferred.resolve('Initialized');
			}).error(function(data, status) {
				deferred.reject('failed -' + status);
			});
		}
		return deferred.promise;
	}
	
	function selectProgram(programId) {
		programData.selectedProgram = null;
		programData.selectedDomain = null;

		for (var i = 0; i < programData.data.length; i++) {
			if (programData.data[i].programId == programId) {
				this.programData.selectedProgram = programData.data[i];
				this.programData.selectedDomain = programData.data[i].domains;
				break;
			}
		}
	}
	
	return {
		programData : programData,
		selectProgram : selectProgram,
		initialize : initialize
	};
});
