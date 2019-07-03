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

    this.logger.info(table,data)

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

    let text = `INSERT INTO ${table}(${columns.join(',')}) VALUES (${value_params.join(',')})`; //(${COLUMNS}) VALUES (${VALUE_PARAMS})


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
    this.logger.debug(`insertUpdateRecordById`,table,data);
    let exists = await this.idExists(table,data.id);

    if (exists)
    {
      return this.update(table,data,now);
    }
    else {
      return this.insert(table,data,now);
    }
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
        console.log(deviceData,id);
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
    }


    let result = await this.removeOldDeviceData();

    this.logger.debug(`removed`,result);
  }


  async removeOldDeviceData()
  {
    let expiration = moment().subtract(30,'days').toDate();
    let result = await this.doQuery({
      text: `DELETE FROM device where updated_ts < $1`,
      values: [expiration]
    });

    return result;

  }

  async updateAppUsage()
  {

  }


  async updateReporting(policyTableObject,now)
  {

    try {
      if (policyTableObject.device_data)
      {
        this.logger.debug(`updating device_data`);
        await this.updateDeviceData(policyTableObject.device_data,now);
      }

      if (policyTableObject.usage_and_error_counts)
      {
        await this.updateAppUsage(policyTableObject.usage_and_error_counts,now);

      }

      let result = {};

      let text = `INSERT INTO reporting_detail(name) VALUES($1)`;
      let values = [`test`];

      let queryResult = await this.doQuery({
        text,
        values,
      })

      let success = true;
      if (queryResult.error)
      {
        this.logger.error(queryResult.error);
        success = false;
      }



      result = {
        success,
        queryResult //rows and error
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
    return moment().subtract(30,'days').toDate();
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
    let db = this.db;


    // let q = {
    //   text: 'INSERT INTO reporting_detail(name, email) VALUES($1, $2)',
    //
    //   // text: 'INSERT INTO users(name, email) VALUES($1, $2)',
    //   // values: ['brianc', 'brian.m.carlson@gmail.com'],
    // }
    // let db = this.db;
    // q = "select 1 AS COUNT";
    // // q = "select * from app_info;";
    // // q = "select * from public.reporting_detail;";
    // // q = "INSERT INTO reporting_detail(name, value) VALUES('test','2')"
    // q = "INSERT INTO reporting_detail(name) values(null);"
    //
    // q = {
    //   text: "INSERT INTO reporting_detail(name) values($1);",
    //   values: [null]
    // }

    //https://dba.stackexchange.com/questions/168150/obvious-reason-postgres-users-cant-read-a-table

    // q = 'select * from information_schema.columns WHERE table_name = \'reporting_detail\''
    // q = 'select * from information_schema.columns'

    this.logger.debug(query);
    return new Promise((resolve,reject) => {
      db.doQuery(query,(error,rows) => {
        console.debug(`result`,error,rows);
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
