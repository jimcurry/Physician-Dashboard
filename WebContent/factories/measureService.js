var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("measureService", function() {

	var measureData = {
		measure : [ {
			selectedCode : null,
			selectedType : null
		} ]
	};
	
	return {
		measureData : measureData
	};
});
