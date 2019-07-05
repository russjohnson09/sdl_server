const moment = require('moment');

/**
 * Singleton class
 */
class ReportingService
{




  //requires db in config
  constructor(config)
  {
    this.config = config;

    this.db = this.config.db;
    if (!config || !config.db)
    {
      throw new Error(`Config with db implementing sqlCommand required`);
    }
    this.logger = config.logger || console;

    this.lastPurge = 0;
    this.expirationDays = this.config.expirationDays || 30;


  }


  async init()
  {

  }


  static async create(config)
  {
    let obj = new ReportingService(config);

    await obj.init();

    return obj;
  }

  static get()
  {
    return ReportingService.obj;
  }


  async findById(table,id)
  {

  }

  async idExists(table,id)
  {
    let {rows} = await this.doQuery({
      text: `select count(id) from ${table} where id = $1`,
      values: [id]
    });

    if (rows && rows[0] && rows[0].count > 0)
    {
      return true;
    }
    return false;
  }

  async insertWithDuplicateKeyCheck()
  {

  }

  async upsert(table,data,now)
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
    // let value_params = [];


    // let values = [];
    // let columns = [];
    let setColumns = [];
    let param_count = value_params.length;
    for (let column in updateData)
    {
      let value = data[column];
      // value_params.push(`$${value_params.length+1}`);

      param_count++;
      setColumns.push(`${column} = $${param_count}`);
      values.push(value);


    }

    // WHERE id = $${param_count}
    // param_count++;
    // values.push(id);

    let text = `INSERT INTO ${table}(${columns.join(',')}) VALUES (${value_params.join(',')})
    ON CONFLICT (id) 
    DO
        UPDATE 
        SET ${setColumns.join(',')}
`;

    return this.doQuery({
      text,
      values

      // values: values.slice(0,8)
    });

  }


  async update(table,data,now)
  {
    now = now || new Date();
    data.updated_ts = data.updated_ts || now;
    let value_params = [];

    let id = data.id;
    delete data.id;

    let values = [];
    let columns = [];
    let param_count = 0;
    for (let column in data)
    {
      let value = data[column];
      // value_params.push(`$${value_params.length+1}`);

      param_count++;
      columns.push(`${column} = $${param_count}`);
      values.push(value);


    }

    param_count++;
    values.push(id);
    let text = `UPDATE ${table} SET ${columns.join(',')} WHERE id = $${param_count}`; //(${COLUMNS}) VALUES (${VALUE_PARAMS})


    return this.doQuery({
      text,
      values
    })



  }

  async insert(table,data,now)
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

    return this.doQuery({
      text,
      values
    })

  }

  /**
   *
   * @param id
   * @param data
   * @returns {Promise<void>}
   */
  async insertUpdateRecordById(table,data,now)
  {
    return this.upsert(table,data,now);
  }

  /**
   * id supports up to 64 characters
   * 1280e3a858d9ab45ed129c2205abb7443eb6797e3fc23f38180879b5090c731f
   *
   *
   * create table device
   (
   id char default 64
   constraint device_pk
   primary key,
   carrier varchar,
   connection_type varchar,
   hardware varchar,
   os varchar,
   os_version varchar
   );


   *
   * Comes from policy_table.device_data
   * @param deviceData
   * @returns {Promise<void>}
   */
  async updateDeviceData(deviceData,now)
  {
    if (!deviceData)
    {
      return;
    }
    try {
      for (let id in deviceData)
      {
        //removes any unsupported fields
        let {carrier,connection_type,hardware,os,os_version} = deviceData[id];
        let data = {carrier,connection_type,hardware,os,os_version,id};
        for (let key in data)
        {
          data[key] = data[key] || 'UNKNOWN';
        }
        let result = await this.insertUpdateRecordById(`device`,data,now);
      }
    }
    catch (e)
    {
      this.logger.error(`Failed to update deviceData ${JSON.stringify(deviceData)}`);
      throw e;
    }


  }


  async removeOldPolicyTableUpdateRequests()
  {
    let expiration = moment().subtract(this.expirationDays,'days').toDate();
    let result = await this.doQuery({
      text: `DELETE FROM policy_table_update_request where updated_ts < $1`,
      values: [expiration]
    });

    return result;

  }

  async removeOldDeviceData()
  {
    let expiration = moment().subtract(this.expirationDays,'days').toDate();
    let result = await this.doQuery({
      text: `DELETE FROM device where updated_ts < $1`,
      values: [expiration]
    });

    return result;

  }

  async purgeOldRecords()
  {
    let checkOldDataInterval = 5 *  60 * 1000;
    if ((Date.now() - this.lastPurge) > checkOldDataInterval)
    {
      return;
    }
    await this.removeOldDeviceData();
    await this.removeOldDeviceData();

    this.lastPurge = Date.now();
  }

  async updateAppUsage()
  {

  }

  /**
   *
   * INSERT ONLY.
   *
   drop table policy_table_update_request;
   create table policy_table_update_request
   (
   id serial not null
   constraint policy_table_update_request_pk
   primary key,
   trigger_event varchar(255),
   created_ts timestamp not null,
   updated_ts timestamp not null
   );



   * @returns {Promise<void>}
   */
  //TODO where is the trigger reason stored?
  async updatePolicyTableUpdateRequests(policyTableObject,now)
  {
    let trigger_event = policyTableObject.trigger_event;

    trigger_event = trigger_event || 'UNKNOWN';

    let data = {trigger_event};


    let result = await this.insert(`policy_table_update_request`,data,now);


    return result;

  }


  async updateReporting(policyTableObject,now)
  {

    try {

      await this.purgeOldRecords();

      let policyTableUpdatePromise = this.updatePolicyTableUpdateRequests(policyTableObject,now);
      if (policyTableObject.device_data)
      {
        await this.updateDeviceData(policyTableObject.device_data,now);
      }

      if (policyTableObject.usage_and_error_counts)
      {
        await this.updateAppUsage(policyTableObject.usage_and_error_counts,now);
      }

      let policyTableUpdateResult = await policyTableUpdatePromise;

      let success = true;

      let result = {
        success,
        // queryResult //rows and error
      };

      return result;
    }
    catch (e)
    {
      this.logger.error(e);
      return {
        success: false,
        error: e.message
      }
    }

  }


  getExpireDate()
  {
    return moment().subtract(this.expirationDays,'days').toDate();
  }

  getCountJson(rows)
  {
    let json = {};

    for (let row of rows)
    {
      json[row.name] = row.count;
    }
    return json;
  }


  async getTotalDeviceModels(expireDate)
  {
    expireDate = expireDate || this.getExpireDate();
    let {rows} = await this.doQuery(
      {
        text: `select count(id) AS count,hardware AS name from device where updated_ts > $1 group by hardware`,
        values: [expireDate]
      });
    return this.getCountJson(rows);
  }

  async getTotalDeviceCarrier(expireDate)
  {
    expireDate = expireDate || this.getExpireDate();
    let {rows} = await this.doQuery(
      {
        text: `select count(id) AS count,carrier AS name from device where updated_ts > $1 group by carrier`,
        values: [expireDate]
      });
    return this.getCountJson(rows);

  }

  async getTotalDeviceOs(expireDate)
  {
    expireDate = expireDate || this.getExpireDate();
    let {rows} = await this.doQuery(
      {
        text: `select count(id) AS count,os AS name from device where updated_ts > $1 group by os`,
        values: [expireDate]
      });
    return this.getCountJson(rows);

  }

  async getPolicyTableUpdatesByTrigger(expireDate)
  {
    expireDate = expireDate || this.getExpireDate();
    let {rows} = await this.doQuery(
      {
        text: `select trigger_event,to_char(created_ts, 'YYYY-MM-DD') created\t from policy_table_update_request
where updated_ts > $1
order by created_ts   
;`,
        // text: `select count(id) AS count,os AS name from device where updated_ts > $1 group by os`,
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

  }


  async getPolicyTableUpdatesByTriggerTotal(expireDate)
  {
    expireDate = expireDate || this.getExpireDate();
    let {rows} = await this.doQuery(
      {
        text: `select trigger_event,count(id) AS count  from policy_table_update_request
where updated_ts > $1
group by trigger_event
;`,
        // text: `select count(id) AS count,os AS name from device where updated_ts > $1 group by os`,
        values: [expireDate]
      });

    let result = {};

    for (let row of rows)
    {
      let {trigger_event,count} = row;
      result[trigger_event] = count;
    }


    return result;

  }


  // policy_table_updates_by_trigger,
  // total_policy_table_updates_by_trigger,
  async getPolicyTableUpdatesReport()
  {

    let policy_table_updates_by_trigger = await this.getPolicyTableUpdatesByTrigger();
    let total_policy_table_updates_by_trigger = await this.getPolicyTableUpdatesByTriggerTotal();

    return {
      policy_table_updates_by_trigger,
      total_policy_table_updates_by_trigger
    }
  }

  /**
   * total_device_carrier
   * total_device_model
   * total_device_os
   *
   * @returns {Promise<void>}
   */
  async getDeviceReport()
  {
    let expireDate = this.getExpireDate();
    //get devices updated within the last x days.
    // let {rows} = this.doQuery(
    //   {
    //     text: `select count(id),carrier from device where updated_ts > $1`,
    //     values: [expireDate]
    //   });

    let total_device_carrier = await this.getTotalDeviceCarrier(expireDate);
    let total_device_model = await this.getTotalDeviceModels(expireDate);
    let total_device_os = await this.getTotalDeviceOs(expireDate);


    return {
      total_device_carrier,
      total_device_model,
      total_device_os
    }



  }

  /**
   *
   *         // const query = {
        //     text: 'INSERT INTO users(name, email) VALUES($1, $2)',
        //     values: ['brianc', 'brian.m.carlson@gmail.com'],
        // }
   * @param query
   * @returns {Promise<self.sqlCommand|sqlCommand>}
   */
  async doQuery(query)
  {
    let longQueryTime = 1;
    let t1 = Date.now();
    let db = this.db;
    return new Promise((resolve,reject) => {
      db.doQuery(query,(error,rows) => {
        let t2 = Date.now();
        let d1 = t2 - t1;
        if (d1 > longQueryTime)
        {
          this.logger.warn(`Long query time ${query.text} ${d1} (ms)`)
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


}

ReportingService.obj = null;


module.exports = ReportingService;
