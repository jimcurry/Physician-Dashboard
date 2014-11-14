var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("measureService", function($http, $q, userService, DropwizardURL) {
//format of "data"
//		measureCode: "ACO10"
//		measureGroupCode: "ACO"
//		measureTypeCode: "Ratio"
//		reverseScoreInd: "Y"
//		ranges: [7]
//			0:	{
//					rangeStartMeasureValue: 1.22
//					rangePercentileName: "30th Percentile"
//				}
	var measureData = {
		data : null,
		selectedRange : null,
		fromDbInd : "N"
	};
	
	function getMeasure(measureCode, measureGroupCode) {
		var deferred = $q.defer();
		if (measureData.data
				&& measureData.fromDbInd == "Y"
				&& measureCode == measureData.data.measureCode 
				&& measureGroupCode == measureData.data.measureGroupCode) {
			deferred.resolve('Already Initialized');
		}
		else {
			var parmString = 	"userName=" + userService.user.userName + 
				"&measureCode=" + measureCode + 
				"&measureGroupCode=" + measureGroupCode;
			
			measureData.fromDbInd = "Y";
			
			$http.get(DropwizardURL + "/measure?" + parmString).success(function(data) {
				measureData.data = data;
				setDefaultSelectedMeasureRange();

				deferred.resolve('success');
			}).error(function(data, status) {
				measureData.data.measureCode = "INVALID";
				measureData.data.measureGroupCode = "INVALID";
				deferred.reject('failed -' + status);
			});
		}

		return deferred.promise;
	}

	function setDefaultSelectedMeasureRange() {
		//If something is already selected try and select the same thing.
		if (measureData.selectedRange) {
			var selectedRangePercentileName = measureData.selectedRange.rangePercentileName;
			
			measureData.selectedRange = measureData.data.ranges[0];
			for (var i = 0; i < measureData.data.ranges.length; i++) {
				if (measureData.data.ranges[i].rangePercentileName == selectedRangePercentileName) {
					measureData.selectedRange = measureData.data.ranges[i];
					break;
				} 
			}
		}
		else {
			measureData.selectedRange = measureData.data.ranges[0];
		}
	}
	
	return {
		measureData : measureData,
		getMeasure : getMeasure	
	};
});
