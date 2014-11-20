var dashboardApp = angular.module("dashboardApp", ['ngDialog', 'ui.router', 'ui.bootstrap', 'angularBootstrapNavTree']);

dashboardApp.constant("CognosMashupURL", "https://c3duhcogapp1.premierinc.com:9444/ServletGateway/servlet/Gateway/rds");
dashboardApp.constant("CognosNamespace", "Tivoli_LDAP");
//dashboardApp.constant("DropwizardURL", "http://c3dupceapr1.premierinc.com:9010");
dashboardApp.constant("DropwizardURL", "http://localhost:9010");


dashboardApp.config(function($httpProvider){
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.withCredentials = true;
});

dashboardApp.config(function($stateProvider, $urlRouterProvider) {
	//
	// For any unmatched url, redirect to /default
	$urlRouterProvider.otherwise("/default");
	//
	// Now set up the states
	$stateProvider.state('snippets', {
		url : "/snippets/:reportingPeriod",
		templateUrl : "./views/snippets.html",
		controller : "snippetsController"
	}).state('measureComparativeView', {
		url : "/measureComparativeView/:hierarchyId/:reportingPeriod/:domainId",
		templateUrl : "./views/measureComparativeView.html",
		controller : "measureComparativeViewController"
	}).state('domainComparativeView', {
		url : "/domainComparativeView/:hierarchyId/:reportingPeriod",
		templateUrl : "./views/domainComparativeView.html",
		controller : "domainComparativeViewController"
	}).state('domainSummaryView', {
		url : "/domainSummaryView/:hierarchyId/:reportingPeriod",
		templateUrl : "./views/domainSummaryView.html",
		controller : "domainSummaryViewController"
	}).state('measureDetailView', {
		url : "/measureDetailView/:hierarchyId/:reportingPeriod/:measureGroupCode/:measureCode",
		templateUrl : "./views/measureDetailView.html",
		controller : "measureDetailViewController"
	}).state('cache', {
		url : "/cache",
		controller : "cacheController"
	}).state('default', {
		url : "/default",
		templateUrl : "./views/default.html",
		resolve : {
			userServiceInitialize : function(userService) {
				return userService.initialize();
			},
			reportingPeriodServiceInitialize : function(reportingPeriodService) {
				return reportingPeriodService.initialize();
			},
			networkHierarchyServiceInitialize : function(userServiceInitialize, networkHierarchyService) {
				return networkHierarchyService.initialize();
			},
			programServiceInitialize : function(userServiceInitialize, programService) {
				return programService.initialize();
			},
			reportInfoServiceInitialize : function(userServiceInitialize, reportInfoService) {
				return reportInfoService.initialize();
			},
			selectInitialProgram : function(programService, networkHierarchyServiceInitialize, programServiceInitialize, networkHierarchyService) {
				programService.selectProgram(networkHierarchyService.network.selectedHierarchyNode.programId);
			}
		},
		controller : "defaultController"
	});
});
