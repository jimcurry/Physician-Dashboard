var dashboardApp = angular.module("dashboardApp", ['ngDialog', 'ui.router', 'ui.bootstrap', 'angularBootstrapNavTree', 'ngAnimate']);

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
	$stateProvider.state('view1', {
		url : "/view1/:parm1",
		templateUrl : "./views/view1.html",
		controller : "view1Controller"
	}).state('view2', {
		url : "/view2/:parm1/:parm2",
		templateUrl : "./views/view2.html",
		controller : "view2Controller"
	}).state('snippets', {
		url : "/snippets/:reportingPeriod",
		templateUrl : "./views/snippets.html",
		controller : "snippetsController"
	}).state('measureComparativeView', {
		url : "/measureComparativeView",
		templateUrl : "./views/measureComparativeView.html",
		controller : "measureComparativeViewController"
	}).state('default', {
		url : "/default",
		templateUrl : "./views/default.html",
		resolve : {
			userService : function(userService) {
				return userService.initialize();
			},
			reportingPeriodService : function(reportingPeriodService) {
				return reportingPeriodService.initialize();
			},
			networkHierarchyService : function(userService, networkHierarchyService) {
				return networkHierarchyService.initialize();
			}
		},
		controller : "defaultController"
	});
});