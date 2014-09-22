var dashboardApp = angular.module("dashboardApp", ['ngDialog']);

dashboardApp.constant("CognosMashupURL", "https://c3duhcogapp1.premierinc.com:9444/ServletGateway/servlet/Gateway/rds");
dashboardApp.constant("CognosNamespace", "Tivoli_LDAP");

dashboardApp.config(function($httpProvider){
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.withCredentials = true;
});