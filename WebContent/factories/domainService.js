var dashboardApp = angular.module("dashboardApp");

dashboardApp.constant("serverURL", "http://C3dupceapr1.premierinc.com:9010");

dashboardApp.factory("domainService", function($http, $q, serverURL) {
	var domainData = {
		data : null,
		selectedDomain : null
	};
	
	domainData.data = [
                       {name:"Preventative Health", id: "1"},
                       {name:"At-Risk Population", id: "2"},
                       {name:"Care Coordination / Patient Safety", id: "3"},
                       {name:"Patient / Caregiver Experience", id: "4"}
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
