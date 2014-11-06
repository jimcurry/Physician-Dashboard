var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("measureDetailViewController", function($scope, $sce, $http, $stateParams, ngDialog, userService, reportingPeriodService, networkHierarchyService, programService, reportInfoService, measureService, cacheService) {

	// Make sure services are initialized 
	if (!userService.user.isInitialized) {
		userService.redirectSpec.view = "measureDetailView";
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
	
	var measureTypeParm = $stateParams.measureType;
	if (measureService.measureData.selectedType !== measureTypeParm) {
		measureService.measureData.selectedType = measureTypeParm;
	}

	var measureCodeParm = $stateParams.measureCode;
	if (measureService.measureData.selectedCode !== measureCodeParm) {
		measureService.measureData.selectedCode = measureCodeParm;
	}
	
	// If url had bad values repaint the view so it will pick up the new values.
	if (invalidUrlParm) {
		$scope.switchToDefaultMeasureDetailView();
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
		 $scope.switchToDefaultMeasureDetailView();
	};

	//Set up the view switcher
	$scope.viewList = [
							"Measure Comparative View",
							"Domain Summary"
							];
	$scope.selectedView = "Measure Detail View";

 	$scope.selectView = function(view) {
		if (view == "Measure Comparative View") {
			$scope.switchToDefaultMeasureComparativeView();
		}
		else if (view == "Domain Summary") {
			$scope.switchToDefaultDomainComparativeView();
		}
	};
	
    // Population of Benchmark list (may become table driven eventually)
	$scope.benchmarkList = [
                            {name:"None", id: "0.00"},
                            {name:"CMS 90th Percentile", id: "90.00"},
                            {name:"CMS 30th Percentile", id: "30.00"}
                         ];
    $scope.selectedBenchmark = $scope.benchmarkList[0];	
    
    $scope.selectBenchmark = function(benchmark) {
    	$scope.selectedBenchmark = benchmark;
    	$scope.loadSummaryPane();
    };
    

	var targetLevel = networkHierarchyService.getChildsLevel(networkHierarchyService.network.selectedHierarchyNode.hierarchyId);
	var targetLevelNumber = targetLevel;
	if (targetLevel == "PRACTITIONER") {
			//Report needs an integer so change to "99"
		    targetLevelNumber = "99";
	}
    
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
			
			$scope.switchToDefaultMeasureDetailView();
		}, function() {
			if ($scope.network.tempSelectedHierarchyNode.selected) {
				$scope.network.tempSelectedHierarchyNode.selected = false;
			}
		});
	};

	// handles level change made via breadcrumb
	$scope.$on('BREADCRUMB_ENTITY_SELECTION', function () {
		$scope.switchToDefaultMeasureDetailView();
	});
	
	// handles level change made clicking on the row in the detail report
	levelClicked = function(levelId) {
		//see if we are running a patient report
		targetLevel = networkHierarchyService.getChildsLevel(networkHierarchyService.network.selectedHierarchyNode.hierarchyId);
		targetLevelNumber = targetLevel;
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
			$scope.switchToDefaultMeasureDetailView();
		}
		else {
			var newSelectedNode = networkHierarchyService.findChildNodeById(levelId);
			networkHierarchyService.setSelectedNode(newSelectedNode.hierarchyId);
			$scope.switchToDefaultMeasureDetailView();
		}
	};
	
	// Make RESTful call to run summary report.
	$scope.loadSummaryPane = function(){
		var targetLevel = $scope.network.selectedHierarchyNode.data.type;
		if (targetLevel == "PRACTITIONER") {
				targetLevel = "99";
		}

		var parmString =	"&p_p_level=" + targetLevel + 
								"&p_p_level_id=" + $scope.network.selectedHierarchyNode.data.id + 
								"&p_p_selected_date=" + $scope.reportingPeriod.selectedItem.useValue +
								"&p_p_target_level="+ targetLevel + 
								"&p_p_measure_grp_cd=" + measureService.measureData.selectedType +
								"&p_p_measure_code=" + measureService.measureData.selectedCode +
								"&p_p_benchmark=" + $scope.selectedBenchmark.id;

		var cacheData = cacheService.get("MeasureDetailSummary" + parmString);
		if (cacheData != null) {
			$scope.summaryPaneContent = cacheData.data;
			return;
		}

		$scope.summaryPaneContent = '<div style="height : 210px;"><table style="width: 100%; height:100%; margin:0; padding:0; border:0;"><tr><td style="vertical-algin: middle; text-align:center;"><img style="width:32px;height:32px" src="./images/loading.gif"/></td></tr></div>';

		var url = reportInfoService.getHtmlFragmentReportString("MeasureDetailSummary") + parmString;

		var request = $http.get(url);
		request.then(function(report_response){
			cacheService.push("MeasureDetailSummary" + parmString, report_response.data);

			$scope.summaryPaneContent = report_response.data;
		}, function(report_response){
			if (report_response.status == "403") {
				// use write/read/write lock to make sure only one redirect is done.
				if (userService.redirectSpec.view == null) {
					userService.redirectSpec.view = "Summary";
					if (userService.redirectSpec.view == "Summary") {
						userService.user.isInitialized = false;
						userService.redirectSpec.view = "measureDetailView";
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
		
		var targetLevel = networkHierarchyService.getChildsLevel(networkHierarchyService.network.selectedHierarchyNode.hierarchyId);
		if (targetLevel == "PRACTITIONER") {
				targetLevel = "99";
		}
		
		var drillDownInd = "Y";
		if (targetLevel == "99") {
			drillDownInd = "Y";
		}
		var parmString;
		var reportName;
		
		if (targetLevel == "PATIENT") {
			reportName = "MeasureDetailPractitionerDetail";
			parmString =	"&p_pPractitionerId=" + $scope.network.selectedHierarchyNode.data.id + 
								"&&p_pMonth=" + $scope.reportingPeriod.selectedItem.useValue +
								"&p_pMeasureCode=" + measureService.measureData.selectedCode +
								"&p_pMeasureType=" + measureService.measureData.selectedType +
								"&p_pSort=Met" +
								"&p_pFilter=All";
		}
		else {
			reportName = "MeasureDetailLevelBasedDetail";
			parmString =	"&p_p_level=" + $scope.network.selectedHierarchyNode.data.type + 
								"&p_p_level_id=" + $scope.network.selectedHierarchyNode.data.id + 
								"&p_p_selected_date=" + $scope.reportingPeriod.selectedItem.useValue +
								"&p_p_target_level=" + targetLevelNumber +
								"&p_p_measure_grp_cd=" + measureService.measureData.selectedType +
								"&p_p_measure_code=" + measureService.measureData.selectedCode +
								"&p_p_drill_down=" + drillDownInd +
								"&p_p_sort=-1";
		}

		var cacheData = cacheService.get(reportName + parmString);
		if (cacheData != null) {
			$scope.contentPaneContent = cacheData.data;
			return;
		}

		$scope.contentPaneContent = '<div style="height : 200px"><table style="width: 100%; height:100%; margin:0; padding:0; border:0;"><tr><td style="vertical-algin: middle; text-align:center;"><img style="width:32px;height:32px" src="./images/loading.gif"/></td></tr></div>';

		var url = reportInfoService.getHtmlFragmentReportString(reportName) + parmString;

		var request = $http.get(url);
		request.then(function(report_response){
			cacheService.push(reportName + parmString, report_response.data);
			
			$scope.contentPaneContent = report_response.data;
		}, function(report_response){
			if (report_response.status == "403") {
				// use write/read/write lock to make sure only one redirect is done.
				if (userService.redirectSpec.view == null) {
					userService.redirectSpec.view = "Detail";
					if (userService.redirectSpec.view == "Detail") {
						userService.user.isInitialized = false;
						userService.redirectSpec.view = "measureDetailView";
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

	$scope.loadSummaryPane();
	$scope.loadContentPane();
});
