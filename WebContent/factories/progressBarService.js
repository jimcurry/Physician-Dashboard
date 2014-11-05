var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("progressBarService", function() {

	var progressBarData = {
		max : 6,
		value : 0,
		visable : false
	};
	
	return {
		progressBarData : progressBarData
	};
});
