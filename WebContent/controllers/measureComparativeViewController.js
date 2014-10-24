var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("measureComparativeViewController", function($scope, $sce, $http, $stateParams, ngDialog, userService, reportingPeriodService, networkHierarchyService, programService, reportInfoService, cacheService) {

	// Make sure services are initialized 
	if (!userService.user.isInitialized) {
		userService.redirectSpec.view = "measureComparativeView";
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
	
	// If url had bad values repaint the view so it will pick up the new values.
	if (invalidUrlParm) {
		$scope.switchToDefaultMeasureComparativeView();
		return;
	}
	
	//bind data that view uses
	$scope.user = userService.user;
	$scope.network = networkHierarchyService.network;
	$scope.reportingPeriod = reportingPeriodService.reportingPeriod;
	$scope.domainData = programService.programData.selectedProgramDomains;
	$scope.program = programService.programData;
	
	//Handles when the reporting period is changed
	$scope.selectReportingPeriod = function(selectedValue) {
		 reportingPeriodService.setSelectedItemByUseValue(selectedValue);
		 $scope.switchToDefaultMeasureComparativeView();
	};

	//Set up the view switcher
	$scope.viewList = [
							"Domain Comparative View"
							];
	$scope.selectedView = "Measure Comparative View";

 	$scope.selectView = function(view) {
		if (view == "Domain Comparative View") {
			$scope.switchToDefaultDomainComparativeView();
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
		$scope.switchToDefaultMeasureComparativeView();
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
			
			$scope.switchToDefaultMeasureComparativeView();
		}, function() {
			$scope.network.tempSelectedHierarchyNode.selected = false;
		});
	};

	// handles level change made via breadcrumb
	$scope.$on('BREADCRUMB_ENTITY_SELECTION', function () {
		$scope.switchToDefaultMeasureComparativeView();
	});

	// handles level change made clicking on the row in the detail report
	levelClicked = function(levelId) {
		//see if we are running a patient report
		var targetLevel = networkHierarchyService.getChildsLevel(networkHierarchyService.network.selectedHierarchyNode.hierarchyId);
		if (targetLevel == "PRACTITIONER") {
				//stuff to run patient level
				alert('patient level ' + levelId);
		}
		else {
			var newSelectedNode = networkHierarchyService.findChildNodeById(levelId);
			networkHierarchyService.setSelectedNode(newSelectedNode.hierarchyId);
			$scope.switchToDefaultMeasureComparativeView();
		}
	};

	// handles level change made clicking on the column in the detail report
	measureClicked = function(measureType, measureCode) {
		alert("measure code '" + measureCode + "' measure type '" + measureType + "'");
	};

	
	// Make RESTful call to run summary report.
	$scope.loadSummaryPane = function(){
		var parmString = 	"&p_pLevelType=" + $scope.network.selectedHierarchyNode.data.type + 
								"&p_pLevelId=" + $scope.network.selectedHierarchyNode.data.id + 
								"&p_pReportingPeriod=" + $scope.reportingPeriod.selectedItem.useValue + 
								"&p_pDomainId=" + programService.programData.selectedDomain.id;
		
		var cacheData = cacheService.get("MeasureComparativeSummary" + parmString);
		if (cacheData != null) {
			$scope.summaryPaneContent = cacheData.data;
			return;
		}

		$scope.summaryPaneContent = '<div><table width="100%"><tr><td width="100%" align="center"><img style="width:32px;height:32px" src="./images/loading.gif"/></td></tr></div>';

		var url = reportInfoService.getHtmlFragmentReportString("MeasureComparativeSummary") + parmString;

		var request = $http.get(url);
		request.then(function(report_response){
			cacheService.push("MeasureComparativeSummary" + parmString, report_response.data);
			
			$scope.summaryPaneContent = report_response.data;
		}, function(report_response){
			if (report_response.status == "403") {
				// use write/read/write lock to make sure only one redirect is done.
				if (userService.redirectSpec.view == null) {
					userService.redirectSpec.view = "Summary";
					if (userService.redirectSpec.view == "Summary") {
						userService.user.isInitialized = false;
						userService.redirectSpec.view = "measureComparativeView";
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
		var targetLevel = networkHierarchyService.getChildsLevel(networkHierarchyService.network.selectedHierarchyNode.hierarchyId);
		if (targetLevel == "PRACTITIONER") {
				targetLevel = "99";
		}
		
		var drillDownInd = "Y";
		if (targetLevel == "99") {
			drillDownInd = "N";
		}
		
		var parmString = 	"&p_p_level=" + $scope.network.selectedHierarchyNode.data.type + 
								"&p_p_level_id=" + $scope.network.selectedHierarchyNode.data.id + 
								"&p_p_selected_date=" + $scope.reportingPeriod.selectedItem.useValue + 
								"&p_p_domain_num=" + programService.programData.selectedDomain.id +
								"&p_p_target_level=" + targetLevel +
								"&p_p_drill_down=" + drillDownInd;		
		var cacheData = cacheService.get("MeasureComparativeDetail" + parmString);
		if (cacheData != null) {
			$scope.contentPaneContent = cacheData.data;
			return;
		}

		$scope.contentPaneContent = '<div><table width="100%"><tr><td width="100%" align="center"><img style="width:32px;height:32px" src="./images/loading.gif"/></td></tr></div>';

		var url = reportInfoService.getHtmlFragmentReportString("MeasureComparativeDetail") + parmString;

		var request = $http.get(url);
		request.then(function(report_response){
			cacheService.push("MeasureComparativeDetail" + parmString, report_response.data);

			$scope.contentPaneContent = report_response.data;
		}, function(report_response){
			if (report_response.status == "403") {
				// use write/read/write lock to make sure only one redirect is done.
				if (userService.redirectSpec.view == null) {
					userService.redirectSpec.view = "Detail";
					if (userService.redirectSpec.view == "Detail") {
						userService.user.isInitialized = false;
						userService.redirectSpec.view = "measureComparativeView";
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
