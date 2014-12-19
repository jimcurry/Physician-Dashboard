var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("domainComparativeViewController", function($scope, $sce, $http, $stateParams, ngDialog, userService, reportingPeriodService, networkHierarchyService, programService, reportInfoService, cacheService) {

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
	
	// This page doesn't support practitioner level if move up a level if that is where we are.
	if (networkHierarchyService.network.selectedHierarchyNode.data.type == "PRACTITIONER") {
		networkHierarchyService.setSelectedNode(networkHierarchyService.network.selectedHierarchyNode.parentHierarchyId);
		$scope.switchToDefaultDomainComparativeView();
		return;
	}

	
	//bind data that view uses
	$scope.user = userService.user;
	$scope.network = networkHierarchyService.network;
	$scope.reportingPeriod = reportingPeriodService.reportingPeriod;
	$scope.program = programService.programData;
	
	$scope.showLegend = false;
	
	//Handles when the reporting period is changed
	$scope.selectReportingPeriod = function(selectedValue) {
		 reportingPeriodService.setSelectedItemByUseValue(selectedValue);
		 $scope.switchToDefaultDomainComparativeView();
	};

	//Set up the view switcher
	$scope.viewList = [
							"Domain Summary",
							"Measure Comparative",
							"Measure Summary"
							];
	$scope.selectedView = "Domain Comparative";

 	$scope.selectView = function(view) {
		if (view == "Domain Summary") {
			$scope.switchToDefaultDomainSummaryView();
		}
		else if (view == "Measure Comparative") {
			$scope.switchToDefaultMeasureComparativeView();
		}
		else if (view == "Measure Summary") {
			$scope.switchToDefaultMeasureSummaryView();
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
			if ($scope.network.tempSelectedHierarchyNode != null) {
				$scope.network.tempSelectedHierarchyNode.selected = false;
			}
		});
	};

	// handles level change made via breadcrumb
	$scope.$on('BREADCRUMB_ENTITY_SELECTION', function () {
		$scope.switchToDefaultDomainComparativeView();
	});
	
	// handles level change made clicking on the row in the detail report
	levelClicked = function(levelId) {
		
		//see if we are running a patient report
		var targetLevel = networkHierarchyService.getChildsLevel(networkHierarchyService.network.selectedHierarchyNode.hierarchyId);
		if (targetLevel == "PRACTITIONER") {
			var practitionerName;
			var a = document.getElementsByTagName('a');
			for (var i= 0; i < a.length; ++i) {
				if (a[i].onclick != null && a[i].onclick.toString().indexOf("levelClicked('" + levelId + "')") >= 0) {
					var theSpan = a[i].getElementsByTagName('span');
					practitionerName = theSpan[0].innerHTML;
					break;
				}
			}
			networkHierarchyService.addPractitioner(levelId, practitionerName, networkHierarchyService.network.selectedHierarchyNode.hierarchyId);
			$scope.switchToDefaultDomainComparativeView();
		}
		else {
			var newSelectedNode = networkHierarchyService.findChildNodeById(levelId);
			networkHierarchyService.setSelectedNode(newSelectedNode.hierarchyId);
			$scope.switchToDefaultDomainComparativeView();
		}
	};
	

	// handles sort change to detail report made by clicking on the column in the detail report
	sortColumnClicked = function(domainId) {
		programService.programData.selectedProgram.domainIdToSortBy = domainId;
		$scope.$apply(function() {
			$scope.loadContentPane();
		});
	};

	// handles level change made clicking on the row in the detail report
	domainClicked = function(domainId) {
		programService.selectDomain(domainId);
		$scope.switchToDefaultMeasureComparativeView();
	};

	// Make RESTful call to run summary report.
	$scope.loadSummaryPane = function(){
		var parmString =	"&p_pLevelType=" + $scope.network.selectedHierarchyNode.data.type + 
								"&p_pLevelId=" + $scope.network.selectedHierarchyNode.data.id + 
								"&p_pReportingPeriod=" + $scope.reportingPeriod.selectedItem.useValue +
								"&p_pProgramId="+ programService.programData.selectedProgram.programId;

		var cacheData = cacheService.get("DomainComparativeSummary" + parmString);
		if (cacheData != null) {
			$scope.summaryPaneContent = cacheData.data;
			return;
		}

		$scope.summaryPaneContent = '<div style="height : 75px"><table style="width: 100%; height:100%; margin:0; padding:0; border:0;"><tr><td style="vertical-algin: middle; text-align:center;"><img style="width:75px;height:75px" src="./images/loading.gif"/></td></tr></div>';

		var url = reportInfoService.getHtmlFragmentReportString("DomainComparativeSummary") + parmString;

		var request = $http.get(url);
		request.then(function(report_response){
			cacheService.push("DomainComparativeSummary" + parmString, report_response.data);

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
		//figure out target level for report
		var targetLevel = networkHierarchyService.getChildsLevel(networkHierarchyService.network.selectedHierarchyNode.hierarchyId);
		if (targetLevel == "PRACTITIONER") {
				targetLevel = "99";
		}
		
		var drillDownInd = "Y";
		if (targetLevel == "99") {
			drillDownInd = "N";
		}
		
		if(!programService.programData.selectedProgram.domainIdToSortBy) {
			programService.programData.selectedProgram.domainIdToSortBy = -1;
		}
		var parmString =	"&p_p_level=" + $scope.network.selectedHierarchyNode.data.type + 
								"&p_p_level_id=" + $scope.network.selectedHierarchyNode.data.id + 
								"&p_p_selected_date=" + $scope.reportingPeriod.selectedItem.useValue +
								"&p_p_target_level=" + targetLevel +
								"&p_p_sort=" + programService.programData.selectedProgram.domainIdToSortBy +
								"&p_program_id=" + programService.programData.selectedProgram.programId +
								"&p_p_drill_down=" + drillDownInd;

		var cacheData = cacheService.get("DomainComparativeDetail" + parmString);
		if (cacheData != null) {
			$scope.contentPaneContent = cacheData.data;
			$scope.showLegend = true;
			return;
		}

		$scope.contentPaneContent = '<div style="height : 200px"><table style="width: 100%; height:100%; margin:0; padding:0; border:0;"><tr><td style="vertical-algin: middle; text-align:center;"><img style="width:75px;height:75px" src="./images/loading.gif"/></td></tr></div>';
		$scope.showLegend = false;
		
		var url = reportInfoService.getHtmlFragmentReportString("DomainComparativeDetail") + parmString;

		var request = $http.get(url);
		request.then(function(report_response){
			cacheService.push("DomainComparativeDetail" + parmString, report_response.data);

			$scope.contentPaneContent = report_response.data;
			$scope.showLegend = true;
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
				$scope.contentPaneContent = 'Error encountered, status message returned was "' + report_response.statusText + '"';
			}
		});
	};

	$scope.loadContentPane();
	$scope.loadSummaryPane();

});
