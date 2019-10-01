//Copyright (c) 2019, Livio, Inc.
const app = require('../app');
const sql = require('./sql.js');
const parseXml = require('xml2js').parseString;
const request = require('request');
const async = require('async');

function validatePost(req, res) {
}

function getRpcSpec(next) {
    request(
        {
            method: 'GET',
            url: app.locals.config.githubLanguageSourceUrl
        }, function(err, res, body) {
            next(err, body);
        });
}

function extractParams(rpcSpec, next) {
    const getVehicleDataResponse = rpcSpec.interface.function.find(function(elem) {
        return elem['$'].name === 'GetVehicleData' && elem['$'].messagetype === 'request';
    });
    const params = getVehicleDataResponse.param
        .map(function(param) {
            return param['$'].name;
        });
    next(null, params);
}

function extractEnums(rpcSpec, next) {
    const enums = rpcSpec.interface.enum.map(function(elem) {
        return elem['$'].name;
    });
    next(null, enums);
}

function extractRpc(rpcSpec, next) {
    //<interface name="SmartDeviceLink RAPI" version="6.0.0" minVersion="1.0" date="2019-03-19">
    // "version" TEXT NOT NULL,
    // "min_version" TEXT,
    // "date" TEXT,
    let spec = {
        version: rpcSpec.interface.$.version,
        min_version: rpcSpec.interface.$.minVersion,
        date: rpcSpec.interface.$.date
    };

    // const enums = rpcSpec.interface.enum.map(function(elem) {
    //     return elem['$'].name;
    // });
    next(null, spec);
}

function updateRpcSpec(next) {

    app.locals.db.runAsTransaction(function(client, callback) {
        async.waterfall([
                            function(callback) {
                                callback(null, 1);
                                // client.getOne(sql.getApp.base['uuidFilter'](req.body.uuid), callback);
                            },
                            function(rpcId, callback) {
                                console.log(`rpcId`, rpcId);
                                callback(null);
                            }
                            // function(result, callback) {
                            //     client.getOne(sql.insertHybridPreference(req.body), callback);
                            // }
                        ], callback);
    }, function(err, response) {
        console.log({ err, response });
        next();
    });

}

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
    updateRpcSpec: updateRpcSpec,
};
