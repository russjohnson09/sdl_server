//Copyright (c) 2018, Livio, Inc.
const app = require('../app');
const helper = require('./helper.js');
const model = require('./model.js');
const flow = app.locals.flow;
const cache = require('../../../custom/cache');
const async = require('async');

function getVehicleDataReservedParams(req, res, next) {
    async.waterfall(
        [
            function(cb) {
                model.getVehicleDataReservedParams(cb);
            },
        ], function(err, reserved_params) {

            console.log(`got data`, reserved_params);

            if (err) {
                app.locals.log.error(err);
                return res.parcel
                    .setStatus(500)
                    .setMessage('Internal server error')
                    .deliver();
            }
            return res.parcel
                .setStatus(200)
                .setData({
                             reserved_params: reserved_params
                         })
                .deliver();
        });
}


function getVehicleDataEnums(req, res, next) {

}

function getVehicleDataParamTypes(req, res, next) {
    async.waterfall(
        [
            function(cb) {
                model.getVehicleDataParamTypes(cb);
            },
        ], function(err, vehicle_data_types) {

            console.log(`got data`, vehicle_data_types);

            if (err) {
                app.locals.log.error(err);
                return res.parcel
                    .setStatus(500)
                    .setMessage('Internal server error')
                    .deliver();
            }
            return res.parcel
                .setStatus(200)
                .setData({
                             vehicle_data_types: vehicle_data_types
                         })
                .deliver();
        });
}


function get(req, res, next) {
    //if environment is not of value "staging", then set the environment to production
    const isProduction = !req.query.environment || req.query.environment.toLowerCase() !== 'staging';

    console.log(`get start`);

    async.waterfall([
                        function(cb) {
                            model.getVehicleData(isProduction, cb);
                        },
                        // function(data, cb) {
                        //     console.log(`response step 2`, data);
                        //     cb(null, data);
                        // }
                    ], function(err, vehicle_data) {

        console.log(`got data`, vehicle_data);

        if (err) {
            app.locals.log.error(err);
            return res.parcel
                .setStatus(500)
                .setMessage('Internal server error')
                .deliver();
        }
        return res.parcel
            .setStatus(200)
            .setData({
                         vehicle_data: vehicle_data

                     })
            .deliver();
    });

    // let chosenFlow;
    //
    // if (req.query.id) { //get module config of a specific id
    // 	chosenFlow = helper.getModuleConfigFlow('id', req.query.id);
    // }
    // else { //get the most recent module config object
    // 	chosenFlow = helper.getModuleConfigFlow('status', isProduction);
    // }
    //
    // chosenFlow(function (err, data) {
    //     if (err) {
    //         app.locals.log.error(err);
    //         return res.parcel
    //             .setStatus(500)
    //             .setMessage("Internal server error")
    //             .deliver();
    //     }
    //     return res.parcel
    //         .setStatus(200)
    //         .setData({
    //             "module_configs": data
    //         })
    //         .deliver();
    // });
}

function post(isProduction, req, res, next) {
    helper.validatePost(req, res);
    if (res.parcel.message) {
        app.locals.log.error(res.parcel.message);
        return res.parcel.deliver();
    }

    model.insertVehicleData(isProduction, req.body, function(err) {
        if (err) {
            app.locals.log.error(err);
            res.parcel
                .setMessage('Internal server error')
                .setStatus(500);
        } else {
            cache.deleteCacheData(isProduction, app.locals.version, cache.policyTableKey);
            res.parcel.setStatus(200);
        }
        res.parcel.deliver();
    });

}


module.exports = {
    get: get,
    post: post.bind(null, false),
    promote: post.bind(null, true),
    updateVehicleDataReservedParams: helper.updateVehicleDataReservedParams,
    updateVehicleDataEnums: helper.updateVehicleDataEnums,
    getVehicleDataReservedParams: getVehicleDataReservedParams,
    getVehicleDataParamTypes: getVehicleDataParamTypes
};