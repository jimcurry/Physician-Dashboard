var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("domainComparativeViewController", function($scope, $sce, $http, $state, $stateParams, $location, ngDialog, userService, reportingPeriodService, networkHierarchyService, domainService, CognosMashupURL, CognosNamespace) {

	$scope.user = userService.user;
	$scope.network = networkHierarchyService.network;
	$scope.reportingPeriod = reportingPeriodService.reportingPeriod;
	$scope.domainData = domainService.domainData;
	
	$scope.selectReportingPeriod = function(selectedValue) {
		 reportingPeriodService.setSelectedItemByUseValue(selectedValue);
		 $scope.reportingPeriod = reportingPeriodService.reportingPeriod;
		 $scope.refreshScreen();
	};

    $scope.viewList = [
                            {name:"Measure Comparative View", id: "MCV"},
                            {name:"Domain Comparative View", id: "DCV"}
                           ];
    $scope.selectedView = $scope.viewList[1];	

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
		$scope.refreshScreen();
	};

	$scope.refreshScreen = function() {
    	$scope.loadSummaryPane();
    	$scope.loadContentPane();
    };

    $scope.renderHtml = function(html_code){
		return $sce.trustAsHtml(html_code);
	};

	$scope.parm1 = $stateParams.parm1;
	
	$scope.changeParm1 = function() {
		$state.go('view1', {'parm1' : $scope.parm1});
	};

	$scope.loadSummaryPane = function(){

		$scope.summaryPaneContent = '<div><table width="100%"><tr><td width="100%" align="center"><img style="width:110px;height:110px" src="./images/loading.gif"/></td></tr></div>';
		
		var url = "https://c3duhcogapp1.premierinc.com:9444/ServletGateway/servlet/Gateway/rds/reportData/report/i695EA1FFD93A4774BA260E7294CC0EFF?fmt=htmlFragment&async=off&includeLayout=true&p_pLevelType=" + $scope.network.selectedHierarchyNode.data.type + "&p_pLevelId=" + $scope.network.selectedHierarchyNode.data.id + "&p_pReportingPeriod=" + $scope.reportingPeriod.selectedItem.useValue + "&p_pDomainName=" + $scope.domainData.selectedDomain.id;
		var request = $http.get(url);
		request.then(function(report_response){
			$scope.summaryPaneContent = report_response.data;
		}, function(report_response){
			$scope.summaryPaneContent = "Error";
		});
	};
	
	$scope.loadContentPane = function(){

		$scope.contentPaneContent = '<div><table width="100%"><tr><td width="100%" align="center"><img style="width:110px;height:110px" src="./images/loading.gif"/></td></tr></div>';
		
		var url = "https://c3duhcogapp1.premierinc.com:9444/ServletGateway/servlet/Gateway/rds/reportData/report/i4132A77180884F17B401B9D45D816FE9?fmt=htmlFragment&async=off&includeLayout=true&p_p_level=" + $scope.network.selectedHierarchyNode.data.type + "&p_p_level_id=" + $scope.network.selectedHierarchyNode.data.id + "&p_p_selected_date=" + $scope.reportingPeriod.selectedItem.useValue + "&p_p_domain_num=" + $scope.domainData.selectedDomain.id;
		var request = $http.get(url);
		request.then(function(report_response){
			$scope.contentPaneContent = report_response.data;
		}, function(report_response){
			$scope.contentPaneContent = "Error";
		});
	};

	$scope.openNetworkHierarchy = function () {
		ngDialog.openConfirm({
			template: './views/networkHierarchyDialog.html',
			className: 'ngdialog-theme-default'
		}).then(function (value) {
			$scope.network.selectedHierarchyNode = $scope.network.tempSelectedHierarchyNode;
			$scope.refreshScreen();
		}, function() {
			$scope.network.tempSelectedHierarchyNode.selected = false;
			console.log('Modal promise rejected.');
		});
	};
		
});
