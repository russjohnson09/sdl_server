//a repository of all the SQL statements
const sql = require('sql-bricks');
const config = require('../../settings.js'); //configuration module
const log = require(`../../custom/loggers/${config.loggerModule}/index.js`);
const db = require(`../../custom/databases/${config.dbModule}/index.js`)(log); //pass in the logger module that's loaded

const funcGroupInfo = sql.select('*').from('view_function_group_info').toString();
const funcGroupHmiLevels = sql.select('function_group_hmi_levels.*').from('view_function_group_info')
    .innerJoin('function_group_hmi_levels', {'view_function_group_info.id': 'function_group_hmi_levels.function_group_id'}).toString();
const funcGroupParameters = sql.select('function_group_parameters.*').from('view_function_group_info')
    .innerJoin('function_group_parameters', {'view_function_group_info.id': 'function_group_parameters.function_group_id'}).toString();

const moduleConfigInfo = sql.select('*').from('view_module_config').toString();
const moduleConfigRetrySeconds = sql.select('module_config_retry_seconds.*').from('view_module_config')
    .innerJoin('module_config_retry_seconds', {'view_module_config.id': 'module_config_retry_seconds.id'}).toString();

const permissions = sql.select('*').from('permissions').toString();
const permissionRelationsNoModules = sql.select('child_permission_name', 'parent_permission_name')
    .from('permission_relations')
    .innerJoin('permissions', {'permissions.name': 'permission_relations.child_permission_name'})
    .where(sql.notEq('type', 'MODULE'))
    .toString();
const rpcs = sql.select('*').from('permissions').where({type: 'RPC'}).toString();
const hmiLevels = sql.select('hmi_level_enum AS id').from('hmi_levels')
    .innerJoin('hmi_level_conversion', {'hmi_levels.id': 'hmi_level_conversion.hmi_level_text'}).toString();

const getLanguages = sql.select('*').from('languages').toString();

module.exports = {
    funcGroup: {
        info: funcGroupInfo,
        hmiLevels: funcGroupHmiLevels,
        parameters: funcGroupParameters
    },
    moduleConfig: {
        info: moduleConfigInfo,
        retrySeconds: moduleConfigRetrySeconds
    },
    insert: {
        vendor: insertVendor,
        appInfo: insertAppInfo,
        appCountries: insertAppCountries,
        appDisplayNames: insertAppDisplayNames,
        appPermissions: insertAppPermissions,
        appAutoApproval: insertAppAutoApproval,
        permissions: insertPermissions,
        permissionRelations: insertPermissionRelations,
        funcGroupInfo: insertFuncGroupInfo,
        funcHmiLevels: insertHmiLevels,
        funcParameters: insertParameters,
        messageGroups: insertMessageGroups,
        messageTexts: insertMessageTexts,
        languages: insertLanguages
    },
    delete: {
        funcGroup: deleteFuncGroup,
        autoApproval: deleteAutoApproval
    },
    getApp: {
        base: {
            multiFilter: getFullAppInfoFilter,
            idFilter: getAppInfoId
        },
        countries: {
            multiFilter: getAppCountriesFilter,
            idFilter: getAppCountriesId
        },
        displayNames: {
            multiFilter: getAppDisplayNamesFilter,
            idFilter: getAppDisplayNamesId
        },
        permissions: {
            multiFilter: getAppPermissionsFilter,
            idFilter: getAppPermissionsId
        },
        vendor: {
            multiFilter: getAppVendorFilter,
            idFilter: getAppVendor
        },
        category: {
            multiFilter: getAppCategoryFilter,
            idFilter: getAppCategory
        },
        autoApproval: {
            multiFilter: getAppAutoApprovalFilter,
            idFilter: getAppAutoApproval
        }
    },
    getFuncGroup: {
        base: {
            idFilter: getFuncGroupId,
            statusFilter: getFuncGroupStatus
        },
        hmiLevels: {
            idFilter: getFuncGroupHmiLevelsId,
            statusFilter: getFuncGroupHmiLevelsStatus
        },
        parameters: {
            idFilter: getFuncGroupParametersId,
            statusFilter: getFuncGroupParametersStatus
        }
    },
    appInfo: {
        base: getBaseAppInfo,
        displayNames: getAppDisplayNames,
        modules: getAppModules,
        funcGroups: getAppFunctionalGroups,
        permissions: getAppPermissions,
    },
    getMessages: {
        status: getMessagesStatus,
        group: getMessageGroups,
        byCategory: getMessageByCategory,
        byId: getMessageById,
        groupById: getMessageGroupsById,
        categoryByLanguage: getMessageCategoriesByLanguage,
        categoryByMaxId: getMessageCategoriesByMaxId,
        byIds: getMessagesByIds,
        groupsByIds: getMessageGroupsByIds
    },
    timestampCheck: timestampCheck,
    permissions: permissions,
    permissionRelationsNoModules: permissionRelationsNoModules,
    rpcs: rpcs,
    hmiLevels: hmiLevels,
    setupSqlCommand: setupSqlCommand,
    setupSqlInsertsNoError: setupSqlInsertsNoError,
    unmappedPermissions: findUnmappedPermissions,
    getLanguages: getLanguages,
    changeAppApprovalStatus: changeAppApprovalStatus,
    checkAutoApproval: checkAutoApproval
}

//given a SQL command, sets up a function to execute the query and pass back the results
function setupSqlCommand (sqlString) {
    return function (next) {
        db.sqlCommand(sqlString, function (err, res) {   
            if (err) {
                log.error(err);
                log.error(sqlString);
            }
            next(err, res.rows);
        });     
    }
}

//built for insert statements and will attempt all insertions
function setupSqlInsertsNoError (sqlStringArray) {
    if (!Array.isArray(sqlStringArray)) { //if its just a single sql statement, make it into an array
        sqlStringArray = [sqlStringArray];
    }
    return sqlStringArray.map(function (str) {
        return function (next) {
            setupSqlCommand(str)(function (err, res) {
                next();
            });
        }    
    });
}

//sql generating functions
function insertVendor (name, email) {
    const vendorObj = {
        vendor_name: name,
        vendor_email: email
    };
    return sql.insert('vendors', vendorObj).toString();
}

function timestampCheck (tableName, whereObj) {
    return sql.select('max(updated_ts)').from(tableName).where(whereObj).toString();
}

function insertAppInfo (appObj) {
    //attach the vendor id that matches the info in appObj from the db
    //make sure values with quotations can be inserted, too...
    if (appObj.approval_status) { //defined approval_status
        return sql.insert
            ('app_info', 'app_uuid', 'name', 'platform', 'platform_app_id', 'status', 'can_background_alert', 
            'can_steal_focus', 'default_hmi_level', 'tech_email', 'tech_phone', 'category_id', 'approval_status', 'vendor_id')
            .select
                (
                `'${appObj.uuid}' AS app_uuid`,
                `'${doubleQuotes(appObj.name)}' AS name`,
                `'${appObj.platform}' AS platform`,
                `'${appObj.platform_app_id}' AS platform_app_id`,
                `'${appObj.status}' AS status`,
                `'${appObj.can_background_alert}' AS can_background_alert`,
                `'${appObj.can_steal_focus}' AS can_steal_focus`,
                `'${appObj.default_hmi_level}' AS default_hmi_level`,
                `'${doubleQuotes(appObj.tech_email)}' AS tech_email`,
                `'${appObj.tech_phone}' AS tech_phone`,
                `${appObj.category.id} AS category_id`,
                `'${appObj.approval_status}' AS approval_status`,
                `max(id) AS vendor_id`
                )
            .from('vendors').where({
                vendor_name: appObj.vendor.name,
                vendor_email: appObj.vendor.email
            })
            .toString();
    }
    else {
        return sql.insert
            ('app_info', 'app_uuid', 'name', 'platform', 'platform_app_id', 'status', 'can_background_alert', 
            'can_steal_focus', 'default_hmi_level', 'tech_email', 'tech_phone', 'category_id', 'vendor_id')
            .select
                (
                `'${appObj.uuid}' AS app_uuid`,
                `'${doubleQuotes(appObj.name)}' AS name`,
                `'${appObj.platform}' AS platform`,
                `'${appObj.platform_app_id}' AS platform_app_id`,
                `'${appObj.status}' AS status`,
                `'${appObj.can_background_alert}' AS can_background_alert`,
                `'${appObj.can_steal_focus}' AS can_steal_focus`,
                `'${appObj.default_hmi_level}' AS default_hmi_level`,
                `'${doubleQuotes(appObj.tech_email)}' AS tech_email`,
                `'${appObj.tech_phone}' AS tech_phone`,
                `${appObj.category.id} AS category_id`,
                `max(id) AS vendor_id`
                )
            .from('vendors').where({
                vendor_name: appObj.vendor.name,
                vendor_email: appObj.vendor.email
            })
            .toString();
    }

}

function insertAppCountries (appObj) {
    return appObj.countries.map(function (country) {
        return sql.insert('app_countries', 'country_iso', 'app_id')
            .select
                (
                `'${country.iso}' AS country_iso`,
                `max(id) AS app_id`
                )
            .from('app_info').where({
                app_uuid: appObj.uuid
            })
            .toString();    
    });
}

function insertAppDisplayNames (appObj) {
    return appObj.display_names.map(function (displayName) {
        return sql.insert('display_names', 'display_text', 'app_id')
            .select
                (
                `'${displayName}' AS display_text`,
                `max(id) AS app_id`
                )
            .from('app_info').where({
                app_uuid: appObj.uuid
            })
            .toString();    
    });
}

function insertAppPermissions (appObj) {
    return appObj.permissions.map(function (permission) {
        return sql.insert('app_permissions', 'permission_name', 'hmi_level', 'app_id')
            .select
                (
                `'${permission.key}' AS permission_name`,
                `'${permission.hmi_level}' AS hmi_level`,
                `max(id) AS app_id`
                )
            .from('app_info').where({
                app_uuid: appObj.uuid
            })
            .toString();    
    });
}

function insertAppAutoApproval (appObj) {
    if (appObj.is_auto_approved_enabled) {
        //check if the app uuid exists first before insertion
        return [
            sql.insert('app_auto_approval', 'app_uuid')
                .select
                    (
                    `'${appObj.uuid}' AS app_uuid`
                    )
                .where(sql.not(sql.exists(
                    sql.select('*').from('app_auto_approval aaa').where({'aaa.app_uuid': appObj.uuid})
                )))
                .toString()
        ];
    }
    else {
        return [];
    }
}

function insertPermissions (permissionObjs) {
    return permissionObjs.map(function (permission) {
        return sql.insert('permissions', 'name', 'type')
            .select
                (
                `'${permission.name}' AS name`,
                `'${permission.type}' AS type`
                )
            .where(sql.not(sql.exists(
                sql.select('*').from('permissions perm').where({'perm.name': permission.name})
            )))
            .toString();    
    });
}

function insertPermissionRelations (permissionRelationObjs) {
    return permissionRelationObjs.map(function (permissionRelation) {
        return sql.insert('permission_relations', 'child_permission_name', 'parent_permission_name')
            .select
                (
                `'${permissionRelation.child_permission_name}' AS child_permission_name`,
                `'${permissionRelation.parent_permission_name}' AS parent_permission_name`
                )
            .where(sql.not(sql.exists(
                sql.select('*').from('permission_relations perm_rel').where({
                    'perm_rel.child_permission_name': permissionRelation.child_permission_name,
                    'perm_rel.parent_permission_name': permissionRelation.parent_permission_name
                })
            )))
            .toString();    
    });
}


function insertFuncGroupInfo (funcGroupObj) {
    return sql.insert('function_group_info', funcGroupObj).toString();
}

function insertHmiLevels (hmiLevels) {
    return hmiLevels.map(function (obj) {
        return sql.insert('function_group_hmi_levels', 'permission_name', 'hmi_level', 'function_group_id')
            .select
                (
                `'${obj.permission_name}' AS permission_name`,
                `'${obj.hmi_level}' AS hmi_level`,
                `max(id) AS function_group_id`
                )
            .from('function_group_info').where({
                property_name: obj.property_name
            })
            .toString();   
    });
}

function insertParameters (parameters) {
    return parameters.map(function (obj) {
        return sql.insert('function_group_parameters', 'rpc_name', 'parameter', 'function_group_id')
            .select
                (
                `'${obj.rpc_name}' AS rpc_name`,
                `'${obj.parameter}' AS parameter`,
                `max(id) AS function_group_id`
                )
            .from('function_group_info').where({
                property_name: obj.property_name
            })
            .toString();   
    });
}

function deleteFuncGroup (id) {
    return sql.delete().from('function_group_info').where({id: id}).toString();
}

function deleteAutoApproval (uuid) {
    return sql.delete().from('app_auto_approval').where({app_uuid: uuid}).toString();
}

function getBaseAppInfo (isProduction, appUuids) {
    let approvalStatusArray = [];
    if (isProduction) {
        approvalStatusArray = ["ACCEPTED"];
    }
    else {
        approvalStatusArray = ["ACCEPTED", "PENDING"];
    }

    let tempTable = sql.select('app_uuid', 'max(id) AS id')
        .from('view_partial_app_info group_ai')
        .where(sql.in('group_ai.approval_status', approvalStatusArray))
        .where(sql.in('group_ai.app_uuid', appUuids))
        .groupBy('app_uuid');

    return sql.select('app_info.*')
        .from('('+tempTable+') ai')
        .join('app_info', {
            'app_info.id': 'ai.id'
        })
        .toString();
}

function getAppDisplayNames (appId) {
    return sql.select('display_text')
        .from('display_names') 
        .where({
            'app_id': appId
        }).toString();
}

function getAppModules (appId) {
    return sql.select('app_permissions.permission_name')
        .from('app_permissions') 
        .join('permissions', {
            'app_permissions.permission_name': 'permissions.name'
        })
        .where({
            'app_permissions.app_id': appId,
            'permissions.type': 'MODULE'
        }).toString();
}

function getAppFunctionalGroups (isProduction, appObj) {
    let sqlOr = [
        {
            'fgi.is_default': true
        },
        sql.exists(
            sql.select()
                .from('app_permissions ap')
                .join('hmi_level_conversion hlc', {
                    'hlc.hmi_level_text': 'ap.hmi_level'
                })
                .join('function_group_parameters fgp', {
                    'fgp.rpc_name': 'ap.permission_name'
                })
                .where({
                    'ap.app_id': appObj.id,
                    'fgp.function_group_id': sql('fgi.id')
                })
                .where(
                    sql.exists(
                        sql.select()
                        .from('function_group_hmi_levels fghl')
                        .where({
                            'fghl.permission_name': sql('ap.permission_name'),
                            'fghl.function_group_id': sql('fgi.id'),
                            'fghl.hmi_level': sql('hlc.hmi_level_enum')
                        })
                    )
                )
        ),
        sql.exists(
            sql.select()
                .from('app_permissions ap')
                .join('hmi_level_conversion hlc', {
                    'hlc.hmi_level_text': 'ap.hmi_level'
                })
                .join('function_group_parameters fgp', {
                    'fgp.parameter': 'ap.permission_name'
                })
                .where({
                    'ap.app_id': appObj.id,
                    'fgp.function_group_id': sql('fgi.id')
                })
                .where(
                    sql.exists(
                        sql.select()
                        .from('function_group_hmi_levels fghl')
                        .where({
                            'fghl.permission_name': sql('fgp.rpc_name'),
                            'fghl.function_group_id': sql('fgp.function_group_id'),
                            'fghl.hmi_level': sql('hlc.hmi_level_enum')
                        })
                    )
                )
        ),
        sql.exists(
            sql.select()
                .from('function_group_hmi_levels fghl')
                .join('permission_relations pr', {
                    'pr.parent_permission_name': 'fghl.permission_name'
                })
                .join('permissions p', {
                    'p.name': 'pr.child_permission_name'
                })
                .join('app_permissions ap', {
                    'ap.permission_name': 'p.name'
                })
                .join('hmi_level_conversion hlc', {
                    'hlc.hmi_level_text': 'ap.hmi_level'
                })
                .where({
                    'ap.app_id': appObj.id,
                    'fghl.function_group_id': sql('fgi.id'),
                    'p.type': 'MODULE',
                    'fghl.hmi_level': sql('hlc.hmi_level_enum')
                })
        )
    ];

    if(appObj.can_background_alert){
        sqlOr.push(
            sql.exists(
                sql.select()
                    .from('function_group_hmi_levels fghl')
                    .where({
                        'fghl.function_group_id': sql('fgi.id'),
                        'fghl.permission_name': 'Alert',
                        'fghl.hmi_level': 'BACKGROUND'
                    })
            )
        );
    }

    let statement = sql.select('fgi.property_name')
        .from('function_group_info fgi')
        .where(
            sql.or(sqlOr)
        );
    
    if (isProduction) {
        statement.groupBy('fgi.property_name', 'fgi.status')
            .having({
                'fgi.status': 'PRODUCTION'
            });
    } 
    else {
        statement.groupBy('fgi.property_name');
    }
    return statement.toString();
}
//todo: remove
function getAppPermissions (appId) {
    return sql.select('permission_name', 'type', 'hmi_level', 'rpc_name')
        .from('app_permissions') 
        .join('permissions', {
            'app_permissions.permission_name': 'permissions.name'
        })
        .join('function_group_parameters', {
            'function_group_parameters.parameter': 'app_permissions.permission_name'
        })
        .where({
            'app_permissions.app_id': appId
        }).toString();
}

//for SQL statements not handled by sql-bricks whose values may contain quotations
function doubleQuotes (str) {
    if (str !== null) {
        return str.replace("'", "''");
    }
    else {
        return null;
    }
} 

//APPROVAL STATUS AND APP UUID FILTER APP FUNCTIONS. 
//functions for getting information about only the most recent changes to all app uuids
function getAppInfoFilter (filterObj) {
    //filter by approval status or by app uuid, depending on whether the properties are defined
    let statement = sql.select('max(id) AS id', 'app_uuid')
        .from('app_info');

    if (filterObj && filterObj.app_uuid) {
        statement = statement.where({
            'app_info.app_uuid': filterObj.app_uuid
        });
    }
    statement = statement.groupBy('app_uuid').toString();

    //put the approval status filter on the outside
    if (filterObj && filterObj.approval_status) {
        statement = sql.select('app_info.*')
            .from('app_info')
            .join('(' + statement + ') innerai', {'innerai.id': 'app_info.id'})
            .where({
                'app_info.approval_status': filterObj.approval_status
            });
    }

    return statement.toString();
}

function getFullAppInfoFilter (filterObj) {
    return sql.select('app_info.*')
        .from('app_info')
        .join('(' + getAppInfoFilter(filterObj) + ') ai', {'ai.id': 'app_info.id'})
        .toString();
}

function getAppCountriesFilter (filterObj) {
    //info must be joined with the countries table to get the country name, too
    return sql.select('app_id AS id', 'country_iso', 'countries.name')
        .from('app_countries')
        .join('countries', {'app_countries.country_iso': 'countries.iso'})
        .join('(' + getAppInfoFilter(filterObj) + ') ai', {'ai.id': 'app_countries.app_id'})
        .toString();
}

function getAppDisplayNamesFilter (filterObj) {
    return sql.select('id', 'display_text')
        .from('display_names')
        .join('(' + getAppInfoFilter(filterObj) + ') ai', {'ai.id': 'display_names.app_id'})
        .toString();
}

function getAppPermissionsFilter (filterObj) {
    //info must be joined with the permissions table to get the type, too
    return sql.select('app_id AS id', 'permission_name', 'type', 'hmi_level')
        .from('app_permissions')
        .join('permissions', {'app_permissions.permission_name': 'permissions.name'})
        .join('(' + getAppInfoFilter(filterObj) + ') ai', {'ai.id': 'app_permissions.app_id'})
        .toString();
}

function getAppVendorFilter (filterObj) {
    return sql.select('vendors.id', 'vendor_name', 'vendor_email')
        .from('vendors')
        .join('(' + getAppInfoFilter(filterObj) + ') ai', {'ai.id': 'vendors.id'})
        .toString();
}

function getAppCategoryFilter (filterObj) {
    const innerAppInfoSelect = sql.select('app_info.id', 'app_info.category_id')
        .from('app_info')
        .join('(' + getAppInfoFilter(filterObj) + ') ai', {'ai.id': 'app_info.id'});

    return sql.select('categories.id', 'display_name')
        .from('categories')
        .join('(' + innerAppInfoSelect + ') ai2', {'ai2.category_id': 'categories.id'})
        .toString();
}

function getAppAutoApprovalFilter (filterObj) {
    return sql.select('app_auto_approval.app_uuid')
        .from('app_auto_approval')
        .join('(' + getAppInfoFilter(filterObj) + ') ai', {'ai.app_uuid': 'app_auto_approval.app_uuid'})
        .toString();
}

//ID / APP_UUID FILTER APP FUNCTIONS. They function differently from above since a specific app version is wanted
function getAppInfoId (id) {
    return sql.select('*')
        .from('app_info')
        .where({id: id}).toString();
}

function getAppCountriesId (id) {
    return sql.select('app_id AS id', 'country_iso', 'name')
        .from('app_countries')
        .join('countries', {'app_countries.country_iso': 'countries.iso'})
        .where({app_id: id}).toString();
}

function getAppDisplayNamesId (id) {
    return sql.select('app_id AS id', 'display_text')
        .from('display_names')
        .where({app_id: id}).toString();
}

function getAppPermissionsId (id) {
    return sql.select('app_id AS id', 'permission_name', 'type', 'hmi_level')
        .from('app_permissions')
        .join('permissions', {'app_permissions.permission_name': 'permissions.name'})
        .where({app_id: id}).toString();
}

function getAppVendor (id) {
    return sql.select('*').from('vendors')
        .where({id: id}).toString();
}

function getAppCategory (id) {
    return sql.select('categories.id', 'display_name')
        .from('categories')
        .join('app_info', {'app_info.category_id': 'categories.id'})
        .where({'categories.id': id}).toString();
}

function getAppAutoApproval (id) {
    //find the app uuid from app_info by searching by id, then join with app_auto_approval
    return sql.select('app_auto_approval.app_uuid')
        .from('app_auto_approval')
        .join('app_info', {'app_auto_approval.app_uuid': 'app_info.app_uuid'})
        .where({id: id}).toString();
}

//END ID / APP_UUID FILTER APP FUNCTIONS

//these get all permissions not assigned to a functional group. permissions of type MODULE are excluded
//since they don't belong in functional groups
function findUnmappedPermissions (isProduction) {
    /*const mappedPermsProduction = sql.select('*').from('view_mapped_permissions')
        .where({status: 'PRODUCTION'});
        
    const mappedPermsGroup = sql.select('max(id) AS id', 'property_name')
        .from('view_mapped_permissions')
        .groupBy('property_name');

    const mappedPermsStaging = sql.select('mp.id', 'mp.property_name', 'view_mapped_permissions.name')
        .from('(' + mappedPermsGroup + ') mp')
        .innerJoin('view_mapped_permissions', {'view_mapped_permissions.id': 'mp.id'});*/

    let chosenPermissionFilter;

    if (isProduction) {
        //filter out mapped permissions so only production entries exist,
        //then find unmapped permissions from that reduced set
        //chosenPermissionFilter = mappedPermsProduction;
        chosenPermissionFilter = sql.select('*').from('view_mapped_permissions_production');
    }
    else {
        //filter out mapped permissions based on highest id, 
        //then find unmapped permissions from that reduced set
        //chosenPermissionFilter = mappedPermsStaging;
        chosenPermissionFilter = sql.select('*').from('view_mapped_permissions_staging');
    }

    return sql.select('permissions.name', 'permissions.type')
        .from('(' + chosenPermissionFilter + ') vmp')
        .rightOuterJoin('permissions', {'permissions.name': 'vmp.name'})
        .where(sql.and(sql.isNull('vmp.name'), sql.notEq('permissions.type', 'MODULE')))
        .toString();
}

//FUNCTIONAL GROUP FILTER FUNCTIONS

function getFuncGroupId (id) {
    return sql.select('*').from('function_group_info')
        .where({id: id}).toString();
}

function getFuncGroupHmiLevelsId (id) {
    return sql.select('function_group_id', 'permission_name', 'hmi_level')
        .from('function_group_hmi_levels')
        .where({function_group_id: id}).toString();
}

function getFuncGroupParametersId (id) {
    return sql.select('function_group_id', 'rpc_name', 'parameter')
        .from('function_group_parameters')
        .where({function_group_id: id}).toString();
}

function getFuncGroupStatus (isProduction) {
    const funcGroupsProduction = sql.select('*').from('view_function_group_info')
        .where({status: 'PRODUCTION'})
        .toString();

    const funcGroupsGroup = sql.select('max(id) AS id', 'property_name')
        .from('view_function_group_info')
        .groupBy('property_name');
    const funcGroupsStaging = sql.select('view_function_group_info.*')
        .from('(' + funcGroupsGroup + ') vfgi')
        .innerJoin('view_function_group_info', {'view_function_group_info.id': 'vfgi.id'})
        .toString();

    if (isProduction) {
        //filter out so only production entries exist
        return funcGroupsProduction;
    }
    else {
        //filter out based on highest id
        return funcGroupsStaging;
    }
}

function getFuncGroupHmiLevelsStatus (isProduction) {
    return sql.select('function_group_id', 'permission_name', 'hmi_level')
        .from('(' + getFuncGroupStatus(isProduction) + ') fgi')
        .innerJoin('function_group_hmi_levels', {'fgi.id': 'function_group_hmi_levels.function_group_id'})
        .toString();
}

function getFuncGroupParametersStatus (isProduction) {
    return sql.select('function_group_id', 'rpc_name', 'parameter')
        .from('(' + getFuncGroupStatus(isProduction) + ') fgi')
        .innerJoin('function_group_parameters', {'fgi.id': 'function_group_parameters.function_group_id'})
        .toString();
}

//END FUNCTIONAL GROUPS

//BEGIN CONSUMER FRIENDLY MESSAGE FUNCTION


//returns a combination of message group and message text entries in a flat structure.
//this is useful for generating the policy table, but not for returning info for the UI
function getMessagesStatus (isProduction) {
    if (isProduction) {
        return sql.select('*').from('view_message_text_production').toString();
    }
    else {
        return sql.select('*').from('view_message_text_staging').toString();
    } 
}

//retrieve message group information such as categories
function getMessageGroups (isProduction, category) {
    let viewName;

    if (isProduction) {
        viewName = 'view_message_group_production';
    }
    else {
        viewName = 'view_message_group_staging';
    } 

    let sqlString = sql.select('message_group.*')
        .from(viewName)
        .innerJoin('message_group', {'message_group.id': viewName + '.id'});

    if (category) {
        sqlString = sqlString.where({'message_group.message_category': category});
    }

    return sqlString.toString();   
}

//retrieve all messages in a category
function getMessageByCategory (isProduction, category, preventStringify) {
    let sqlString;

    if (isProduction) {
        sqlString = sql.select('*').from('view_message_text_production')
            .where({message_category: category});
    }
    else {
        sqlString = sql.select('*').from('view_message_text_staging')
            .where({message_category: category});
    }        

    if (!preventStringify) {
        sqlString = sqlString.toString();
    }

    return sqlString;
}

function getMessageById (id) {
    return sql.select('*').from('message_text')
        .where({message_group_id: id}).toString();
}

function getMessageGroupsById (id) {
    return sql.select('*').from('message_group')
        .where({id: id}).toString();
}

//given an array of ids, find all message texts with matching group ids that are in STAGING only
function getMessagesByIds (ids) {
    return sql.select('message_text.*').from('message_text')
        .innerJoin('message_group', {'message_group.id': 'message_text.message_group_id'})
        .where(
            sql.and(
                sql.in('message_group_id', [1,2,12]), 
                {status: 'STAGING'}
            )
        ).toString();
}

//given an array of ids, find all message groups matching those that are in STAGING only
function getMessageGroupsByIds (ids) {
    return sql.select('*').from('message_group')
        .where(
            sql.and(
                sql.in('id', [1,2,12].toString()), 
                {status: 'STAGING'}
            )
        ).toString()
}

//return all categories of a certain language. may or may not exist
function getMessageCategoriesByLanguage (isProduction, languageCode) {
    if (isProduction) {
        return sql.select('*').from('view_message_text_production')
            .where({language_id: languageCode}).toString();
    }
    else {
        return sql.select('*').from('view_message_text_staging')
            .where({language_id: languageCode}).toString();
    }        
}

//return all categories, like getMessageCategories, but also return text information from message_text
function getMessageCategoriesByMaxId (isProduction) {
    let viewName;
    if (isProduction) {
        viewName = "view_message_text_production";
    }
    else {
        viewName = "view_message_text_staging";
    }

    let messagesGroup = sql.select('max(id) AS id', 'message_category')
        .from(viewName)
        .groupBy('message_category');

    //always make sure the message category name is returned, because message_text doesn't have that info
    return sql.select('message_category', 'message_text.*')
        .from('(' + messagesGroup + ') mt')
        .innerJoin('message_text', {'message_text.id': 'mt.id'})
        .toString();
}

function insertMessageGroups (objs) {
    return objs.map(function (obj) {
        return sql.insert('message_group', objs).toString();
    });
}

function insertMessageTexts (objs) {
    return objs.map(function (obj) {
        return sql.insert('message_text', 'language_id', 'tts', 'line1', 'line2', 'text_body', 'label', 'message_group_id')
            .select
                (
                `'${obj.language_id}' AS language_id`,
                `'${obj.tts}' AS tts`,
                `'${obj.line1}' AS line1`,
                `'${obj.line2}' AS line2`,
                `'${obj.text_body}' AS text_body`,
                `'${obj.label}' AS label`,
                `max(id) AS message_group_id`
                )
            .from('message_group').where({
                message_category: obj.message_category
            })
            .toString();   
    });
}
/*
ex.
    return parameters.map(function (obj) {
        return sql.insert('function_group_parameters', 'rpc_name', 'parameter', 'function_group_id')
            .select
                (
                `'${obj.rpc_name}' AS rpc_name`,
                `'${obj.parameter}' AS parameter`,
                `max(id) AS function_group_id`
                )
            .from('function_group_info').where({
                property_name: obj.property_name
            })
            .toString();   
    });
*/

/*
function deleteMessageCategory (messageCategory) {
    //a category can contain many records. all must be deleted
    return sql.delete()
        .from('message_text')
        .where(
            sql.in('id', sql.select('*').from('message_text').where({message_category: messageCategory}))
        ).toString();
}
*/

function insertLanguages (languages) {
    return languages.map(function (lang) {
        return sql.insert('languages', 'id')
            .select
                (
                `'${lang}' AS id`
                )
            .where(sql.not(sql.exists(
                sql.select('*').from('languages l').where({'l.id': lang})
            )))
            .toString();
    });
}

function changeAppApprovalStatus (id, statusName) {
    return sql.update('app_info')
        .set({approval_status: statusName})
        .where({id: id})
        .toString();
}

function checkAutoApproval (uuid) {
    return sql.select('app_auto_approval.app_uuid')
        .from('app_auto_approval')
        .where({app_uuid: uuid})
        .toString();    
}