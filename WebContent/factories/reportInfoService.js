var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("reportInfoService", function($http, $q, userService, DropwizardURL, CognosMashupURL) {

//	format of reportData
//	[2]
//	0:	{
//		reportCode: "MeasureComparativeDetail"
//		reportId: "i4132A77180884F17B401B9D45D816FE9"
//		}

	var reportData = [];

	function initialize() {
		//console.log('Initialize reportInfoService');
		var deferred = $q.defer();
		if (reportData.length > 0) {
			//console.log('reportInfoService Already Initialized');
			deferred.resolve('Already Initialized');
		}
		else {
			$http.get(DropwizardURL + "/reportInfo?userName=" + userService.user.userName).success(function(data) {
				reportData = data;
				deferred.resolve('Initialized');
			}).error(function(data, status) {
				deferred.reject('failed -' + status);
			});
		}
		return deferred.promise;
	}

	function getHtmlFragmentReportString(reportCode) {
		var reportId = null;
		for (var i = 0; i < reportData.length; i++) {
			if (reportData[i].reportCode == reportCode) {
				reportId = reportData[i].reportId;
			}
		}
		
		return CognosMashupURL + "/reportData/report/" + reportId + "?fmt=htmlFragment&async=off&includeLayout=true";
	}

	return {
		reportData : reportData,
		getHtmlFragmentReportString : getHtmlFragmentReportString,
		initialize : initialize
	};
});
