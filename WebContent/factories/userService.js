var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("UserService", function($http, $q, CognosMashupURL, CognosNamespace, ngDialog) {

	var user = {
		userName : null,
		userNameToTry : null,
		userFirstName : null,
		userLastName : null,
		password : null,
		loginResult : null
		};

function login() {
	var deferred = $q.defer();
	

	console.log('open dialog');
	
	loginResult = null;
	
	var dialog = ngDialog.open({
		template : './views/login.html',
		controller : 'loginController',
		closeByDocument: false,
		closeByEscape : true
	});

	dialog.closePromise.then(function (data) {
		console.log(user.loginResult );
		if (user.loginResult == 'OK') {
			deferred.resolve('OK');
		}
		else {
			deferred.reject("The provided credentials could not be validated.");
		}
	},function() {
		console.log(user.loginResult );
		deferred.reject("The provided credentials could not be validated.");
	});
	
	return deferred.promise;
 }

	function initialize() {
		console.log('initialize userService');

		getUserInfoFromCognos().then(function(message) {
			console.log('Got user information, first try');

		}, function(message) {
			if (message == 'Unknow failure') {
				console.log('Unknow failure getting user info');
			} else { // Not Logged On
				console.log('Not Logged On');

				login().then(function(message) {
					if (message == 'OK') {
						console.log('Login worked, try and get user info again.');
						getUserInfoFromCognos().then(function(message) {
							console.log('Second try in getting user info woked, we are done.');
						}, function(message) {
							console.log('Second try in getting user info failed, we are done.');
						});

					} else {
						console.log('Login errored, but in a nice way, we are done.');
					}
				}, function(message) {
					console.log('Login errored, we are done.');
				});
			}
		});
}

function getUserInfoFromCognos() {
	var deferred = $q.defer();

	var reportSpec = "/reportData/report/i8AC7568C588D4D2A9F0905B76AD5C076";
	var formatParm = "fmt=DataSet";
	var asyncParm = "async=off";

	var url = CognosMashupURL + reportSpec + '?'+ formatParm + "&" + asyncParm;

	$http.get(url).success(function(data) {
		var x2js = new X2JS();
		var jsonObj = x2js.xml_str2json(data);
		
		user.userName = jsonObj.dataSet.dataTable.row.userName;
		user.userFirstName = jsonObj.dataSet.dataTable.row.givenName;
		user.useLastName = jsonObj.dataSet.dataTable.row.surname;
		
		var result = 'User Info Populated';

		deferred.resolve(result);
	}).error(function(data, status) {
		if (status == 403) {
			deferred.reject("Not Logged On");
		}
		else {
			deferred.reject("Unknow failure");
		}
	});
	
	return deferred.promise;
}

 
function logoff() {
	var deferred = $q.defer();

	var method = "/auth/logoff";
	var url = CognosMashupURL + method;

	$http.get(url).success(function(data) {
		var result = null;
		if (data.indexOf('<noerror') >= 0) {
			user.displayName = null;
			user.userName = null;
			user.userNameToTry = null;
			user.password = null;
			result = "OK";
		}
		else {
			result = "Logoff failed.";
		}
		deferred.resolve(result);
	}).error(function(data, status) {
		deferred.reject("Logoff failed.");
	});
	
	return deferred.promise;
}

return {
	user : user,
	login : login,
	initialize : initialize,
	getUserInfoFromCognos : getUserInfoFromCognos,
	logoff : logoff
}; 

});