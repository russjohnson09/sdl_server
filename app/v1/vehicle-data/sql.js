//Copyright (c) 2018, Livio, Inc.
const sql = require('sql-bricks-postgres');

function moduleConfigById (id) {
    return sql.select('*')
        .from('module_config')
        .where({id: id});
}

function retrySecondsById (id) {
    return sql.select('*')
        .from('module_config_retry_seconds')
        .where({id: id})
        .orderBy('module_config_retry_seconds.order');
}

function moduleConfigByStatus (isProduction) {
    const tableName = isProduction ? 'view_module_config_production' : 'view_module_config_staging';
    return sql.select('*').from(tableName);
}

function retrySecondsByStatus (isProduction) {
    return sql.select('module_config_retry_seconds.*')
        .from('(' + moduleConfigByStatus(isProduction) + ') vmc')
        .innerJoin('module_config_retry_seconds', {'vmc.id': 'module_config_retry_seconds.id'})
        .orderBy('module_config_retry_seconds.order');
}

function insertVehicleDataItem(vehicleDataItem,vehicle_data_group_id,parent_id)
{
    console.log(`insertVehicleDataItem`,vehicleDataItem);

    let data = {
        name: vehicleDataItem.name,
        vehicle_data_group_id: vehicle_data_group_id,
        parent_id: parent_id,
        key: vehicleDataItem.key,
        type: vehicleDataItem.type,
        array: vehicleDataItem.array,
        since: vehicleDataItem.since,
        until: vehicleDataItem.until,
        removed: vehicleDataItem.removed,
        deprecated: vehicleDataItem.deprecated,
        minvalue: vehicleDataItem.minvalue,
        maxvalue: vehicleDataItem.maxvalue,
        minsize: vehicleDataItem.minsize,
        maxsize: vehicleDataItem.maxsize,
        minlength: vehicleDataItem.minlength,
        maxlength: vehicleDataItem.maxlength,
    };

    console.log(`insertVehicleDataItem`,data);

    return sql.insert('vehicle_data', data)
        .returning('*');
}


function insertVehicleData (vehicleData) {
    console.log(`insertVehicleData`,vehicleData);

    return sql.insert('vehicle_data_group', {
        status: vehicleData.status,
        // exchange_after_x_ignition_cycles: moduleConfig.exchange_after_x_ignition_cycles,
        // exchange_after_x_kilometers: moduleConfig.exchange_after_x_kilometers,
        // exchange_after_x_days: moduleConfig.exchange_after_x_days,
        // timeout_after_x_seconds: moduleConfig.timeout_after_x_seconds,
        // endpoint_0x04: moduleConfig.endpoints["0x04"],
        // query_apps_url: moduleConfig.endpoints.queryAppsUrl,
        // lock_screen_default_url: moduleConfig.endpoints.lock_screen_icon_url,
        // custom_vehicle_data_mapping_url: moduleConfig.endpoints.custom_vehicle_data_mapping_url,
        // custom_vehicle_data_mapping_url_version: moduleConfig.endpoint_properties.custom_vehicle_data_mapping_url.version,
        // emergency_notifications: moduleConfig.notifications_per_minute_by_priority.EMERGENCY,
        // navigation_notifications: moduleConfig.notifications_per_minute_by_priority.NAVIGATION,
        // voicecom_notifications: moduleConfig.notifications_per_minute_by_priority.VOICECOM,
        // communication_notifications: moduleConfig.notifications_per_minute_by_priority.COMMUNICATION,
        // normal_notifications: moduleConfig.notifications_per_minute_by_priority.NORMAL,
        // none_notifications: moduleConfig.notifications_per_minute_by_priority.NONE
    })
    .returning('*');
}

function insertRetrySeconds (secondsArray, id) {
    return sql.insert('module_config_retry_seconds', secondsArray.map(function (seconds, index) {
        return {
            id: id,
            seconds: seconds,
            order: index
        }
    }));
}

function insertVehicleDataReservedParams(vehicleDataReservedParams) {
    return vehicleDataReservedParams.map(function(param) {
        return sql.insert('vehicle_data_reserved_params', 'id')
            .select
            (
                `'${param}' AS id`
            )
            .where(
                sql.not(
                    sql.exists(
                        sql.select('*')
                            .from('vehicle_data_reserved_params p')
                            .where({
                                       'p.id': param
                                   })
                    )
                )
            )
            .toString();
    });
}


function insertVehicleDataEnums(enums) {
    return enums.map(function(param) {
        return sql.insert('vehicle_data_enums', 'id')
            .select
            (
                `'${param}' AS id`
            )
            .where(
                sql.not(
                    sql.exists(
                        sql.select('*')
                            .from('vehicle_data_enums e')
                            .where({
                                       'e.id': param
                                   })
                    )
                )
            )
            .toString();
    });
}


module.exports = {
    insert: {
        vehicleDataReservedParams: insertVehicleDataReservedParams,
        vehicleDataEnums: insertVehicleDataEnums,
    },
    insertVehicleDataItem: insertVehicleDataItem,
    insertVehicleData: insertVehicleData,
    insertRetrySeconds: insertRetrySeconds,
    moduleConfig: {
        id: moduleConfigById,
        status: moduleConfigByStatus
    },
    retrySeconds: {
        id: retrySecondsById,
        status: retrySecondsByStatus
    }
}
