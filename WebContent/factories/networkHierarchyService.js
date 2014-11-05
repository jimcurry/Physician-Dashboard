var dashboardApp = angular.module("dashboardApp");

dashboardApp.factory("networkHierarchyService", function($http, $q, DropwizardURL, userService, progressBarService) {
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
//			practitioners: [1]
//			0:	{
//				hierarchyId: 2
//				parentHierarchyId: 0
//				name: "Practitioner guy 1"
//				data: {
//					id: "158000"
//					type: "PRACTITIONER"
//				}

	var network = {
		hierarchy : null,
		selectedHierarchyNode : null,
		selectedPath : null,
		tempSelectedHierarchyNode : null,
		nextPractitionerId : -1
	};

	function initialize() {
		//console.log('Initialize NetworkHierarchyService');
		var deferred = $q.defer();
		if (network.hierarchy) {
			//console.log('NetworkHierarchyService Already Initialized');
			progressBarService.progressBarData.value++;
			deferred.resolve(network.hierarchy);
		}
		else {
			$http.get(DropwizardURL + "/organization/hierarchy?userName=" + userService.user.userName).success(function(data) {
				progressBarService.progressBarData.value++;
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
			else {
				if (network.hierarchy[i].children.length > 0) {
					var node = searchChildren(hierarchyId, network.hierarchy[i].children);
					if (node != null) {
						return node;
					}
				}
				if (network.hierarchy[i].practitioners && network.hierarchy[i].practitioners.length > 0) {
					var node = searchPractitioners(hierarchyId, network.hierarchy[i].practitioners);
					if (node != null) {
						return node;
					}
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
			else {
				if (childrenToSearch[j].practitioners && childrenToSearch[j].practitioners.length > 0) {
					var node = searchPractitioners(hierarchyIdToFind, childrenToSearch[j].practitioners);
					if (node != null) {
						return node;
					}
				}
			}

			if (childrenToSearch[j].hierarchyId == hierarchyIdToFind) {
				return childrenToSearch[j];
			}
		}
		return null;
	}
	
	function searchPractitioners(hierarchyIdToFind, practitionersToSearch) {
		for (var j = 0; j < practitionersToSearch.length; j++) {
			if (practitionersToSearch[j].hierarchyId == hierarchyIdToFind) {
				return practitionersToSearch[j];
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
		
		if (network.selectedHierarchyNode.practitioners) {
			for (var i = 0; i < network.selectedHierarchyNode.practitioners.length; i++) {
				if (network.selectedHierarchyNode.practitioners[i].data.id == id) {
					hierarchyIdToReturn = network.selectedHierarchyNode.practitioners[i];
					break;
				}
			}
		}
		return hierarchyIdToReturn;
	}
	
	// Return the level of the nodes under the one passed in.  If there
	// isn't one 
	function getChildsLevel(id) {
		if (network.selectedHierarchyNode.children && network.selectedHierarchyNode.children.length == 0) {
			return "PRACTITIONER";
		}
		else if (network.selectedHierarchyNode.data.type == "PRACTITIONER") {
			return "PATIENT";
		}
		else {
			return network.selectedHierarchyNode.children[0].data.type;
		}
	}
	
	function addPractitioner(id, practitionerName, parentId) {
		//find the parent, good chance that is is the current selected one so try that first
		
		var parentNode;
		var practitionerNode;
		
		if (network.selectedHierarchyNode.hierarchyId == parentId) {
			parentNode = network.selectedHierarchyNode;
		}
		else {
			parentNode = findNode(parentId);
		}
		
		var addNew = true;
		
		if (parentNode.practitioners) {
			//see if the practitioner is already in the object
			for (var i = 0; i < parentNode.practitioners.length; i++) {
				if (parentNode.practitioners[i].data.id == id) {
					practitionerNode = parentNode.practitioners[i];
					addNew = false;
					break;
				}
			}
		}
		
		if (addNew) {
			var newId = network.nextPractitionerId--;
			

			practitionerNode = {
				hierarchyId : newId,
				parentHierarchyId : parentId,
				name : practitionerName,
				data : {
					id : id,
					type : "PRACTITIONER"
				}
			};
			
			if (parentNode.practitioners == undefined) {
				parentNode.practitioners = [practitionerNode];
			}
			else {
				parentNode.practitioners.push(practitionerNode);
			}
		}
		setSelectedNode(practitionerNode.hierarchyId);
	}
	
	return {
		network : network,
		setSelectedNode : setSelectedNode,
		findNode : findNode,
		findChildNodeById : findChildNodeById,
		getChildsLevel : getChildsLevel,
		addPractitioner : addPractitioner,
		initialize : initialize
	};

});
