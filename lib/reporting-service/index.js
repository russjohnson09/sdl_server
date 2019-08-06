const moment = require('moment');
// const moment = require('moment');
const bricks = require('sql-bricks-postgres');

//replace async await pattern with

//sdl_server/custom/databases/postgres/index.js

//async.waterfall
let db;
let reportingService = {
    insertUpdateRecordById: function(table,data,now,cb)
    {
        cb = cb || function(){};
        now = now || new Date();
        data.updated_ts = now;
        let update_columns = [];
        for (let key in data)
        {
            update_columns.push(key);
        }
        data.created_ts = now;

        console.log(`insertUpdateRecordById`,table,data,update_columns);
        let query = bricks.insert(table, data).onConflict('id').doUpdate(update_columns);
        return reportingService.sqlCommand(query,cb);
    },
    //TODO use callback instead
     updateDeviceData: async function(deviceData,now)
    {
        if (!deviceData)
        {
            return;
        }
        for (let id in deviceData)
        {
            //removes any unsupported fields
            let {carrier,connection_type,hardware,os,os_version} = deviceData[id];
            let data = {carrier,connection_type,hardware,os,os_version,id};
            for (let key in data)
            {
                data[key] = data[key] || 'UNKNOWN';
            }
            let result = await reportingService.insertUpdateRecordById(`device`,data,now);
        }
    },
    removeOldAppUsageRequests: function(cb)
    {
        cb = cb || function(){};
        let expiration = moment().subtract(reportingService.expirationDays,'days').toDate();

        let query = bricks.delete(`app_usage`).where(
          bricks.and(
            bricks.lt(updated_ts,expiration)
          )
        );

        reportingService.sqlCommand(query,cb);
    },
    //TODO use callback instead

    removeOldPolicyTableUpdateRequests: function()
    {
        let expiration = moment().subtract(reportingService.expirationDays,'days').toDate();
        let result = reportingService.doQuery({
            text: `DELETE FROM policy_table_update_request where updated_ts < $1`,
            values: [expiration]
        });

        return result;

    },
    //    //TODO use callback instead
    removeOldDeviceData: async function()
    {
        let expiration = moment().subtract(reportingService.expirationDays,'days').toDate();
        let result = await reportingService.doQuery({
            text: `DELETE FROM device where updated_ts < $1`,
            values: [expiration]
        });

        return result;

    },
    //TODO use callback instead
    purgeOldRecords: function()
    {
        let checkOldDataInterval = 5 *  60 * 1000;
        if ((Date.now() - reportingService.lastPurge) > checkOldDataInterval)
        {
            return;
        }
        //TODO callback for all of these using async.waterfall.
        reportingService.removeOldDeviceData();
        reportingService.removeOldPolicyTableUpdateRequests();
        reportingService.removeOldAppUsageRequests();

        reportingService.lastPurge = Date.now();
    },
    updateUsageAndErrorCounts: async function(usage_and_error_counts,now,full_app_id_supported,cb)
    {
        cb = cb || function(){};
        if (!usage_and_error_counts)
        {
            return cb();
        }
        if (usage_and_error_counts.app_level)
        {
            await reportingService.updateAppLevelUsageAndErrorCounts(usage_and_error_counts.app_level,now,full_app_id_supported,cb);

        }
    },
    //TODO use callback instead
    appUsageInsert: async function(app_id,obj,now,cb)
    {
        now = now || new Date();
        let {
            count_of_user_selections,
            count_of_rejected_rpc_calls,
            minutes_in_hmi_background,
            minutes_in_hmi_full,
            minutes_in_hmi_limited,
            minutes_in_hmi_none
        } = obj;


        let data = {
            app_id,
            count_of_user_selections,
            count_of_rejected_rpc_calls,
            minutes_in_hmi_background,
            minutes_in_hmi_full,
            minutes_in_hmi_limited,
            minutes_in_hmi_none,
            created_ts: now,
            updated_ts: now
        }

        let query = bricks.insert(`app_usage`,data);
        return reportingService.sqlCommand(query,cb);
    },
    //TODO use callback instead
    //TODO remove all try catch
    updateAppLevelUsageAndErrorCounts: function(app_level,now,full_app_id_supported,cb)
    {
        let uuid_column = full_app_id_supported ? `app_uuid` : `app_short_uuid`;

        for (let uuid in app_level)
        {
            let query = bricks.select(`id`).from(`app_info`).where({[uuid_column]: uuid});

            reportingService.sqlCommand(query, function(error,rows) {

                if (rows && rows[0])
                {
                    let application = rows[0];
                    reportingService.appUsageInsert(application.id,app_level[uuid],now, cb);
                }
                else {
                    cb();
                }
            });

        }
    },
    getDaysSinceEpoch: function(date)
    {
        let epoch = moment(new Date(0));
        let endDate = moment(date);

        return endDate.diff(epoch,'days');
    },
    getTriggerEventFromPolicyTableObject: function(policyTableObject,now)
    {
        now = now || new Date();

        let {module_config,module_meta} = policyTableObject;

        let {exchange_after_x_days,exchange_after_x_ignition_cycles,exchange_after_x_kilometers} = module_config;
        let {ignition_cycles_since_last_exchange,pt_exchanged_at_odometer_x,pt_exchanged_x_days_after_epoch} = module_meta;


        let daysSinceEpoch = reportingService.getDaysSinceEpoch(now);

        let daysSinceLastExchange = daysSinceEpoch - pt_exchanged_x_days_after_epoch;


        if (daysSinceLastExchange >= exchange_after_x_days)
        {
            return `DAYS`;
        }

        if (ignition_cycles_since_last_exchange >= exchange_after_x_ignition_cycles)
        {
            return `IGNITION`;
        }


        //no way to know distance without knowing current odometer reading.
        // if (ignition_cycles_since_last_exchange >= exchange_after_x_ignition_cycles)
        // {
        //   return `DISTANCE`;
        // }

        //TODO add trigger passed in from core when it becomes available
        return 'IGNITION';


    },
    updatePolicyTableUpdateRequests: async function(policyTableObject,now,cb)
    {
        cb = cb || function(){};
        now = now || new Date();

        let trigger_event;
        try {
            trigger_event = reportingService.getTriggerEventFromPolicyTableObject(policyTableObject,now);
        }
        catch (e)
        {
            trigger_event = 'UNKNOWN';
        }
        let data = {trigger_event};
        data.updated_ts = now;
        data.created_ts = now;
        let query = bricks.insert(`policy_table_update_request`,data);
        // let result = await reportingService.insert(`policy_table_update_request`,data,now);

        reportingService.sqlCommand(query,cb);
    },
    //TODO use callback instead
    updateReporting: async function(policyTableObject,now,full_app_id_supported)
    {

        try {
            if (!reportingService.trackingEnabled)
            {
                return {
                    success: false,
                    error: `Tracking is disabled.`
                }
            }

            //TODO callback
            reportingService.purgeOldRecords();

            let policyTableUpdatePromise = reportingService.updatePolicyTableUpdateRequests(policyTableObject,now);
            if (policyTableObject.device_data)
            {
                //TODO callback
                reportingService.updateDeviceData(policyTableObject.device_data,now);
            }

            if (policyTableObject.usage_and_error_counts)
            {
                //TODO callback
                reportingService.updateUsageAndErrorCounts(policyTableObject.usage_and_error_counts,now,full_app_id_supported);
            }

            // let policyTableUpdateResult = policyTableUpdatePromise;

            let success = true;

            let result = {
                success,
            };

            return result;
        }
        catch (e)
        {
            //failed to update for some reason.
            //catching database errors. cannot connect race condition etc.
            reportingService.logger.error(e);
            return {
                success: false,
                error: e.message
            }
        }

    },
    getExpireDate: function()
    {
        return moment().subtract(reportingService.expirationDays,'days').toDate();
    },
    getCountJson: function(rows)
    {
        let json = {};

        for (let row of rows)
        {
            json[row.name] = +row.count;
        }
        return json;
    },
    //TODO use callback instead

    getTotalDeviceModels: async function(expireDate)
    {
        expireDate = expireDate || reportingService.getExpireDate();
        let {rows} = await reportingService.doQuery(
          {
              text: `select count(id) AS count,hardware AS name from device where updated_ts > $1 group by hardware`,
              values: [expireDate]
          });
        return reportingService.getCountJson(rows);
    },
    //TODO use callback instead
    getTotalDeviceCarrier: async function(expireDate)
    {
        expireDate = expireDate || reportingService.getExpireDate();
        let {rows} = await reportingService.doQuery(
          {
              text: `select count(id) AS count,carrier AS name from device where updated_ts > $1 group by carrier`,
              values: [expireDate]
          });
        return reportingService.getCountJson(rows);

    },
    //TODO use callback instead
    getTotalDeviceOs: async function(expireDate)
    {
        expireDate = expireDate || reportingService.getExpireDate();
        let {rows} = await reportingService.doQuery(
          {
              text: `select count(id) AS count,os AS name from device where updated_ts > $1 group by os`,
              values: [expireDate]
          });
        return reportingService.getCountJson(rows);

    },
    //TODO use callback instead
    getPolicyTableUpdatesByTrigger: function(expireDate,cb)
    {
        let result = {};

        expireDate = expireDate || reportingService.getExpireDate();

        //        .orderBy('ast.service_type_name ASC')
//         let {rows} = await reportingService.doQuery(
//           {
//               text: `select trigger_event,to_char(created_ts, 'YYYY-MM-DD') created\t from policy_table_update_request
// where updated_ts > $1
// order by created_ts
// ;`,
//               values: [expireDate]
//           });

        let query = bricks.select(`trigger_event`,
          `to_char(created_ts, 'YYYY-MM-DD') created`
          ).from(`policy_table_update_request`).where(bricks.gt(`updated_ts`,expireDate)).orderBy(`created_ts`);

        reportingService.sqlCommand(query,function(error,rows) {
            for (let row of rows)
            {
                let {trigger_event,created} = row;

                if (!result[created])
                {
                    result[created] = {
                    }
                }
                result[created][trigger_event] = result[created][trigger_event] ? result[created][trigger_event]++ : 1;
                cb(result);
            }
        })
    },
    getPolicyTableUpdatesByTriggerTotal: async function(expireDate,cb)
    {
        expireDate = expireDate || reportingService.getExpireDate();
        let {rows} = await reportingService.doQuery(
          {
              text: `select trigger_event,count(id) AS count  from policy_table_update_request
where updated_ts > $1
group by trigger_event
;`,
              values: [expireDate]
          });

        let result = {};

        for (let row of rows)
        {
            let {trigger_event,count} = row;
            result[trigger_event] = count;
        }


        cb(result);

        return result;

    },
    getAppUsageTimeHistory: function(id,cb)
    {
        let expireDate = reportingService.getExpireDate()
        let slqCommand = bricks.select(
          `app_id`,
          `count_of_user_selections`,
          `count_of_rejected_rpc_calls`,
          `minutes_in_hmi_background`,
          `minutes_in_hmi_full`,
          `minutes_in_hmi_limited`,
          `minutes_in_hmi_none`,
          `to_char(created_ts, 'YYYY-MM-DD') created`
        ).from(`app_usage`).where(
          bricks.and(
            bricks.eq('app_id', id),
            bricks.gt('updated_ts', expireDate)
          )
        );

        reportingService.sqlCommand(slqCommand, function(error,rows) {

            let rejected_rpcs_history = {};
            let usage_time_history = {};
            let user_selection_history = {};

            if (rows.length === 0)
            {
                return {}
            }


            for (let row of rows)
            {
                let {  count_of_user_selections,
                    count_of_rejected_rpc_calls,
                    minutes_in_hmi_background,
                    minutes_in_hmi_full,
                    minutes_in_hmi_limited,
                    minutes_in_hmi_none,created} = row;

                if (count_of_user_selections)
                {
                    if (!user_selection_history[created])
                    {
                        user_selection_history[created] = {
                        }
                    }
                    user_selection_history[created][`count_of_user_selections`] = user_selection_history[created][`count_of_user_selections`] ? user_selection_history[created][`count_of_user_selections`] + count_of_user_selections  : count_of_user_selections;
                }


                if (count_of_rejected_rpc_calls)
                {
                    if (!rejected_rpcs_history[created])
                    {
                        rejected_rpcs_history[created] = {
                        }
                    }
                    rejected_rpcs_history[created][`count_of_rejected_rpcs_calls`] = rejected_rpcs_history[created][`count_of_rejected_rpcs_calls`] ? rejected_rpcs_history[created][`count_of_rejected_rpcs_calls`] + count_of_rejected_rpc_calls  : count_of_rejected_rpc_calls;
                }

                for (let hmi_key of ['minutes_in_hmi_background','minutes_in_hmi_full','minutes_in_hmi_limited','minutes_in_hmi_none'])
                {
                    if (row[hmi_key] !== undefined)
                    {
                        if (!usage_time_history[created])
                        {
                            usage_time_history[created] = {
                            }
                        }
                        usage_time_history[created][hmi_key] = usage_time_history[created][hmi_key] ? usage_time_history[created][hmi_key] + row[hmi_key]  : row[hmi_key];
                    }
                }

            }


            cb({
                rejected_rpcs_history,
                usage_time_history,
                user_selection_history,
            });
        });


    },
    getAppUsageReport: function(appId,cb)
    {

        try {

            let query = bricks.select(`id`,`name`).from(`app_info`).where({id:appId});

            reportingService.sqlCommand(query,function(error,rows) {
                let application = rows[0];

                reportingService.getAppUsageTimeHistory(appId,function( {usage_time_history,user_selection_history,rejected_rpcs_history} ) {
                    cb({
                        application,
                        //Number of daily PTUs during the retention period, stacked by the triggering event (miles, days, ignition cycles)
                        report_days: reportingService.expirationDays,
                        usage_time_history,
                        user_selection_history,
                        rejected_rpcs_history,
                    })
                });
            })
        }
        catch (e)
        {
            reportingService.logger.error(e.message);
            return {};
        }

    },
    getPolicyTableUpdatesReport: function(cb)
    {

        console.log(`getPolicyTableUpdatesReport`)
        reportingService.getPolicyTableUpdatesByTriggerTotal(undefined,function(total_policy_table_updates_by_trigger) {
            console.log(`getPolicyTableUpdatesReport`)

            reportingService.getPolicyTableUpdatesByTrigger(undefined,function(policy_table_updates_by_trigger) {
                console.log(`getPolicyTableUpdatesReport`)

                cb({
                    policy_table_updates_by_trigger,
                    total_policy_table_updates_by_trigger
                });
            });
        });




    },
    getDeviceReport: async function()
    {
        let expireDate = reportingService.getExpireDate();
        let total_device_carrier = await reportingService.getTotalDeviceCarrier(expireDate);
        let total_device_model = await reportingService.getTotalDeviceModels(expireDate);
        let total_device_os = await reportingService.getTotalDeviceOs(expireDate);
        return {
            total_device_carrier,
            total_device_model,
            total_device_os
        }
    },
    sqlCommand: function(query,cb)
    {
        if (!cb)
        {
            try {
                throw new Error(`cb not defined`);
            }
            catch (e)
            {
                console.error(e);
            }
        }
        return db.sqlCommand(query,cb);
        // let longQueryTime = 1;
        // let t1 = Date.now();
        // let db = reportingService.db;
        // return new Promise((resolve,reject) => {
        //     db.sqlCommand(query,(error,rows) => {
        //         cb(error,rows);
        //         //TODO remove bellow
        //
        //         // let t2 = Date.now();
        //         // let d1 = t2 - t1;
        //         // if (d1 > longQueryTime)
        //         // {
        //         //     reportingService.logger.warn(`Long query time ${query.text} ${JSON.stringify(query.values)} ${d1} (ms)`)
        //         // }
        //         // if (error)
        //         // {
        //         //     //TODO remove log and exit.
        //         //     console.error(error);
        //         //     process.exit(1);
        //         //     reject(error);
        //         // }
        //         // else {
        //         //     resolve({
        //         //         error,
        //         //         rows
        //         //     })
        //         // }
        //
        //     })
        // })
    },
    doQuery: async function(query)
    {
        let longQueryTime = 1;
        let t1 = Date.now();
        let db = reportingService.db;
        return new Promise((resolve,reject) => {
            db.doQuery(query,(error,rows) => {

                // db.doQuery(query,(error,rows) => {
                let t2 = Date.now();
                let d1 = t2 - t1;
                if (d1 > longQueryTime)
                {
                    reportingService.logger.warn(`Long query time ${query.text} ${JSON.stringify(query.values)} ${d1} (ms)`)
                }
                if (error)
                {
                    console.error(`reporting-service error`,error);
                    reject(error);
                }
                else {
                    resolve({
                        error,
                        rows
                    })
                }

            })
        })
    }

};



module.exports = function(config)
{
    reportingService.config = config;

    db = reportingService.db = reportingService.config.db;
    if (!config || !config.db)
    {
        throw new Error(`Config with db implementing sqlCommand required`);
    }
    reportingService.logger = config.logger || console;

    reportingService.lastPurge = 0;
    reportingService.expirationDays = reportingService.config.expirationDays || 30;
    reportingService.trackingEnabled = reportingService.config.trackingEnabled === undefined ? true : reportingService.config.trackingEnabled;

    return reportingService;
};

