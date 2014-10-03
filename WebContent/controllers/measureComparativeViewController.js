var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("measureComparativeViewController", function($scope, $http, $state, $stateParams, $location, ngDialog, userService, reportingPeriodService, networkHierarchyService, CognosMashupURL, CognosNamespace) {

	$scope.user = userService.user;
	
	$scope.network = networkHierarchyService.network;
	$scope.reportingPeriod = reportingPeriodService.reportingPeriod;
	
	$scope.selectReportingPeriod = function(selectedValue) {
		 reportingPeriodService.setSelectedItemByUseValue(selectedValue);
		 $scope.reportingPeriod = reportingPeriodService.reportingPeriod;
		 //$state.go('measureComparativeView', {'reportingPeriod' : selectedValue});
	};

	$scope.parm1 = $stateParams.parm1;
	
	$scope.changeParm1 = function() {
		$state.go('view1', {'parm1' : $scope.parm1});
	};

	$scope.openNetworkHierarchy = function () {
		ngDialog.openConfirm({
			template: './views/networkHierarchyDialog.html',
			className: 'ngdialog-theme-default'
		}).then(function (value) {
			$scope.network.selectedHierarchyNode = $scope.network.tempSelectedHierarchyNode;
			//$scope.refreshScreen();
		}, function() {
			$scope.network.tempSelectedHierarchyNode.selected = false;
			console.log('Modal promise rejected.');
		});
	};
	

//		$scope.$watch('parm1', function(newValue, oldValue) {
//		if (newValue != oldValue) {
//			$state.go('view1', {'parm1' : newValue});
//		}
//	});
	
});
