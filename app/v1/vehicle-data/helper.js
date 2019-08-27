//Copyright (c) 2018, Livio, Inc.
const check = require('check-types');
const model = require('./model.js');
const app = require('../app');
const flow = app.locals.flow;
const setupSql = app.locals.db.setupSqlCommand;
const sql = require('./sql.js');
const parseXml = require('xml2js').parseString;
const needle = require('needle');

//validation functions

function validatePost(req, res) {
    //coerce to a number first. NOTE: empty string is coerced to 0
    // req.body.exchange_after_x_ignition_cycles -= 0;
    // req.body.exchange_after_x_kilometers -= 0;
    // req.body.exchange_after_x_days -= 0;
    // req.body.timeout_after_x_seconds -= 0;
    //
    // if (!check.number(req.body.exchange_after_x_ignition_cycles)) {
    //     return setError("exchange_after_x_ignition_cycles required");
    // }
    // if (!check.number(req.body.exchange_after_x_kilometers)) {
    //     return setError("exchange_after_x_kilometers required");
    // }
    // if (!check.number(req.body.exchange_after_x_days)) {
    //     return setError("exchange_after_x_days required");
    // }
    // if (!check.number(req.body.timeout_after_x_seconds)) {
    //     return setError("timeout_after_x_seconds required");
    // }
    // if (!check.array(req.body.seconds_between_retries)) {
    //     return setError("seconds_between_retries required");
    // }
    // for (let i = 0; i < req.body.seconds_between_retries.length; i++) {
    //     req.body.seconds_between_retries[i] -= 0;
    //     if (!check.number(req.body.seconds_between_retries[i])) {
    //         return setError(req.body.seconds_between_retries[i] + " is not a number");
    //     }
    // }
    // if (!req.body.endpoints) {
    //     return setError("endpoints object required");
    // }
    // if (!req.body.endpoints["0x04"]) {
    //     return setError("0x04 endpoint required");
    // }
    // if (!req.body.endpoints.queryAppsUrl) {
    //     return setError("queryAppsUrl endpoint required");
    // }
    // if (!req.body.endpoints.lock_screen_icon_url) {
    //     return setError("lock_screen_icon_url endpoint required");
    // }
    // if (!req.body.notifications_per_minute_by_priority) {
    //     return setError("notifications_per_minute_by_priority object required");
    // }
    // req.body.notifications_per_minute_by_priority.EMERGENCY -= 0;
    // req.body.notifications_per_minute_by_priority.NAVIGATION -= 0;
    // req.body.notifications_per_minute_by_priority.VOICECOM -= 0;
    // req.body.notifications_per_minute_by_priority.COMMUNICATION -= 0;
    // req.body.notifications_per_minute_by_priority.NORMAL -= 0;
    // req.body.notifications_per_minute_by_priority.NONE -= 0;
    // if (!check.number(req.body.notifications_per_minute_by_priority.EMERGENCY)) {
    //     return setError("EMERGENCY notification count required");
    // }
    // if (!check.number(req.body.notifications_per_minute_by_priority.NAVIGATION)) {
    //     return setError("NAVIGATION notification count required");
    // }
    // if (!check.number(req.body.notifications_per_minute_by_priority.VOICECOM)) {
    //     return setError("VOICECOM notification count required");
    // }
    // if (!check.number(req.body.notifications_per_minute_by_priority.COMMUNICATION)) {
    //     return setError("COMMUNICATION notification count required");
    // }
    // if (!check.number(req.body.notifications_per_minute_by_priority.NORMAL)) {
    //     return setError("NORMAL notification count required");
    // }
    // if (!check.number(req.body.notifications_per_minute_by_priority.NONE)) {
    //     return setError("NONE notification count required");
    // }
    return;

    function setError(msg) {
        res.parcel.setStatus(400).setMessage(msg);
    }
}



function getRpcSpec (next) {
    //use the url from the settings.js file
    needle.get(app.locals.config.githubLanguageSourceUrl, function (err, res) {
        next(err, res.body);
    });
}

function extractParams (rpcSpec, next) {
    const getVehicleDataResponse = rpcSpec.interface.function.find(function (elem) {
        return elem['$'].name === "GetVehicleData" && elem['$'].messagetype === "request";
    });
    console.log(`extractParams`,getVehicleDataResponse);
    const params = getVehicleDataResponse.param
    //     .find(function (elem) {
    //     return elem['$'].name === "Language";
    // })
        .map(function (param) {
        return param['$'].name;
    });
    console.log(`extractParams`,params);
    next(null, params);
}


function extractEnums (rpcSpec, next) {
    // const getVehicleDataResponse = rpcSpec.interface.enum.find(function (elem) {
    //     return elem['$'].name === "GetVehicleData" && elem['$'].messagetype === "request";
    // });
    // console.log(`extractParams`,getVehicleDataResponse);
    // const params = getVehicleDataResponse.param
    // //     .find(function (elem) {
    // //     return elem['$'].name === "Language";
    // // })
    //     .map(function (param) {
    //         return param['$'].name;
    //     });
    const enums = rpcSpec.interface.enum.map(function (elem) {
        return elem['$'].name;
    });
    console.log(`enums`,enums);
    next(null, enums);
}

/**
 *
 */
function updateVehicleDataEnums(next) {
    const messageStoreFlow = [
        getRpcSpec,
        parseXml,
        extractEnums,
        insertVehicleDataEnums
    ];

    function insertVehicleDataEnums(params, next) {
        app.locals.flow(app.locals.db.setupSqlCommands(sql.insert.vehicleDataEnums(params)), { method: 'parallel' })(next);
    }

    app.locals.flow(messageStoreFlow, { method: 'waterfall', eventLoop: true })(function(err, res) {
        if (err) {
            app.locals.log.error(err);
        }
        if (next) {
            next(); //done
        }
    });
}


/**
 *
 */
function updateVehicleDataReservedParams(next) {
    const messageStoreFlow = [
        getRpcSpec,
        parseXml,
        extractParams,
        insertVehicleDataReservedParams
    ];

    function insertVehicleDataReservedParams(params, next) {
        app.locals.flow(app.locals.db.setupSqlCommands(sql.insert.vehicleDataReservedParams(params)), { method: 'parallel' })(next);
    }

    app.locals.flow(messageStoreFlow, { method: 'waterfall', eventLoop: true })(function(err, res) {
        if (err) {
            app.locals.log.error(err);
        }
        if (next) {
            next(); //done
        }
    });
}

module.exports = {
    validatePost: validatePost,
    updateVehicleDataReservedParams: updateVehicleDataReservedParams,
    updateVehicleDataEnums: updateVehicleDataEnums,
};
