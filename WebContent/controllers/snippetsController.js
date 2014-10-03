var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("snippetsController", function($scope, $state, reportingPeriodService) {
	
console.log('got into snippetsController');


	$scope.reportingPeriod = reportingPeriodService.reportingPeriod;
	
	$scope.selectReportingPeriod = function(selectedValue) {
		 reportingPeriodService.setSelectedItemByUseValue(selectedValue);
		 $scope.reportingPeriod = reportingPeriodService.reportingPeriod;
		 $state.go('snippets', {'reportingPeriod' : selectedValue});
	};
	
});
