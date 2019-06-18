//Copyright (c) 2018, Livio, Inc.
const check = require('check-types');
const model = require('./model.js');
const app = require('../app');
const flow = app.locals.flow;
const setupSql = app.locals.db.setupSqlCommand;
const sql = require('./sql.js');
const moment = require('moment');

//validation functions

function validatePost (req, res) {
    //coerce to a number first. NOTE: empty string is coerced to 0
    req.body.exchange_after_x_ignition_cycles -= 0;
    req.body.exchange_after_x_kilometers -= 0;
    req.body.exchange_after_x_days -= 0;
    req.body.timeout_after_x_seconds -= 0;

    if (!check.number(req.body.exchange_after_x_ignition_cycles)) {
        return setError("exchange_after_x_ignition_cycles required");
    }
    if (!check.number(req.body.exchange_after_x_kilometers)) {
        return setError("exchange_after_x_kilometers required");
    }
    if (!check.number(req.body.exchange_after_x_days)) {
        return setError("exchange_after_x_days required");
    }
    if (!check.number(req.body.timeout_after_x_seconds)) {
        return setError("timeout_after_x_seconds required");
    }
    if (!check.array(req.body.seconds_between_retries)) {
        return setError("seconds_between_retries required");
    }
    for (let i = 0; i < req.body.seconds_between_retries.length; i++) {
        req.body.seconds_between_retries[i] -= 0;
        if (!check.number(req.body.seconds_between_retries[i])) {
            return setError(req.body.seconds_between_retries[i] + " is not a number");
        }
    }
    if (!req.body.endpoints) {
        return setError("endpoints object required");
    }
    if (!req.body.endpoints["0x04"]) {
        return setError("0x04 endpoint required");
    }
    if (!req.body.endpoints.queryAppsUrl) {
        return setError("queryAppsUrl endpoint required");
    }
    if (!req.body.endpoints.lock_screen_icon_url) {
        return setError("lock_screen_icon_url endpoint required");
    }
    if (!req.body.notifications_per_minute_by_priority) {
        return setError("notifications_per_minute_by_priority object required");
    }
    req.body.notifications_per_minute_by_priority.EMERGENCY -= 0;
    req.body.notifications_per_minute_by_priority.NAVIGATION -= 0;
    req.body.notifications_per_minute_by_priority.VOICECOM -= 0;
    req.body.notifications_per_minute_by_priority.COMMUNICATION -= 0;
    req.body.notifications_per_minute_by_priority.NORMAL -= 0;
    req.body.notifications_per_minute_by_priority.NONE -= 0;
    if (!check.number(req.body.notifications_per_minute_by_priority.EMERGENCY)) {
        return setError("EMERGENCY notification count required");
    }
    if (!check.number(req.body.notifications_per_minute_by_priority.NAVIGATION)) {
        return setError("NAVIGATION notification count required");
    }
    if (!check.number(req.body.notifications_per_minute_by_priority.VOICECOM)) {
        return setError("VOICECOM notification count required");
    }
    if (!check.number(req.body.notifications_per_minute_by_priority.COMMUNICATION)) {
        return setError("COMMUNICATION notification count required");
    }
    if (!check.number(req.body.notifications_per_minute_by_priority.NORMAL)) {
        return setError("NORMAL notification count required");
    }
    if (!check.number(req.body.notifications_per_minute_by_priority.NONE)) {
        return setError("NONE notification count required");
    }
    return;

    function setError (msg) {
        res.parcel.setStatus(400).setMessage(msg);
    }
}

//helper functions

function getModuleConfigFlow (property, value) {
    const getInfoFlow = app.locals.flow({
        base: setupSql.bind(null, sql.moduleConfig[property](value)),
        retrySeconds: setupSql.bind(null, sql.retrySeconds[property](value))
    }, {method: 'parallel'});

    return app.locals.flow([
        getInfoFlow,
        model.transformModuleConfig
    ], {method: 'waterfall', eventLoop: true});
}

function generateTestPolicyTableUpdateHistory()
{
    let ptu_history = [];
    let date = moment().subtract(30,'days');

    // let report_days = 30;
    let report_days = 90;

    for (let i = 0; i < report_days; i++)
    {
        if (i % 9 === 0)
        {
            continue;
            // ptu_history.push({
            //     created_date: reportDate,
            //     update_type: 'days',
            // });
        }
        let reportDate = moment(date).add(i,'days');


        ptu_history.push({
            created_date: reportDate,
            update_type: 'days',
        });

        ptu_history.push({
            created_date: reportDate,
            update_type: 'mileage',
        });

        ptu_history.push({
            created_date: reportDate,
            update_type: 'ignition_cycle',
        });


        ptu_history.push({
            created_date: reportDate,
            update_type: 'mileage',
        });



        if (i % 2 === 0)
        {
            ptu_history.push({
                created_date: reportDate,
                update_type: 'mileage',
            });
        }

        if (i % 3 === 0)
        {
            ptu_history.push({
                created_date: reportDate,
                update_type: 'days',
            });
        }

    }

    return ptu_history;

}

function getPolicyTableUpdatesByTrigger(ptu_history)
{
    let result = {

    };
    for (let history of ptu_history)
    {
        let {update_type,created_date} = history;

        created_date = moment(created_date).format('YYYY-MM-DD');

        if (!result[created_date])
        {
            result[created_date] = {};
        }

        if (!result[created_date][update_type])
        {
            result[created_date][update_type] = 0;
        }
        result[created_date][update_type]++;
    }
    return result;


}


function getTotalPolicyUpdatesByTrigger(ptu_history)
{
    let result = {

    };
    for (let history of ptu_history)
    {
        let {update_type} = history;

        if (!result[update_type])
        {
            result[update_type] = 0;
        }
        result[update_type]++;
    }
    return result;
}

async function getAggregateReport()
{

    let policy_table_update_history = generateTestPolicyTableUpdateHistory();

    let policy_table_updates_by_trigger = getPolicyTableUpdatesByTrigger(policy_table_update_history);

    let total_policy_table_updates_by_trigger = getTotalPolicyUpdatesByTrigger(policy_table_update_history);

    let obj = {
        //Number of daily PTUs during the retention period, stacked by the triggering event (miles, days, ignition cycles)
        report_days: 30,
        policy_table_update_history,
        policy_table_updates_by_trigger,
        total_policy_table_updates_by_trigger,
        total_device_model: { //totals by model
            "iPhone 8": 10,
            "Nexus 7": 5,
            "unknown": 1,
            "Nexus 1": 5,
            "Nexus 2": 5,
            "Nexus 3": 5,
            "Nexus 4": 5,
            "Nexus 5": 5,
            "Nexus 6": 5,
            "Liquid Zest": 5,
            "Liquid Jade Z": 5,
            "Liquid Jade X": 5,
            "Small 1": 1,
            "Small 2": 1,
            "Small 3": 1,
            "Small 4": 1,
            "Small 5": 1,
            "Small 6": 1,
            "Small 7": 1,
            "Small 8": 1,
            "Small 9": 1,
            "Small 10": 1,
        },
        total_device_os: {
            "Android": 5,
            "iOS": 10
        },
        total_device_carrier: {
            "Verizon": 5,
            "Sprint": 10,
            'T-Mobile': 2,
            "Appalachian Wireless": 5,
            // "Small 1": 1,
            // "Small 2": 1,
            // "Small 3": 1,
            // "Small 4": 1,
            // "Small 5": 1,
            // "Small 6": 1,
            // "Small 7": 1,
            // "Small 8": 1,
            // "Small 9": 1,
            // "Small 10": 1,

            // "Ting": 2,
            // "1": 1,
            // "2": 1,
            // "3": 1,
            // "4": 1,
            // "5": 1,
            // "6": 1,

        },
        // app_opens: { //app level

        // },
        rejected_rpcs: { //Aggregate count of rejected RPCs, over the retention period
            unknown: 10,
            getTires: 10
        },

    };


    for (let i = 0; i < 10; i++)
    {
        obj.total_device_carrier[`Carrier ${i + 1}`] = 1;
    }

    return obj;
}

module.exports = {
    getAggregateReport: getAggregateReport,
    validatePost: validatePost,
    getModuleConfigFlow: getModuleConfigFlow
}