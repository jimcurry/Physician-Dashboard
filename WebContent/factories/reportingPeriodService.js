var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("reportingPeriodService", function($http, $q, DropwizardURL) {
	//format of data
	//[12]
	//		0:	{
	//			useValue: "20140701"
	//			displayValue: "2014 July"
	//			}
	var reportingPeriod = {
		data : null,
		selectedItem : null
	};

	function initialize() {
		//console.log('Initialize reportingPeriodService');
		var deferred = $q.defer();
		if (reportingPeriod.data) {
			//console.log('reportingPeriodService Already Initialized');
			deferred.resolve('Already Initialized');
		}
		else {
			$http.get(DropwizardURL + "/reportingPeriod?numberMonths=12").success(function(data) {
				reportingPeriod.data = data;
				reportingPeriod.selectedItem = reportingPeriod.data[0];
				deferred.resolve('Initialized');
			}).error(function(data, status) {
				deferred.reject('failed -' + status);
			});
		}
		return deferred.promise;
	}
	;

	function setSelectedItemByUseValue(useValue) {
		reportingPeriod.selectedItem = reportingPeriod.data[0];
		
		for (var i = 0; i < reportingPeriod.data.length; i++) {
			if (reportingPeriod.data[i].useValue === useValue) {
				reportingPeriod.selectedItem = reportingPeriod.data[i];
				return;
			}
		}
	}
	;

	return {
		reportingPeriod : reportingPeriod,
		initialize : initialize,
		setSelectedItemByUseValue : setSelectedItemByUseValue
	};
});