//Copyright (c) 2019, Livio, Inc.
const sql = require('sql-bricks-postgres');

function insertRpcSpec(rpcSpec) {
    let data = {
        version: rpcSpec.version,
        min_version: rpcSpec.min_version,
        date: rpcSpec.date,
    };
    return sql.insert('rpc_spec', data)
        .returning('*');
}

function getLatestRpcSpec() {
    return sql.select('version')
        .from('rpc_spec')
        .orderBy('created_ts DESC')
        .limit(1);
}

/**
 * Returns a postgres sql query object to run against
 * using the postgres sdl_server/custom/databases/postgres/index.js
 * module.
 * @param isProduction
 */
function getVehicleData(isProduction) {

    let statement;
    //if looking for production just filter on the status.
    if (isProduction) {
        statement = sql.select('view_custom_vehicle_data.*')
            .from('view_custom_vehicle_data')
            .where({
                            status: 'PRODUCTION'
                        });
    } else { //if staging, select the most recently update custom_vehicle_data record regardless of status.
        let sub = sql.select('max(id) AS id')
            .from('view_custom_vehicle_data')
            .groupBy(['view_custom_vehicle_data.name','view_custom_vehicle_data.parent_id']);

        statement = sql.select('view_custom_vehicle_data.*')
            .from('(' + sub + ') sub')
            .innerJoin('view_custom_vehicle_data', {
                'view_custom_vehicle_data.id': 'sub.id'
            });
    }

    return statement;
}

function insertRpcSpecParam(rpcSpecParams, rpcSpecTypeByName) {
    let ary = [];
    for (let rpcSpecParam of rpcSpecParams) {
        rpcSpecParam['rpc_spec_type_id'] = null;
        if (rpcSpecTypeByName[rpcSpecParam.rpc_spec_type_name]) {
            rpcSpecParam['rpc_spec_type_id'] = rpcSpecTypeByName[rpcSpecParam.rpc_spec_type_name].id;
        }
        delete rpcSpecParam['rpc_spec_type_name'];

        ary.push(rpcSpecParam);
    }

    return sql.insert('rpc_spec_param', ary)
        .returning('*');
}

function insertRpcSpecType(rpc_spec_id, rpcSpecTypes) {
    for (let rpcSpecType of rpcSpecTypes) {
        rpcSpecType.rpc_spec_id = rpc_spec_id;
    }

    return sql.insert('rpc_spec_type', rpcSpecTypes)
        .returning('*');
}

function insertProductionCustomVehicleData(obj)
{
    //parent_id should be updated before reaching this point.

    // "id" SERIAL NOT NULL,
    // "parent_id" INTEGER REFERENCES custom_vehicle_data (id) ON UPDATE CASCADE ON DELETE CASCADE,
    // "status" edit_status NOT NULL DEFAULT 'STAGING'::edit_status,
    // "name" TEXT NOT NULL,
    // "type" TEXT,
    // "key" TEXT, -- OEM Data Reference string (proprietary)\
    // "mandatory" TEXT,
    // "min_length" TEXT, -- actually minlength
    // "max_length" TEXT, -- actually maxlength
    // "min_size" TEXT, -- actually minsize
    // "max_size" TEXT, -- actually maxsize
    // "min_value" TEXT, -- actually minvalue
    // "max_value" TEXT, -- actually maxvalue
    // "array" TEXT,
    // "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    // "created_ts" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    // "updated_ts" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    let data = {
        parent_id: obj.parent_id,
        status: 'PRODUCTION',
        name: obj.name,
        type: obj.type,
        key: obj.key,
        mandatory: obj.mandatory,
        min_length: obj.min_length,
        max_length: obj.max_length,
        min_size: obj.min_size,
        max_size: obj.max_size,
        max_value: obj.max_value,
        array: obj.array,

        //TODO should created be based on the original record?
        // created: obj.created,
    };
    console.log(`insert data`,data);
    return sql.insert('custom_vehicle_data', data)
        .returning('*');
}

module.exports = {
    getVehicleData: getVehicleData,
    insertRpcSpec: insertRpcSpec,
    insertRpcSpecType: insertRpcSpecType,
    insertRpcSpecParam: insertRpcSpecParam,
    getLatestRpcSpec: getLatestRpcSpec,
    insertProductionCustomVehicleData: insertProductionCustomVehicleData,
};
