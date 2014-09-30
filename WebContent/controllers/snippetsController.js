var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("snippetsController", function($scope, $state, ReportingPeriodService) {
	
console.log('got into snippetsController');


	$scope.reportingPeriod = ReportingPeriodService.reportingPeriod;
	
	$scope.selectReportingPeriod = function(selectedValue) {
		 ReportingPeriodService.setSelectedItemByUseValue(selectedValue);
		 $scope.reportingPeriod = ReportingPeriodService.reportingPeriod;
		 $state.go('snippets', {'reportingPeriod' : selectedValue});
	};
	
});
