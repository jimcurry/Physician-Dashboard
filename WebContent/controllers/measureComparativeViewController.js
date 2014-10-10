var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("measureComparativeViewController", function($scope, $sce, $http, $state, $stateParams, $location, ngDialog, userService, reportingPeriodService, networkHierarchyService, domainService, CognosMashupURL, CognosNamespace) {

	if (!userService.user.isInitialized) {
		userService.redirectSpec.view = "view1";
		userService.redirectSpec.params = {"parm1" : "abc"};
		$state.go('default', {});
	}
	
	$scope.user = userService.user;
	$scope.network = networkHierarchyService.network;
	$scope.reportingPeriod = reportingPeriodService.reportingPeriod;
	$scope.domainData = domainService.domainData;
	
	$scope.selectReportingPeriod = function(selectedValue) {
		 reportingPeriodService.setSelectedItemByUseValue(selectedValue);
		 $scope.reportingPeriod = reportingPeriodService.reportingPeriod;
		 //$state.go('measureComparativeView', {'reportingPeriod' : selectedValue});
	};

    $scope.viewList = [
                            {name:"Measure Comparative View", id: "MCV"},
                            {name:"Domain Comparative View", id: "DCV"}
                           ];
    $scope.selectedView = $scope.viewList[0];	

	$scope.isSelected = function(domain) {
		if ($scope.domainData.selectedDomain.id == domain.id) {
			return true;
		} else {
			return false;
		}
	};

	$scope.selectView = function(view) {
		$scope.selectedView = view;
	};

    $scope.loadTab = function(domain) {
		$scope.domainData.selectedDomain = domain;
			
		$scope.summaryPaneContent = "<p>" + domain.name + "</p>";
	};

	$scope.renderHtml = function(html_code){
		return $sce.trustAsHtml(html_code);
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
