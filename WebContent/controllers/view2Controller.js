var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("view2Controller", function($scope, $http, $state, $stateParams, $location, userService, CognosMashupURL, CognosNamespace) {

	$scope.user = userService.user;
	
	$scope.parm1 = $stateParams.parm1;
	$scope.parm2 = $stateParams.parm2;
	
	$scope.changeParm1 = function() {
		$state.go('view2', {'parm1' : $scope.parm1, 'parm2' : $scope.parm2});
	};
	
	$scope.changeParm2 = function() {
		$state.go('view2', {'parm1' : $scope.parm1, 'parm2' : $scope.parm2});
	};
//		$scope.$watch('parm1', function(newValue, oldValue) {
//		if (newValue != oldValue) {
//			$state.go('view1', {'parm1' : newValue});
//		}
//	});
	
});