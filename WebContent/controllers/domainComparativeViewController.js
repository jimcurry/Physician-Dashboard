var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("domainComparativeViewController", function($scope, $sce, $http, $stateParams, ngDialog, userService, reportingPeriodService, networkHierarchyService, programService, reportInfoService) {

	// Make sure services are initialized 
	if (!userService.user.isInitialized) {
		userService.redirectSpec.view = "domainComparativeView";
		userService.redirectSpec.params = $stateParams;
		$scope.switchToDefaultView();
		return;
	}

	// make sure url parameters are the currently selected ones in
	// their respective service.
	var invalidUrlParm = false;

	var hierarchyIdParm = parseInt($stateParams.hierarchyId);
	if (networkHierarchyService.network.selectedHierarchyNode.hierarchyId !== hierarchyIdParm) {
		networkHierarchyService.setSelectedNode(hierarchyIdParm);
		if (networkHierarchyService.network.selectedHierarchyNode.hierarchyId !== hierarchyIdParm) {
			invalidUrlParm = true;
		}
	}

	var reportingPeriodParm = $stateParams.reportingPeriod;
	if (reportingPeriodService.reportingPeriod.selectedItem.useValue !== reportingPeriodParm) {
		reportingPeriodService.setSelectedItemByUseValue(reportingPeriodParm);
		if (reportingPeriodService.reportingPeriod.selectedItem.useValue != reportingPeriodParm) {
			invalidUrlParm = true;
		}
	}
	
	// If url had bad values repaint the view so it will pick up the new values.
	if (invalidUrlParm) {
		$scope.switchToDefaultDomainComparativeView();
		return;
	}

	//bind data that view uses
	$scope.user = userService.user;
	$scope.network = networkHierarchyService.network;
	$scope.reportingPeriod = reportingPeriodService.reportingPeriod;
	$scope.program = programService.programData;
	
	//Handles when the reporting period is changed
	$scope.selectReportingPeriod = function(selectedValue) {
		 reportingPeriodService.setSelectedItemByUseValue(selectedValue);
		 $scope.switchToDefaultDomainComparativeView();
	};

	//Set up the view switcher
	$scope.viewList = [
							"Measure Comparative View"
							];
	$scope.selectedView = "Domain Comparative View";

 	$scope.selectView = function(view) {
		if (view == "Measure Comparative View") {
			$scope.switchToDefaultMeasureComparativeView();
		}
	};

	// fix up html so it doesn't report security errors
	$scope.renderHtml = function(html_code){
		return $sce.trustAsHtml(html_code);
	};

	// Handles tree view for level selection
	$scope.openNetworkHierarchy = function () {
		ngDialog.openConfirm({
			template: './views/networkHierarchyDialog.html',
			className: 'ngdialog-theme-default'
		}).then(function (value) {
			networkHierarchyService.setSelectedNode($scope.network.tempSelectedHierarchyNode.hierarchyId);
			
			if (networkHierarchyService.network.selectedHierarchyNode.programId != programService.programData.selectedProgram.programId) {
				programService.selectProgram(networkHierarchyService.network.selectedHierarchyNode.programId);
			}
			
			$scope.switchToDefaultDomainComparativeView();
		}, function() {
			$scope.network.tempSelectedHierarchyNode.selected = false;
		});
	};

	// handles level change made via breadcrumb
	$scope.$on('BREADCRUMB_ENTITY_SELECTION', function () {
		$scope.switchToDefaultDomainComparativeView();
	});
	
	// Make RESTful call to run summary report.
	$scope.loadSummaryPane = function(){
		$scope.summaryPaneContent = '<div><table width="100%"><tr><td width="100%" align="center"><img style="width:32px;height:32px" src="./images/loading.gif"/></td></tr></div>';

		var url = reportInfoService.getHtmlFragmentReportString("DomainComparativeSummary") + 
			"&p_pLevelType=" + $scope.network.selectedHierarchyNode.data.type + 
			"&p_pLevelId=" + $scope.network.selectedHierarchyNode.data.id + 
			"&p_pReportingPeriod=" + $scope.reportingPeriod.selectedItem.useValue;
		var request = $http.get(url);
		request.then(function(report_response){
			$scope.summaryPaneContent = report_response.data;
		}, function(report_response){
			if (report_response.status == "403") {
				// use write/read/write lock to make sure only one redirect is done.
				if (userService.redirectSpec.view == null) {
					userService.redirectSpec.view = "Summary";
					if (userService.redirectSpec.view == "Summary") {
						userService.user.isInitialized = false;
						userService.redirectSpec.view = "domainComparativeView";
						userService.redirectSpec.params = $stateParams;
						$scope.switchToDefaultView();
						return;
					}
				}
			}
			else {
				$scope.summaryPaneContent = 'Error encountered, status message returned was "' + report_response.statusText + '"';
			}
		});
	};

	// Make RESTful call to run detail report.
	$scope.loadContentPane = function(){
		$scope.contentPaneContent = '<div><table width="100%"><tr><td width="100%" align="center"><img style="width:32px;height:32px" src="./images/loading.gif"/></td></tr></div>';
		
		var url = reportInfoService.getHtmlFragmentReportString("DomainComparativeDetail") + 
			"&p_p_level=" + $scope.network.selectedHierarchyNode.data.type + 
			"&p_p_level_id=" + $scope.network.selectedHierarchyNode.data.id + 
			"&p_p_selected_date=" + $scope.reportingPeriod.selectedItem.useValue;
		var request = $http.get(url);
		request.then(function(report_response){
			$scope.contentPaneContent = report_response.data;
		}, function(report_response){
			if (report_response.status == "403") {
				// use write/read/write lock to make sure only one redirect is done.
				if (userService.redirectSpec.view == null) {
					userService.redirectSpec.view = "Detail";
					if (userService.redirectSpec.view == "Detail") {
						userService.user.isInitialized = false;
						userService.redirectSpec.view = "domainComparativeView";
						userService.redirectSpec.params = $stateParams;
						$scope.switchToDefaultView();
						return;
					}
				}
			}
			else {
				$scope.summaryPaneContent = 'Error encountered, status message returned was "' + report_response.statusText + '"';
			}
		});
	};

	$scope.loadSummaryPane();
	$scope.loadContentPane();
});
