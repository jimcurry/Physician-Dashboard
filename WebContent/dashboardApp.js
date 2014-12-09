var dashboardApp = angular.module("dashboardApp", ['ngDialog', 'ui.router', 'ui.bootstrap', 'angularBootstrapNavTree']);

dashboardApp.constant("CognosMashupURL", "https://c3duhcogapp1.premierinc.com:9444/ServletGateway/servlet/Gateway/rds");
dashboardApp.constant("CognosNamespace", "Tivoli_LDAP");
dashboardApp.constant("DropwizardURL", "http://c3dupceapr1.premierinc.com:9010");
//dashboardApp.constant("DropwizardURL", "http://localhost:9010");


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
	$stateProvider.state('measureComparativeView', {
		url : "/measureComparativeView/:hierarchyId/:reportingPeriod/:domainId",
		templateUrl : "./views/measureComparativeView.html",
		controller : "measureComparativeViewController"
	}).state('measureSummaryView', {
		url : "/measureSummaryView/:hierarchyId/:reportingPeriod/:domainId",
		templateUrl : "./views/measureSummaryView.html",
		controller : "measureSummaryViewController"
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

dashboardApp.directive('resizebottomdiv', function($window, $timeout) {
	return {
		link : function(scope, elem, attrs) {
			scope.onResize = function() {
				var offsets = document.getElementById(elem.attr("id")).getBoundingClientRect();
				var divTop = offsets.top;

				//var winHeight = $window.innerHeight;
				var winHeight = document.documentElement.clientHeight;
				var divOffset = attrs.resizebottomdiv ? attrs.resizebottomdiv : 0;

				divOffset = parseInt(divOffset);

				var divHeight = winHeight - divTop - divOffset;
				if (divHeight < 200) {
					divHeight = 200;
				}

				elem.css('height', divHeight + 'px');
			};
			scope.onResize();

			var w = angular.element($window).bind('resize', function() {
				scope.onResize();
			});
			

			$timeout(function() {
				w.triggerHandler('resize');
			});
		}
	};
});