var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("programService", function($http, $q, userService, DropwizardURL, progressBarService) {

//format of "data"
//[2]
//	0:{
//		programName: "Medicare Shared Savings Program"
//		programId: "1"
//		domains: [4]
//			0:	{
//					id: "1"
//					name: "Preventive Health"
//					measures: [8]
//					0:  {
//							measureCode: "ACO16"
//							measureGroupCode: "ACO"
//							measureTypeCode: "Percent"
//							reverseScoreInd: "N"
//							ranges: null
//					}-
//				}
//		...
	var programData = {
		data : null,
		selectedProgram : null,
		selectedProgramDomains : null,
		selectedDomain : null
	};

	function initialize() {
		//console.log('Initialize programService');
		var deferred = $q.defer();
		if (programData.data) {
			//console.log('programService Already Initialized');
			progressBarService.progressBarData.value++;
			deferred.resolve('Already Initialized');
		}
		else {
			$http.get(DropwizardURL + "/program?userName=" + userService.user.userName).success(function(data) {
				progressBarService.progressBarData.value++;
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
		programData.selectedProgramDomains = null;
		programData.selectedDomain = null;

		for (var i = 0; i < programData.data.length; i++) {
			if (programData.data[i].programId == programId) {
				this.programData.selectedProgram = programData.data[i];
				this.programData.selectedProgramDomains = programData.data[i].domains;
				this.programData.selectedDomain = programData.data[i].domains[0];
				break;
			}
		}
	}
	
	function selectDomain(domainId) {
		programData.selectedDomain = programData.selectedProgramDomains[0];

		for (var i = 0; i < programData.selectedProgramDomains.length; i++) {
			if (programData.selectedProgramDomains[i].id == domainId) {
				programData.selectedDomain = programData.selectedProgramDomains[i];
				break;
			}
		}
	}
	return {
		programData : programData,
		selectProgram : selectProgram,
		selectDomain : selectDomain,
		initialize : initialize
	};
});
