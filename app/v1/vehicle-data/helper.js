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

function extractRpc(data, next) {
    console.log(`extractRpc`);
    //<interface name="SmartDeviceLink RAPI" version="6.0.0" minVersion="1.0" date="2019-03-19">
    // "version" TEXT NOT NULL,
    // "min_version" TEXT,
    // "date" TEXT,
    let spec = {
        version: data.xml.interface.$.version,
        min_version: data.xml.interface.$.minVersion,
        date: data.xml.interface.$.date
    };

    data.rpcSpec = spec;

    // const enums = rpcSpec.interface.enum.map(function(elem) {
    //     return elem['$'].name;
    // });
    next(null, data);
}

// "id" SERIAL NOT NULL,
//     "rpc_spec_id" INTEGER NOT NULL REFERENCES rpc_spec (id) ON UPDATE CASCADE ON DELETE CASCADE,
//     "element_type" TEXT NOT NULL, -- ENUM, STRUCT, FUNCTION
// "name" TEXT NOT NULL,
//     "since" TEXT,
//     "until" TEXT,
//     "deprecated" TEXT,
//     "removed" TEXT,
//     "internal_scope" TEXT,
//     "platform" TEXT,
//     "function_id" TEXT, -- actually functionID
// "message_type" TEXT, -- actually messagetype

//loop function and structs.
function extractRpcSpecTypes(data, next) {
    // let keys = ['since','until','deprecated','removed','internal_scope','functionID','messagetype'];
    let mapping = {
        'name': 'name',
        'since': 'since',
        'until': 'until',
        'deprecated': 'deprecated',
        'removed': 'removed',
        'internal_scope': 'internal_scope',
        'functionID': 'function_id',
        'messagetype': 'message_type'
    };


    //     "name" TEXT NOT NULL,
//     "type" TEXT,
//     "internal_name" TEXT,
//     "root_screen" TEXT, -- actually rootscreen
//      "mandatory" TEXT,
//     "since" TEXT,
//     "until" TEXT,
//     "deprecated" TEXT,
//     "removed" TEXT,
//     "value" TEXT,
//     "hex_value" TEXT, -- actually hexvalue
// "min_length" TEXT, -- actually minlength
// "max_length" TEXT, -- actually maxlength
// "min_size" TEXT, -- actually minsize
// "max_size" TEXT, -- actually maxsize
// "min_value" TEXT, -- actually minvalue
// "max_value" TEXT, -- actually maxvalue
// "array" TEXT,
//     "platform" TEXT,
//     "def_value" TEXT, -- actually defvalue
    let paramMapping = {
        'name': 'name',
        'type': 'type',
        'rootscreen': 'root_screen',
        'mandatory': 'mandatory',
        'since': 'since',
        'until': 'until',
        'deprecated': 'deprecated',
        'removed': 'removed',
        'value': 'value',
        'hex_value': 'hex_value',
        'min_length': 'hex_value',
        'max_length': 'hex_value',
        'min_size': 'hex_value',
        'max_size': 'hex_value',
        'min_value': 'hex_value',
        'max_value': 'hex_value',
        'array': 'array',
        'platform': 'platform',
        'defvalue': 'def_value',
    };
    console.log(`extractRpcSpecTypes`);
    //<interface name="SmartDeviceLink RAPI" version="6.0.0" minVersion="1.0" date="2019-03-19">
    // "version" TEXT NOT NULL,
    // "min_version" TEXT,
    // "date" TEXT,
    // let spec = {
    //     version: data.xml.interface.$.version,
    //     min_version: data.xml.interface.$.minVersion,
    //     date: data.xml.interface.$.date
    // };
    //
    // data.rpcSpec = spec;

    // const enums = rpcSpec.interface.enum.map(function(elem) {
    //     return elem['$'].name;
    // });

    let rpcSpecTypes = [];

    data.rpcSpecParams = [];

    let count = 0;
    //extract enums
    for (let enumeration of data.xml.interface.enum) {
        let enumData = {
            element_type: 'ENUM',
        };
        for (let key in mapping)
        {
            let dbName = mapping[key];
            console.log(`enumeration`,enumeration,key,dbName);
            enumData[mapping[key]] = enumeration.$[key];

        }
        console.log(`enumeration`,enumeration,enumData);

        // process.exit(1);

        rpcSpecTypes.push(
            enumData
        );

        for (let element of enumeration.element)
        {
            let param = {
                rpc_spec_type_name: enumData.name
            };

            for (let key in paramMapping)
            {
                let dbName = mapping[key];
                console.log(`enumeration`,element,key,dbName);
                param[mapping[key]] = element.$[key];
            }

            data.rpcSpecParams.push(param);



        }

        count++;
        if (count === 1)
        {
            break;
        }
        // break;

    }

    data.rpcSpecTypes = rpcSpecTypes;



    next(null, data);
}

function updateRpcSpec(next) {

    app.locals.db.runAsTransaction(function(client, callback) {
        async.waterfall(
            [
                getRpcSpec,
                function(rpcString,callback)
                {
                    parseXml(rpcString,function(err,xml) {
                        callback(err,{xml: xml})
                    })
                },
                extractRpc,
                extractRpcSpecTypes,
                function(data,callback) {
                    console.log(data);
                    let rpcSpec = data.rpcSpec;

                    //TODO remove
                    rpcSpec.version = Date.now() + "";

                    console.log(`insert spec`,rpcSpec);
                    client.getOne(sql.insert.rpcSpec(rpcSpec),function(err,result) {
                        console.log(`inserted`,err,result);
                        data.rpcSpecInsert = result;
                        callback(null,data);
                    })
                    // client.getOne(sql.getApp.base['uuidFilter'](req.body.uuid), callback);

                    // callback(null,{
                    //     rpcSpec: rpcSpec,
                    // });
                },
                function(data,callback) {
                    console.log(`insert rpc_spec_type`,data);
                    client.getMany(sql.insert.rpcSpecType(data.rpcSpecInsert.id,data.rpcSpecTypes),function(err,result) {
                        console.log(`inserted`,err,result);

                        //function, enum, and struct
                        //rpcSpecTypesByName populate

                        data.rpcSpecTypesByName = {};

                        for (let rpcSpecType of result)
                        {
                            data.rpcSpecTypesByName[rpcSpecType.name] = rpcSpecType;
                        }


                        // data.rpcSpecInsert = result;
                        callback(null,data);
                    });
                    // callback(null,data);
                    // client.getOne(sql.getApp.base['uuidFilter'](req.body.uuid), callback);
                },
                function(data, callback) {
                    // console.log(`rpcId`, rpcId);
                    // console.log(`insert rpc_spec_type`,data);
                    client.getOne(sql.insert.rpcSpecParam(data.rpcSpecParams,data.rpcSpecTypesByName),function(err,result) {
                        console.log(`inserted`,err,result);

                        // data.rpcSpecInsert = result;
                        callback(null,data);
                    });
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
