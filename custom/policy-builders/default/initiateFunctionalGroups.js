const functionalGroupDataObj = require('./functionalGroupData.js').functionalGroupDataObj;
const alwaysAllowedGroupNames = require('./functionalGroupData.js').getAlwaysAllowedGroupNames();

module.exports = {
    createDefaultFunctionalGroups: createDefaultFunctionalGroups,
    generatePermissions: generatePermissions,
    editAppPolicy: editAppPolicy,
    generatePermissionRelations: generatePermissionRelations
};

function createDefaultFunctionalGroups () {
    let functionGroupInfos = [];
    for (let prop in functionalGroupDataObj) {
        functionGroupInfos.push(defineFunctionGroupInfo(prop));
    }
    return functionGroupInfos;
}

function defineFunctionGroupInfo (propertyName) {
    const funcGroupObj = functionalGroupDataObj[propertyName];
    let obj = {
        property_name: propertyName,
        status: "PRODUCTION" //put generated values in production
    };
    if (funcGroupObj.userConsentPrompt !== undefined && funcGroupObj.userConsentPrompt !== null) {
        obj.user_consent_prompt = funcGroupObj.userConsentPrompt;
    }
    obj.is_default = !!funcGroupObj.alwaysAllow; //coerce to boolean. if is_default doesn't exist, then it's coerced to false
    return obj;
}

function editAppPolicy (appIdPolicy, appObj) {
    let allowedGroupSet = {};

    //first, add the always allowed groups
    alwaysAllowedGroupNames.map(function (groupName) {
        allowedGroupSet[groupName] = null;
    });

    //permissions are located in the property 'permissions' in appObj

    //handle vehiclePermissions
    const vehicleGroupsToCheck = ["Location-1", "DrivingCharacteristics-3", "VehicleInfo-3", "Emergency-1"];

    //handle rpc permissions
    const rpcGroupsToCheck = ["ProprietaryData-3", "Navigation-1", "Base-6", "DiagnosticMessageOnly", 
        "SendLocation", "WayPoints", "BackgroundAPT"];


    for (let i = 0; i < appObj.permissions.length; i++) {
        //given a permission name, get the functionalGroup that holds that permission
        //permName is an object with name and type
        const permName = appObj.permissions[i];
        if (permName.type === "RPC") {
            for (let j = 0; j < rpcGroupsToCheck.length; j++) {
                const permissions = functionalGroupDataObj[rpcGroupsToCheck[j]].getPermissionsFunc()[0];
                if (permissions.indexOf(permName.name) !== -1) {
                    allowedGroupSet[rpcGroupsToCheck[j]] = null;
                    //end loop early
                    j = rpcGroupsToCheck.length;
                }            
            }
        }
        else if (permName.type === "PARAMETER") {
            for (let j = 0; j < vehicleGroupsToCheck.length; j++) {
                const permissions = functionalGroupDataObj[vehicleGroupsToCheck[j]].getPermissionsFunc()[1];
                if (permissions.indexOf(permName.name) !== -1) {
                    allowedGroupSet[vehicleGroupsToCheck[j]] = null;
                    //end loop early
                    j = vehicleGroupsToCheck.length;
                }            
            } 
        }
        else if (permName.type = "MODULE") {
            appIdPolicy.moduleType.push(permName.name);
            allowedGroupSet["RemoteControl"] = null; //auto approve RemoteControl if these permissions are allowed
        }
        
    }    

    // Specific check for the notification permission group
    if (appObj.can_background_alert) {
        allowedGroupSet["Notifications"] = null;
    }

    //apply the permissions found
    for (let prop in allowedGroupSet) {
        appIdPolicy.groups.push(prop);
    }    
    return appIdPolicy;
}

function generatePermissionRelations (permissions) {
    //permission relations are defined here. Any permission that depends on another permission existing is defined here
    //For example, vehicle data permissions necessitate having permissions to GetVehicleData, etc.
    const allVehicleRpcs = ["OnVehicleData", "GetVehicleData", "SubscribeVehicleData", "UnsubscribeVehicleData"];
    const getVehicleRpcs = ["GetVehicleData"];
    const allRemoteControlRpcs = ["ButtonPress", "GetInteriorVehicleData", "SetInteriorVehicleData", "OnInteriorVehicleData", "SystemRequest"];

    const permissionRelations = []; 
    for (let i = 0; i < permissions.length; i++) {
        const permission = permissions[i];
        if (permission.type === "PARAMETER") { //all vehicle parameters (at least for now...)
            if (permission.name === "vin") {
                permissionRelations.push({
                    permissionName: permission.name,
                    parents: getVehicleRpcs
                });
            }
            else {
                permissionRelations.push({
                    permissionName: permission.name,
                    parents: allVehicleRpcs
                });
            }
        }
        else if (permission.type === "MODULE") { //all module parameters
            permissionRelations.push({
                permissionName: permission.name,
                parents: allRemoteControlRpcs
            });
        }
    }
    return permissionRelations;
}

//pair up functional group names with their respective permissions
function generatePermissions () {
    let permissions = [];

    for (let functionalGroupName in functionalGroupDataObj) {
        const associatedPerms = functionalGroupDataObj[functionalGroupName].getPermissionsFunc();
        //combine RPC and vehicle parameters
        const combinedPerms = associatedPerms[0].concat(associatedPerms[1]);
        for (let j = 0; j < combinedPerms.length; j++) {
            permissions.push({
                functionalGroupName: functionalGroupName,
                permissionName: combinedPerms[j]                
            });
        }
    }
    return permissions;
}