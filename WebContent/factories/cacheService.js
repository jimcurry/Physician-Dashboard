var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("cacheService", function() {

//	format of reportData
//	[2]
//	0:	{
//		parmString: "MeasureComparativeDetail"
//		data: "i4132A77180884F17B401B9D45D816FE9"
//		}

	var cacheData = {
		cache : [ {
			parmString : null,
			data : null
		} ],
		isEnabled : true
	};
	
	function push(parmString, data) {
		if (cacheData.isEnabled) {
			var maxIndex = cacheData.cache.length;
			if (maxIndex > 15) {
				maxIndex = 15;
			}

			if (get(parmString) == null) {
				for (var i = maxIndex; i > 0; i--) {
					cacheData.cache[i] = {
						parmString : cacheData.cache[i - 1].parmString,
						data : cacheData.cache[i - 1].data
					};
				}

				cacheData.cache[0].parmString = parmString;
				cacheData.cache[0].data = data;
			}
		}
	}

	function get(parmString) {
		if (cacheData.isEnabled) {
			for (var i = 0; i < cacheData.cache.length; i++) {
				if (cacheData.cache[i].parmString == parmString) {
					//bubble the match up to the top of the cache
					var temp = {
							parmString : cacheData.cache[i].parmString,
							data : cacheData.cache[i].data
						};
					for (var j = i; j > 0; j--) {						
						cacheData.cache[j] = {
								parmString : cacheData.cache[j - 1].parmString,
								data : cacheData.cache[j - 1].data
							};
					}
					cacheData.cache[0] = temp;
					return cacheData.cache[0];
				}
			}
		}
		return null;
	}

	function enable(bool) {
		cacheData.isEnabled = bool;
		if (!cacheData.isEnabled) {
			cacheData.cache = [{
				parmString : null,
				data : null
			}];
		}
		if (cacheData.isEnabled) {
			alert("Cache is on");
		}
		else {
			alert("Cache is off");
		}
	}
	
	
	return {
		push : push,
		get : get,
		enable : enable,
		cacheData : cacheData
	};
});
