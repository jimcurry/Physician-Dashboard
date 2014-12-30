var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("measureSummaryViewController", function($scope, $sce, $http, $stateParams, ngDialog, userService, reportingPeriodService, networkHierarchyService, programService, reportInfoService, cacheService, measureService) {

	// Make sure services are initialized 
	if (!userService.user.isInitialized) {
		userService.redirectSpec.view = "measureSummaryView";
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
	
	var domainIdParm = String($stateParams.domainId);
	if (programService.programData.selectedDomain.id !== domainIdParm) {
		programService.selectDomain(domainIdParm);
		if (programService.programData.selectedDomain.id !== domainIdParm) {
			invalidUrlParm = true;
		}
	}
	
	// This page doesn't support practitioner level if move up a level if that is where we are.
	if (networkHierarchyService.network.selectedHierarchyNode.data.type == "PRACTITIONER") {
		networkHierarchyService.setSelectedNode(networkHierarchyService.network.selectedHierarchyNode.parentHierarchyId);
		$scope.switchToDefaultDomainComparativeView();
		return;
	}

	// If url had bad values repaint the view so it will pick up the new values.
	if (invalidUrlParm) {
		$scope.switchToDefaultMeasureSummaryView();
		return;
	}
	
	//bind data that view uses
	$scope.user = userService.user;
	$scope.network = networkHierarchyService.network;
	$scope.reportingPeriod = reportingPeriodService.reportingPeriod;
	$scope.domainData = programService.programData.selectedProgramDomains;
	$scope.program = programService.programData;
	$scope.measure = measureService.measureData;
	$scope.benchmarkData = [{displayValue: "10th Percentile", useValue : 10 },
	                        {displayValue: "20th Percentile", useValue : 20 },
	                        {displayValue: "30th Percentile", useValue : 30 },
	                        {displayValue: "40th Percentile", useValue : 40 },
	                        {displayValue: "50th Percentile", useValue : 50 },
	                        {displayValue: "60th Percentile", useValue : 60 },
	                        {displayValue: "70th Percentile", useValue : 70 },
	                        {displayValue: "80th Percentile", useValue : 80 },
	                        {displayValue: "90th Percentile", useValue : 90 }
	];
	
	//Handles when the reporting period is changed
	$scope.selectReportingPeriod = function(selectedValue) {
		 reportingPeriodService.setSelectedItemByUseValue(selectedValue);
		 $scope.switchToDefaultMeasureSummaryView();
	};

	$scope.selectBenchmark = function(benchmark) {
		measureService.measureData.selectedBenchmark = benchmark;
		$scope.loadContentPane();
	};
	
	//Set up the view switcher
	$scope.viewList = [
							"Domain Comparative",
							"Domain Summary",
							"Measure Comparative"
							];
	$scope.selectedView = "Measure Summary";

	$scope.selectView = function(view) {
		if (view == "Domain Comparative") {
			$scope.switchToDefaultDomainComparativeView();
		}
		else if (view == "Domain Summary") {
			$scope.switchToDefaultDomainSummaryView();
		}
		else if (view == "Measure Comparative") {
			$scope.switchToDefaultMeasureComparativeView();
		}
	};

	// Allows the selected tab to be highlighted
	$scope.isSelected = function(domain) {
		if (programService.programData.selectedDomain.id == domain.id) {
			return true;
		}
		else {
			return false;
		}
	};

	//Handles when the domain tab is changed
	$scope.loadTab = function(domain) {
		programService.selectDomain(domain.id);
		$scope.switchToDefaultMeasureSummaryView();
	};

	// fix up html so it doesn't report security errors
	$scope.renderHtml = function(html_code){
		return $sce.trustAsHtml(html_code);
	};
	
	// Handles tree view for level selection
	$scope.openNetworkHierarchy = function() {
		ngDialog.openConfirm({
			template : './views/networkHierarchyDialog.html',
			className : 'ngdialog-theme-default'
		}).then(function(value) {
			networkHierarchyService.setSelectedNode($scope.network.tempSelectedHierarchyNode.hierarchyId);

			if (networkHierarchyService.network.selectedHierarchyNode.programId != programService.programData.selectedProgram.programId) {
				programService.selectProgram(networkHierarchyService.network.selectedHierarchyNode.programId);
				$scope.domainData = programService.programData.selectedProgramDomains;
			}
			
			$scope.switchToDefaultMeasureSummaryView();
		}, function() {
			if ($scope.network.tempSelectedHierarchyNode != null) {
				$scope.network.tempSelectedHierarchyNode.selected = false;
			}
		});
	};

	// handles level change made via breadcrumb
	$scope.$on('BREADCRUMB_ENTITY_SELECTION', function () {
		$scope.switchToDefaultMeasureSummaryView();
	});

	// Make RESTful call to run summary report.
	var targetLevel = $scope.network.selectedHierarchyNode.data.type;
	if (targetLevel == "PRACTITIONER") {
			targetLevel = "99";
	}
	
	$scope.loadSummaryPane = function(){
		var parmString = 	"&p_pLevelType=" + targetLevel + 
								"&p_pLevelId=" + $scope.network.selectedHierarchyNode.data.id +
								"&p_pReportingPeriod=" + $scope.reportingPeriod.selectedItem.useValue + 
								"&p_pDomainId=" + programService.programData.selectedDomain.id;

		var cacheData = cacheService.get("MeasureSummarySummary" + parmString);
		if (cacheData != null) {
			$scope.summaryPaneContent = cacheData.data;
			return;
		}

		$scope.summaryPaneContent = '<div style="height : 60px;"><table style="width: 100%; height:100%; margin:0; padding:0; border:0;"><tr><td style="vertical-algin: middle; text-align:center;"><img src="./images/loading.gif"/></td></tr></div>';

		var url = reportInfoService.getHtmlFragmentReportString("MeasureSummarySummary") + parmString;

		var request = $http.get(url);
		request.then(function(report_response){
			cacheService.push("MeasureSummarySummary" + parmString, report_response.data);
			
			$scope.summaryPaneContent = report_response.data;
		}, function(report_response){
			if (report_response.status == "403") {
				// use write/read/write lock to make sure only one redirect is done.
				if (userService.redirectSpec.view == null) {
					userService.redirectSpec.view = "Summary";
					if (userService.redirectSpec.view == "Summary") {
						userService.user.isInitialized = false;
						userService.redirectSpec.view = "measureSymmaryView";
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
	$scope.loadContentPane = function() {
		var reportName = "MeasureSummaryDetail";
		
		var parmString = 	"&p_p_level=" + $scope.network.selectedHierarchyNode.data.type + 
								"&p_pLevelId=" + $scope.network.selectedHierarchyNode.data.id + 
								"&p_pReportingPeriod=" + $scope.reportingPeriod.selectedItem.useValue + 
								"&p_p_domain_id=" + programService.programData.selectedDomain.id +
								"&p_p_target_level=" + $scope.network.selectedHierarchyNode.data.type + 
								"&p_p_benchmark=" + measureService.measureData.selectedBenchmark.useValue;	

		var cacheData = cacheService.get(reportName + parmString);
		if (cacheData != null) {
			$scope.contentPaneContent = cacheData.data;
			return;
		}

		$scope.contentPaneContent = '<div style="height : 200px;"><table style="width: 100%; height:100%; margin:0; padding:0; border:0;"><tr><td style="vertical-algin: middle; text-align:center;"><img src="./images/loading.gif"/></td></tr></div>';

		var url = reportInfoService.getHtmlFragmentReportString(reportName) + parmString;

		var request = $http.get(url);
		request.then(function(report_response){
			var divText = report_response.data.replace(/6.500000in/g, "100%");
			
			cacheService.push(reportName + parmString, divText);

			$scope.contentPaneContent = divText;
		}, function(report_response){
			if (report_response.status == "403") {
				// use write/read/write lock to make sure only one redirect is done.
				if (userService.redirectSpec.view == null) {
					userService.redirectSpec.view = "Detail";
					if (userService.redirectSpec.view == "Detail") {
						userService.user.isInitialized = false;
						userService.redirectSpec.view = "measureSummaryView";
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
