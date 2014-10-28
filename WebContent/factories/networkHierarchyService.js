var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("networkHierarchyService", function($http, $q, DropwizardURL, userService) {
//format of "hierarchy"
//	[2]
//		0:	{
//			hierarchyId: 0
//			parentHierarchyId: 0
//			programId: 1
//			label: "Medicare Shared Savings Program / Premier Health ACO"
//			name: "Premier Health ACO"
//			data: {
//				id: "150000"
//				parentId: null
//				type: "10"
//			}
//			children: [9]
//				0:	{
//					hierarchyId: 1
//					parentHierarchyId: 0
//					programId: 1
//					label: "Premier Family Medical Associates"
//					name: "Premier Health ACO"
//					data: {
//						id: "158000"
//						parentId: "150000"
//						type: "20"
//					}

	var network = {
		hierarchy : null,
		selectedHierarchyNode : null,
		selectedPath : null,
		tempSelectedHierarchyNode : null
	};

	function initialize() {
		//console.log('Initialize NetworkHierarchyService');
		var deferred = $q.defer();
		if (network.hierarchy) {
			//console.log('NetworkHierarchyService Already Initialized');
			deferred.resolve(network.hierarchy);
		}
		else {
			$http.get(DropwizardURL + "/organization/hierarchy?userName=" + userService.user.userName).success(function(data) {
				network.hierarchy = data;
				network.selectedHierarchyNode = network.hierarchy[0];
				network.selectedPath = [network.hierarchy[0]];
				deferred.resolve(network.hierarchy);
			}).error(function(data, status) {
				deferred.reject(status);
			});
		}
		return deferred.promise;
	}
	
	function setSelectedNode(hierarchyId) {
		if (network.selectedHierarchyNode.selected) {
			network.selectedHierarchyNode.selected = false;
		}
		network.selectedHierarchyNode = findNode(hierarchyId);
		
		if (network.selectedHierarchyNode == null) {
			network.selectedHierarchyNode = network.hierarchy[0];
		}
		
		if (network.selectedHierarchyNode.selected) {
			network.selectedHierarchyNode.selected = true;
		}
		
		setSelectedPath(hierarchyId);
	}
	
	function findNode(hierarchyId) {
		for (var i = 0; i < network.hierarchy.length; i++) {
			if (network.hierarchy[i].hierarchyId == hierarchyId) {
				return network.hierarchy[i];
			}
			else if (network.hierarchy[i].children.length > 0) {
				var node = searchChildren(hierarchyId, network.hierarchy[i].children);
				if (node != null) {
					return node;
				}
			}
		}
		return null;
	}

		
	function searchChildren(hierarchyIdToFind, childrenToSearch) {
		for (var j = 0; j < childrenToSearch.length; j++) {
			if (childrenToSearch[j].children.length > 0) {
				var node = searchChildren(hierarchyIdToFind, childrenToSearch[j].children);

				if (node != null) {
					return node;
				}
			}

			if (childrenToSearch[j].hierarchyId == hierarchyIdToFind) {
				return childrenToSearch[j];
			}
		}
		return null;
	}
	
	function setSelectedPath() {
		var deathByRecursionCount = 0;
		network.selectedPath = [network.selectedHierarchyNode];
		while(network.selectedPath[0].hierarchyId != network.selectedPath[0].parentHierarchyId) {
			network.selectedPath.unshift(findNode(network.selectedPath[0].parentHierarchyId));
			if (deathByRecursionCount++ > 11) {
				break;
			}
		}
	}
	
	// return the the node that is directly under the selected node that 
	// has the passed in id.  If not found return the currently selected node 
	function findChildNodeById(id) {
		var hierarchyIdToReturn = network.selectedHierarchyNode;
		for (var i = 0; i < network.selectedHierarchyNode.children.length; i++) {
			if (network.selectedHierarchyNode.children[i].data.id == id) {
				hierarchyIdToReturn = network.selectedHierarchyNode.children[i];
				break;
			}
		}
		return hierarchyIdToReturn;
	}
	
	// Return the level of the nodes under the one passed in.  If there
	// isn't one 
	function getChildsLevel(id) {
		if (network.selectedHierarchyNode.children.length == 0) {
			return "PRACTITIONER";
		}
		else {
			return network.selectedHierarchyNode.children[0].data.type;
		}
	}
	
	return {
		network : network,
		setSelectedNode : setSelectedNode,
		findNode : findNode,
		findChildNodeById : findChildNodeById,
		getChildsLevel : getChildsLevel,
		initialize : initialize
	};

});
