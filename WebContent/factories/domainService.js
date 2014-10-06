var dashboardApp = angular.module("dashboardApp");

dashboardApp.constant("serverURL", "http://C3dupceapr1.premierinc.com:9010");

dashboardApp.factory("domainService", function($http, $q, serverURL) {
	var domainData = {
		data : null,
		selectedDomain : null
	};
	
	domainData.data = [
                       {name:"Preventative Health", id: "D1"},
                       {name:"At-Risk Population", id: "D2"},
                       {name:"Patient Safety", id: "D3"},
                       {name:"Patient Experience", id: "D4"}
                      ];
	
	domainData.selectedDomain = domainData.data[0];

	function initialize() {
		//var deferred = $q.defer();
		//if (dropdownData.data) {
		//	deferred.resolve(domainData.data);
		//} else {
			//$http.get(serverURL + "/date/monthRange?startMonth=201407&numberMonths=12")
			//	.success(function(data) {
			//		dropdownData.data = data;
			//		dropdownData.selectedDate = dropdownData.data[0];
			//		deferred.resolve(dropdownData.data);})
			//	.error(function(data, status) {
			//		deferred.reject(status);});
		//}
		//return deferred.promise;
	};
	
	return {
		domainData : domainData,
		initialize : initialize
	};
});
