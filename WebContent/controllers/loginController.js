var dashboardApp = angular.module("dashboardApp");

dashboardApp.controller("loginController", function($scope, $http, userService, CognosMashupURL, CognosNamespace) {

	$scope.user = userService.user;
	
	var errors = [];
	
	userService.user.loginResult = "User Cancelled";
	
	$scope.OK = function() {
		errors = [];
		
		if (!userService.user.userNameToTry) {
			errors.push('User ID is missing.');
		}
		
		if (!userService.user.password) {
			errors.push('Password is missing.');
		}
		$scope.errors = errors;

		var method = "/auth/logon";
		var parameter = "?xmlData=<credentials><credentialElements><name>CAMNamespace</name>"
			+ "<label>Namespace:</label><value><actualValue>" + CognosNamespace
			+ "</actualValue></value></credentialElements>"
			+ "<credentialElements><name>CAMUsername</name>"
			+ "<label>User ID:</label><value><actualValue>" + userService.user.userNameToTry
			+ "</actualValue></value></credentialElements>"
			+ "<credentialElements><name>CAMPassword</name>"
			+ "<label>Password:</label><value><actualValue>" + userService.user.password
			+ "</actualValue></value></credentialElements></credentials>";
		
		var url = CognosMashupURL + method + parameter;
		
		$http.get(url).success(function(data) {
			var x2js = new X2JS();
			var jsonObj = x2js.xml_str2json(data);

			if (jsonObj.accountInfo) {
				result = "OK";
				userService.user.userNameToTry = null;
				userService.user.password = null;
				userService.user.loginResult = "OK";
				$scope.$parent.closeThisDialog();
			}
			else {
				if (errors.length == 0) {
					errors.push('Credentials are invalid.');
				}
			}

		}).error(function(data, status) {
			$scope.$parent.closeThisDialog();
		});
		
		$scope.errors = errors;
	};
	
	$scope.cancel = function() {
		$scope.$parent.closeThisDialog();
	};
});
