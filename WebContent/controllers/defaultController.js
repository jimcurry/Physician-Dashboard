var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("defaultController", function($scope, $http, $state, $location, CognosMashupURL, CognosNamespace) {

	console.log('got into defaultController');

	$state.go('measureComparativeView', {});
	
});
