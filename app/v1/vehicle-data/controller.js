//Copyright (c) 2019, Livio, Inc.
const app = require('../app');
const helper = require('./helper.js');
const model = require('./model.js');
const cache = require('../../../custom/cache');
const async = require('async');

function getVehicleDataReservedParams(req, res, next) {
    async.waterfall(
        [
            function(cb) {
                model.getVehicleDataReservedParams(cb);
            },
        ], function(err, reserved_params) {
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
        }
    );
}

function getVehicleDataParamTypes(req, res, next) {
    async.waterfall(
        [
            function(cb) {
                helper.getVehicleDataParamTypes(cb);
            },
        ],
        function(err, vehicle_data_types) {
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
        }
    );
}

function get(req, res, next) {
    const isProduction = !req.query.environment || req.query.environment.toLowerCase() !== 'staging';

    async.waterfall(
        [
            function(cb) {
                helper.getVehicleData(isProduction,req.query.id,
                                      cb);
            },
        ],
        function(err, custom_vehicle_data) {
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
                     custom_vehicle_data: custom_vehicle_data
                 })
                .deliver();
        }
    );
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

function promoteIds (req, res, next) {
    helper.validatePromote(req, res);
    //If validate comes up with some error exit before promoting.
    if (res.parcel.message) {
        return res.parcel.deliver();
    }
    //make sure the data in id is an array in the end
    if (check.number(req.body.id)) {
        req.body.id = [req.body.id];
    }

    const getFuncGroupsFlow = flow(req.body.id.map(function (id) {
        return helper.createFuncGroupFlow('idFilter', id, true);
    }), {method: 'parallel', eventLoop: true});

    const getAndInsertFlow = app.locals.flow([
                                                 getFuncGroupsFlow,
                                                 function (funcGroups, next) {
                                                     const notNullGroups = funcGroups.map(function (funcGroup) {
                                                         return funcGroup[0];
                                                     }).filter(function (elem) {
                                                         return elem;
                                                     });
                                                     //format the functional groups so it's a single array
                                                     next(null, notNullGroups);
                                                 },
                                                 model.insertFunctionalGroupsWithTransaction.bind(null, true)
                                             ], {method: 'waterfall'});

    getAndInsertFlow(function () {
        cache.deleteCacheData(true, app.locals.version, cache.policyTableKey);
        res.parcel
            .setStatus(200)
            .deliver(); //done
    });

}


module.exports = {
    get: get,
    post: post.bind(null, false),
    promote: promoteIds,
    updateVehicleDataReservedParams: helper.updateVehicleDataReservedParams,
    updateVehicleDataEnums: helper.updateVehicleDataEnums,
    getVehicleDataReservedParams: getVehicleDataReservedParams,
    getVehicleDataParamTypes: getVehicleDataParamTypes,
    updateRpcSpec: helper.updateRpcSpec,
};
