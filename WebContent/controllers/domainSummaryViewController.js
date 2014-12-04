var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("domainSummaryViewController", function($scope, $window, $sce, $http, $stateParams, ngDialog, userService, reportingPeriodService, networkHierarchyService, programService, measureService, reportInfoService, cacheService) {

	// Make sure services are initialized 
	if (!userService.user.isInitialized) {
		userService.redirectSpec.view = "domainSummaryView";
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
		$scope.switchToDefaultDomainSummaryView();
		return;
	}
	
	// This page doesn't support practitioner level if move up a level if that is where we are.
	if (networkHierarchyService.network.selectedHierarchyNode.data.type == "PRACTITIONER") {
		networkHierarchyService.setSelectedNode(networkHierarchyService.network.selectedHierarchyNode.parentHierarchyId);
		$scope.switchToDefaultDomainSummaryView();
		return;
	}

	
	//bind data that view uses
	$scope.user = userService.user;
	$scope.network = networkHierarchyService.network;
	$scope.reportingPeriod = reportingPeriodService.reportingPeriod;
	$scope.program = programService.programData;
	$scope.divHeight = 400;
	
	//Handles when the reporting period is changed
	$scope.selectReportingPeriod = function(selectedValue) {
		 reportingPeriodService.setSelectedItemByUseValue(selectedValue);
		 $scope.switchToDefaultDomainSummaryView();
	};

	//Set up the view switcher
	$scope.viewList = [
							"Domain Comparative",
							"Measure Comparative"
							];
	$scope.selectedView = "Domain Summary";

 	$scope.selectView = function(view) {
		if (view == "Domain Comparative") {
			$scope.switchToDefaultDomainComparativeView();
		}
		else if (view == "Measure Comparative") {
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
			
			$scope.switchToDefaultDomainSummaryView();
		}, function() {
			if ($scope.network.tempSelectedHierarchyNode != null) {
				$scope.network.tempSelectedHierarchyNode.selected = false;
			}
		});
	};

	// handles level change made via breadcrumb
	$scope.$on('BREADCRUMB_ENTITY_SELECTION', function () {
		$scope.switchToDefaultDomainSummaryView();
	});
	
	// handles level change made clicking on the column in the detail report
	measuresummaryClicked = function( measureCode, measureGroupCode) {
		measureService.getMeasure(measureCode, measureGroupCode).then(function(report_response) {
			$scope.switchToDefaultMeasureDetailView();
		});
	};
	// Make RESTful call to run summary report.
	$scope.loadSummaryPane = function(){
		var parmString =	"&p_pLevelType=" + $scope.network.selectedHierarchyNode.data.type + 
								"&p_pLevelId=" + $scope.network.selectedHierarchyNode.data.id + 
								"&p_pReportingPeriod=" + $scope.reportingPeriod.selectedItem.useValue +
								"&p_pProgramId="+ programService.programData.selectedProgram.programId;

		var cacheData = cacheService.get("DomainSummarySummary" + parmString);
		if (cacheData != null) {
			$scope.summaryPaneContent = cacheData.data;
			return;
		}

		$scope.summaryPaneContent = '<div style="height: 75px"><table style="width: 100%; height:100%; margin:0; padding:0; border:0;"><tr><td style="vertical-algin: middle; text-align:center;"><img style="width:32px;height:32px" src="./images/loading.gif"/></td></tr></div>';

		var url = reportInfoService.getHtmlFragmentReportString("DomainSummarySummary") + parmString;

		var request = $http.get(url);
		request.then(function(report_response){
			cacheService.push("DomainSummarySummary" + parmString, report_response.data);

			$scope.summaryPaneContent = report_response.data;
		}, function(report_response){
			if (report_response.status == "403") {
				// use write/read/write lock to make sure only one redirect is done.
				if (userService.redirectSpec.view == null) {
					userService.redirectSpec.view = "Summary";
					if (userService.redirectSpec.view == "Summary") {
						userService.user.isInitialized = false;
						userService.redirectSpec.view = "domainSummaryView";
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
		//figure out target level for report
		var targetLevel = networkHierarchyService.network.selectedHierarchyNode.data.type;
		if (targetLevel == "PRACTITIONER") {
				targetLevel = "99";
		}

		var parmString =	"&p_p_level=" + targetLevel + 
								"&p_pLevelId=" + $scope.network.selectedHierarchyNode.data.id + 
								"&p_pReportingPeriod=" + $scope.reportingPeriod.selectedItem.useValue +
								"&p_p_target_level=" + targetLevel +
								"&p_pProgramId=" + programService.programData.selectedProgram.programId;	

		var cacheData = cacheService.get("DomainSummaryDetail" + parmString);
		if (cacheData != null) {
			$scope.contentPaneContent = cacheData.data;
			return;
		}

		$scope.contentPaneContent = '<div style="height : 100px"><table style="width: 100%; height:100%; margin:0; padding:0; border:0;"><tr><td style="vertical-algin: middle; text-align:center;"><img style="width:32px;height:32px" src="./images/loading.gif"/></td></tr></div>';

		var url = reportInfoService.getHtmlFragmentReportString("DomainSummaryDetail") + parmString;

		var request = $http.get(url);
		request.then(function(report_response){
			cacheService.push("DomainSummaryDetail" + parmString, report_response.data);

			$scope.contentPaneContent = report_response.data;
		}, function(report_response){
			if (report_response.status == "403") {
				// use write/read/write lock to make sure only one redirect is done.
				if (userService.redirectSpec.view == null) {
					userService.redirectSpec.view = "Detail";
					if (userService.redirectSpec.view == "Detail") {
						userService.user.isInitialized = false;
						userService.redirectSpec.view = "domainSummeryView";
						userService.redirectSpec.params = $stateParams;
						$scope.switchToDefaultView();
						return;
					}
				}
			}
			else {
				$scope.contentPaneContent = 'Error encountered, status message returned was "' + report_response.statusText + '"';
			}
		});
	};

	$scope.loadContentPane();
	$scope.loadSummaryPane();
});
