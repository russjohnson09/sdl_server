//Copyright (c) 2019, Livio, Inc.
const sql = require('sql-bricks-postgres');

function moduleConfigById(id) {
    return sql.select('*')
        .from('module_config')
        .where({ id: id });
}

function retrySecondsById(id) {
    return sql.select('*')
        .from('module_config_retry_seconds')
        .where({ id: id })
        .orderBy('module_config_retry_seconds.order');
}

function moduleConfigByStatus(isProduction) {
    const tableName = isProduction ? 'view_module_config_production' : 'view_module_config_staging';
    return sql.select('*').from(tableName);
}

function retrySecondsByStatus(isProduction) {
    return sql.select('module_config_retry_seconds.*')
        .from('(' + moduleConfigByStatus(isProduction) + ') vmc')
        .innerJoin('module_config_retry_seconds', { 'vmc.id': 'module_config_retry_seconds.id' })
        .orderBy('module_config_retry_seconds.order');
}

function insertVehicleDataItem(vehicleDataItem, vehicle_data_group_id, parent_id) {
    let data = {
        name: vehicleDataItem.name,
        vehicle_data_group_id: vehicle_data_group_id,
        parent_id: parent_id,
        key: vehicleDataItem.key,
        type: vehicleDataItem.type,
        array: vehicleDataItem.array === true,
        since: vehicleDataItem.since,
        until: vehicleDataItem.until,
        removed: vehicleDataItem.removed,
        deprecated: vehicleDataItem.deprecated,
        minvalue: vehicleDataItem.minvalue,
        maxvalue: vehicleDataItem.maxvalue,
        minsize: isNaN(parseInt(vehicleDataItem.minsize)) ? null : parseInt(vehicleDataItem.minsize),
        maxsize: isNaN(parseInt(vehicleDataItem.maxsize)) ? null : parseInt(vehicleDataItem.maxsize),
        minlength: isNaN(parseInt(vehicleDataItem.minlength)) ? null : parseInt(vehicleDataItem.minlength),
        maxlength: isNaN(parseInt(vehicleDataItem.maxlength)) ? null : parseInt(vehicleDataItem.maxlength),
    };

    return sql.insert('vehicle_data', data)
        .returning('*');
}

function insertVehicleData(vehicleData) {
    return sql.insert('vehicle_data_group', {
        status: vehicleData.status,
        schema_version: vehicleData.schema_version,
    })
        .returning('*');
}

function insertRetrySeconds(secondsArray, id) {
    return sql.insert('module_config_retry_seconds', secondsArray.map(function(seconds, index) {
        return {
            id: id,
            seconds: seconds,
            order: index
        };
    }));
}

function insertVehicleDataReservedParams(vehicleDataReservedParams) {
    return vehicleDataReservedParams.map(function(param) {
        return sql.insert('vehicle_data_reserved_params', 'id')
            .select
            (
                `'${param}' AS id`
            )
            .where(
                sql.not(
                    sql.exists(
                        sql.select('*')
                            .from('vehicle_data_reserved_params p')
                            .where({
                                       'p.id': param
                                   })
                    )
                )
            )
            .toString();
    });
}



// CREATE TABLE IF NOT EXISTS rpc_spec (
//     "id" SERIAL NOT NULL,
//     "version" TEXT NOT NULL,
//     "min_version" TEXT,
//     "date" TEXT,
//     "created_ts" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
//     CONSTRAINT rpc_spec_pk PRIMARY KEY (id),
//     CONSTRAINT rpc_spec_version_unique UNIQUE (version)
// )
// WITH ( OIDS = FALSE );
function insertRpcSpec(spcSpec) {
    let data = {
        version: spcSpec.version,
        min_version: spcSpec.min_version,
        date: spcSpec.date,
    };
    return sql.insert('rpc_spec', data)
        .returning('*');
}

function insertVehicleDataEnums(enums,rpc_spec_id) {
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


    return enums.map(function(param) {
        return sql.insert('rpc_spec_type', 'rpc_spec_id')
            .select
            (
                // `'${param}' AS id`
            )
            .where(
                sql.not(
                    sql.exists(
                        sql.select('*')
                            .from('vehicle_data_enums e')
                            .where({
                                       'e.id': param
                                   })
                    )
                )
            )
            .toString();
    });
}

// CREATE TABLE IF NOT EXISTS rpc_spec_param (
//     "id" SERIAL NOT NULL,
//     "rpc_spec_type_id" INTEGER NOT NULL REFERENCES rpc_spec_type (id) ON UPDATE CASCADE ON DELETE CASCADE,
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
// CONSTRAINT rpc_spec_param_pk PRIMARY KEY (id),
//     CONSTRAINT rpc_spec_param_unique UNIQUE (rpc_spec_type_id, name)
// )
// WITH ( OIDS = FALSE );

//includes enum value elements.
function insertRpcSpecParam(rpcSpecParams,rpcSpecTypeByName)
{
    console.log(`insertRpcSpecParam`,rpcSpecTypeByName);

    let ary = [];
    for (let rpcSpecParam of rpcSpecParams)
    {
        if (rpcSpecParam.rpc_spec_type_name)
        {
            rpcSpecParam['id'] = rpcSpecTypeByName[rpcSpecParam.rpc_spec_type_name];
            delete rpcSpecParam.rpc_spec_type_name;
            let data = Object.assign({},rpcSpecParam);
            ary.push(data);
        }
    }

    let result = sql.insert('rpc_spec_param', ary)
        .returning('*');

    console.log(`insert`,result.toString());
    return result;

}

function insertRpcSpecType(rpc_spec_id,rpcSpecTypes)
{
    console.log(`insertRpcSpecType`,rpcSpecTypes,rpc_spec_id)
    // let data = {
    //     rpc_spec_id: rpc_spec_id,
    //     name: vehicleDataItem.name,
    //     vehicle_data_group_id: vehicle_data_group_id,
    //     parent_id: parent_id,
    //     key: vehicleDataItem.key,
    //     type: vehicleDataItem.type,
    //     array: vehicleDataItem.array === true,
    //     since: vehicleDataItem.since,
    //     until: vehicleDataItem.until,
    //     removed: vehicleDataItem.removed,
    //     deprecated: vehicleDataItem.deprecated,
    //     minvalue: vehicleDataItem.minvalue,
    //     maxvalue: vehicleDataItem.maxvalue,
    //     minsize: isNaN(parseInt(vehicleDataItem.minsize)) ? null : parseInt(vehicleDataItem.minsize),
    //     maxsize: isNaN(parseInt(vehicleDataItem.maxsize)) ? null : parseInt(vehicleDataItem.maxsize),
    //     minlength: isNaN(parseInt(vehicleDataItem.minlength)) ? null : parseInt(vehicleDataItem.minlength),
    //     maxlength: isNaN(parseInt(vehicleDataItem.maxlength)) ? null : parseInt(vehicleDataItem.maxlength),
    // };

    let ary = [];

    for (let rpcSpecType of rpcSpecTypes)
    {
        let data = {
            rpc_spec_id: rpc_spec_id,
        };

        Object.assign(data,rpcSpecType);

        ary.push(data);
    }

    console.log(`do insert`,ary);


    let result = sql.insert('rpc_spec_type', ary)
        .returning('*');

    console.log(`insert`,result.toString());
    return result;
}

module.exports = {
    insert: {
        vehicleDataReservedParams: insertVehicleDataReservedParams,
        vehicleDataReservedParams: insertVehicleDataReservedParams,
        vehicleDataEnums: insertVehicleDataEnums,
        rpcSpec: insertRpcSpec,
        rpcSpecType: insertRpcSpecType,
        rpcSpecParam: insertRpcSpecParam,
    },
    insertVehicleDataItem: insertVehicleDataItem,
    insertVehicleData: insertVehicleData,
    insertRetrySeconds: insertRetrySeconds,
    moduleConfig: {
        id: moduleConfigById,
        status: moduleConfigByStatus
    },
    retrySeconds: {
        id: retrySecondsById,
        status: retrySecondsByStatus
    }
};
