const moment = require('moment');

//replace async await pattern with

//sdl_server/custom/databases/postgres/index.js

//async.waterfall

let reportingService = {
    upsert: function(table,data,now)
    {
        now = now || new Date();
        data.updated_ts = data.updated_ts || now;
        let updateData = Object.assign({},data);
        let id = updateData.id;
        delete updateData.id;

        data.created_ts = data.created_ts || now;
        let insertData = Object.assign({},data);

        let value_params = [];


        let values = [];
        let columns = [];
        for (let column in insertData)
        {
            let value = data[column];

            columns.push(column);
            values.push(value);
            value_params.push(`$${value_params.length+1}`);


        }


        data.updated_ts = data.updated_ts || now;
        let setColumns = [];
        let param_count = value_params.length;
        for (let column in updateData)
        {
            let value = data[column];
            param_count++;
            setColumns.push(`${column} = $${param_count}`);
            values.push(value);
        }

        let text = `INSERT INTO ${table}(${columns.join(',')}) VALUES (${value_params.join(',')})
    ON CONFLICT (id) 
    DO
        UPDATE 
        SET ${setColumns.join(',')}
`;

        return reportingService.doQuery({
            text,
            values
        });

    },
    //TODO use callback instead
    update: async function(table,data,now)
    {
        now = now || new Date();
        data.updated_ts = data.updated_ts || now;

        let id = data.id;
        delete data.id;

        let values = [];
        let columns = [];
        let param_count = 0;
        for (let column in data)
        {
            let value = data[column];

            param_count++;
            columns.push(`${column} = $${param_count}`);
            values.push(value);


        }

        param_count++;
        values.push(id);
        let text = `UPDATE ${table} SET ${columns.join(',')} WHERE id = $${param_count}`;


        return reportingService.doQuery({
            text,
            values
        })



    },
    insert:  function(table,data,now)
    {
        now = now || new Date();
        data.created_ts = data.created_ts || now;
        data.updated_ts = data.updated_ts || now;

        let value_params = [];


        let values = [];
        let columns = [];
        for (let column in data)
        {
            let value = data[column];

            columns.push(column);
            values.push(value);
            value_params.push(`$${value_params.length+1}`);


        }

        let text = `INSERT INTO ${table}(${columns.join(',')}) VALUES (${value_params.join(',')})`;

        return reportingService.doQuery({
            text,
            values
        })

    },
    insertUpdateRecordById: function(table,data,now)
    {
        return reportingService.upsert(table,data,now);
    },
    //TODO use callback instead
     updateDeviceData: async function(deviceData,now)
    {
        if (!deviceData)
        {
            return;
        }
        // try {
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
        // }
        //TODO better data validation instead of try catch?
        // catch (e)
        // {
        //     reportingService.logger.error(`Failed to update deviceData ${JSON.stringify(deviceData)}`);
        //     throw e;
        // }


    },

    removeOldAppUsageRequests: function()
    {
        let expiration = moment().subtract(reportingService.expirationDays,'days').toDate();
        let result = reportingService.doQuery({
            text: `DELETE FROM app_usage where updated_ts < $1`,
            values: [expiration]
        });

        return result;
    },
    //TODO use callback instead

    removeOldPolicyTableUpdateRequests: async function()
    {
        let expiration = moment().subtract(reportingService.expirationDays,'days').toDate();
        let result = await reportingService.doQuery({
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

    purgeOldRecords: async function()
    {
        let checkOldDataInterval = 5 *  60 * 1000;
        if ((Date.now() - reportingService.lastPurge) > checkOldDataInterval)
        {
            return;
        }
        await reportingService.removeOldDeviceData();
        await reportingService.removeOldPolicyTableUpdateRequests();
        await reportingService.removeOldAppUsageRequests();

        reportingService.lastPurge = Date.now();
    },
    updateUsageAndErrorCounts: async function(usage_and_error_counts,now,full_app_id_supported)
    {
        if (!usage_and_error_counts)
        {
            return;
        }
        if (usage_and_error_counts.app_level)
        {
            await reportingService.updateAppLevelUsageAndErrorCounts(usage_and_error_counts.app_level,now,full_app_id_supported);

        }
    },
    //TODO use callback instead
    findOne: async function(query)
    {
        let {rows} = await reportingService.doQuery(query);


        if (!rows || rows.length !== 1)
        {
            if (rows.length === 0)
            {
                throw new Error(`No records found using query ${JSON.stringify(query)}`);
            }
            else {
                throw new Error(`Multiple records found using query ${JSON.stringify(query)}`);

            }
        }
        return rows[0];


    },
    //TODO use callback instead
    appUsageInsert: async function(app_id,obj,now)
    {
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
            minutes_in_hmi_none
        }

        let result = await reportingService.insert(`app_usage`,data,now);

        return result;
    },
    //TODO use callback instead
    //TODO remove all try catch
    updateAppLevelUsageAndErrorCounts: async function(app_level,now,full_app_id_supported)
    {
        let uuid_column = full_app_id_supported ? `app_uuid` : `app_short_uuid`;

        for (let uuid in app_level)
        {
            try {
                let query = {
                    text: `select id from app_info where ${uuid_column} = $1`,
                    values: [uuid]
                }
                let application = await reportingService.findOne(query);
                await reportingService.appUsageInsert(application.id,app_level[uuid],now);
            }
            catch (e)
            {
                reportingService.logger.warn(e.message);
            }
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
    updatePolicyTableUpdateRequests: async function(policyTableObject,now)
    {
        let trigger_event;
        try {
            trigger_event = reportingService.getTriggerEventFromPolicyTableObject(policyTableObject,now);
        }
        catch (e)
        {
            trigger_event = 'UNKNOWN';
        }
        let data = {trigger_event};
        let result = await reportingService.insert(`policy_table_update_request`,data,now);


        return result;

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

            await reportingService.purgeOldRecords();

            let policyTableUpdatePromise = reportingService.updatePolicyTableUpdateRequests(policyTableObject,now);
            if (policyTableObject.device_data)
            {
                await reportingService.updateDeviceData(policyTableObject.device_data,now);
            }

            if (policyTableObject.usage_and_error_counts)
            {
                await reportingService.updateUsageAndErrorCounts(policyTableObject.usage_and_error_counts,now,full_app_id_supported);
            }

            let policyTableUpdateResult = await policyTableUpdatePromise;

            let success = true;

            let result = {
                success,
            };

            return result;
        }
        catch (e)
        {
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
    getPolicyTableUpdatesByTrigger: async function(expireDate)
    {
        expireDate = expireDate || reportingService.getExpireDate();
        let {rows} = await reportingService.doQuery(
          {
              text: `select trigger_event,to_char(created_ts, 'YYYY-MM-DD') created\t from policy_table_update_request
where updated_ts > $1
order by created_ts   
;`,
              values: [expireDate]
          });

        let result = {};

        for (let row of rows)
        {
            let {trigger_event,created} = row;

            if (!result[created])
            {
                result[created] = {
                }
            }
            result[created][trigger_event] = result[created][trigger_event] ? result[created][trigger_event]++ : 1;
        }


        return result;

    },
    getPolicyTableUpdatesByTriggerTotal: async function(expireDate)
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


        return result;

    },
    getAppUsageTimeHistory: async function(id)
    {
        let expireDate = reportingService.getExpireDate();
        let {rows} = await reportingService.doQuery(
          {
              text: `
select
  app_id,
  count_of_user_selections,
  count_of_rejected_rpc_calls,
  minutes_in_hmi_background,
  minutes_in_hmi_full,
  minutes_in_hmi_limited,
  minutes_in_hmi_none,
  to_char(created_ts, 'YYYY-MM-DD') created
from app_usage
where updated_ts > $1
and app_id = $2
order by created_ts   
;`,
              values: [expireDate,id]
          });

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


        return {
            rejected_rpcs_history,
            usage_time_history,
            user_selection_history,
        }

    },
    getAppUsageReport: async function(appId)
    {

        try {
            let application = await reportingService.findOne({
                text: `select id,name from app_info where id = $1`,
                values: [appId]
            });


            let {usage_time_history,user_selection_history,rejected_rpcs_history} = await reportingService.getAppUsageTimeHistory(appId);


            return {
                application,
                //Number of daily PTUs during the retention period, stacked by the triggering event (miles, days, ignition cycles)
                report_days: reportingService.expirationDays,
                usage_time_history,
                user_selection_history,
                rejected_rpcs_history,
            }
        }
        catch (e)
        {
            reportingService.logger.error(e.message);
            return {};
        }

    },
    getPolicyTableUpdatesReport: async function()
    {

        let policy_table_updates_by_trigger = await reportingService.getPolicyTableUpdatesByTrigger();
        let total_policy_table_updates_by_trigger = await reportingService.getPolicyTableUpdatesByTriggerTotal();

        return {

            policy_table_updates_by_trigger,
            total_policy_table_updates_by_trigger
        }
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
    doQuery: async function(query)
    {
        let longQueryTime = 1;
        let t1 = Date.now();
        let db = reportingService.db;
        return new Promise((resolve,reject) => {
            db.doQuery(query,(error,rows) => {
                let t2 = Date.now();
                let d1 = t2 - t1;
                if (d1 > longQueryTime)
                {
                    reportingService.logger.warn(`Long query time ${query.text} ${JSON.stringify(query.values)} ${d1} (ms)`)
                }
                if (error)
                {
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

    reportingService.db = reportingService.config.db;
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
