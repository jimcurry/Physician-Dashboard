var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("view1Controller", function($scope, $http, $state, $stateParams, $location, UserService, CognosMashupURL, CognosNamespace) {

	$scope.user = UserService.user;
	
	$scope.parm1 = $stateParams.parm1;
	
	$scope.changeParm1 = function() {
		$state.go('view1', {'parm1' : $scope.parm1});
	};
	
//		$scope.$watch('parm1', function(newValue, oldValue) {
//		if (newValue != oldValue) {
//			$state.go('view1', {'parm1' : newValue});
//		}
//	});
	
});
