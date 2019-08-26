//Copyright (c) 2018, Livio, Inc.
const app = require('../app');
const flame = app.locals.flame;
const flow = app.locals.flow;
const db = app.locals.db;
const sql = require('./sql.js');
const async = require('async');

//keeping this synchronous due to how small the data is. pass this to the event loop
function transformModuleConfig(info, next) {
    const base = info.base;
    const retrySeconds = info.retrySeconds;

    const hashBase = {};
    //hash up base info
    for (let i = 0; i < base.length; i++) {
        hashBase[base[i].id] = base[i];
        hashBase[base[i].id] = base[i];
        hashBase[base[i].id].seconds_between_retries = [];
    }

    //retry seconds are ordered
    for (let i = 0; i < retrySeconds.length; i++) {
        hashBase[retrySeconds[i].id].seconds_between_retries.push(retrySeconds[i].seconds);
    }

    //format the module configs so the UI can use them
    let moduleConfigs = [];
    for (let id in hashBase) {
        moduleConfigs.push(baseTemplate(hashBase[id]));
    }

    next(null, moduleConfigs);
}

function baseTemplate(objOverride) {
    const obj = {
        id: 0,
        status: 'PRODUCTION',
        exchange_after_x_ignition_cycles: 0,
        exchange_after_x_kilometers: 0,
        exchange_after_x_days: 0,
        timeout_after_x_seconds: 0,
        seconds_between_retries: [],
        endpoints: {
            '0x04': '',
            'queryAppsUrl': '',
            'lock_screen_icon_url': '',
            'custom_vehicle_data_mapping_url': ''
        },
        'endpoint_properties': {
            'custom_vehicle_data_mapping_url': {
                'version': ''
            }
        },
        notifications_per_minute_by_priority: {
            EMERGENCY: 0,
            NAVIGATION: 0,
            VOICECOM: 0,
            COMMUNICATION: 0,
            NORMAL: 0,
            NONE: 0
        }
    };

    if (objOverride) {
        //add overrides to the default
        obj.id = objOverride.id;
        obj.status = objOverride.status;
        obj.exchange_after_x_ignition_cycles = objOverride.exchange_after_x_ignition_cycles;
        obj.exchange_after_x_kilometers = objOverride.exchange_after_x_kilometers;
        obj.exchange_after_x_days = objOverride.exchange_after_x_days;
        obj.timeout_after_x_seconds = objOverride.timeout_after_x_seconds;
        obj.seconds_between_retries = objOverride.seconds_between_retries;
        obj.endpoints['0x04'] = objOverride.endpoint_0x04;
        obj.endpoints.queryAppsUrl = objOverride.query_apps_url;
        obj.endpoints.lock_screen_icon_url = objOverride.lock_screen_default_url;
        obj.endpoints.custom_vehicle_data_mapping_url = objOverride.custom_vehicle_data_mapping_url;
        obj.endpoint_properties.custom_vehicle_data_mapping_url.version = objOverride.custom_vehicle_data_mapping_url_version;
        obj.notifications_per_minute_by_priority.EMERGENCY = objOverride.emergency_notifications;
        obj.notifications_per_minute_by_priority.NAVIGATION = objOverride.navigation_notifications;
        obj.notifications_per_minute_by_priority.VOICECOM = objOverride.voicecom_notifications;
        obj.notifications_per_minute_by_priority.COMMUNICATION = objOverride.communication_notifications;
        obj.notifications_per_minute_by_priority.NORMAL = objOverride.normal_notifications;
        obj.notifications_per_minute_by_priority.NONE = objOverride.none_notifications;
    }

    return obj;
}

function insertVehicleDataItem(client, item, vehicleDataGroupId, parentId, cb) {

    client.getOne(sql.insertVehicleDataItem(item, vehicleDataGroupId, parentId), function(error, newVehicleDataItem) {
        console.log(`newVehicleDataItem`, newVehicleDataItem);
        if (item.params) {
            let transactions = [];
            for (let param of item.params) {

                transactions.push(function(cb) {
                    insertVehicleDataItem(client, param, vehicleDataGroupId, newVehicleDataItem.id, cb);
                });
            }
            async.parallel(transactions, function() {
                               cb();
                           }
            );
        } else {
            cb();

        }
    });

    // flame.async.waterfall([
    //                       //stage 1: insert module config
    //                       client.getOne.bind(client, sql.insertVehicleDataItem(item)),
    //
    //                       //stage 2: insert module config retry seconds
    //                       function(newVehicleDataItem, next) {
    //                           console.log(`newVehicleDataItem`, newVehicleDataItem);
    //                           next();
    //                       },
    //                   ], callback);

}

//store the information using a SQL transaction
function insertVehicleData(isProduction, vehicleData, next) {
    //change status
    if (isProduction) {
        vehicleData.status = 'PRODUCTION';
    } else {
        vehicleData.status = 'STAGING';
    }
    console.log(`vehicleData`);



    // process message groups synchronously (due to the SQL transaction)
    db.runAsTransaction(function(client, callback) {
        let transactions = [];
        // let newVehicleDataGroup;

        //stage 1: insert module config
        transactions.push(client.getOne.bind(client, sql.insertVehicleData(vehicleData)));

        //stage 2: insert module config retry seconds

        for (let item of vehicleData.schema_items)
        {
            transactions.push(function(newVehicleDataGroup,next) {
                console.log(`newVehicleDataGroup`,newVehicleDataGroup);
                insertVehicleDataItem(client,item,newVehicleDataGroup.id,null,function(error) {
                    next(null,newVehicleDataGroup);
                });
            })
            // transactions.push(client.getOne.bind(client,function(newVehicleDataGroup, next) {
            //
            //     console.log(`newVehicleDataGroup`, newVehicleDataGroup, vehicleData);
            //     next();
            // }))
        }

        flame.async.waterfall(transactions, callback);
    }, next);
}

module.exports = {
    transformModuleConfig: transformModuleConfig,
    insertVehicleData: insertVehicleData
};
