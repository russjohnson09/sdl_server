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
    let {rows} = await this.doQuery(`select count(id) from ${table} where id = $1`,[id]);

    if (rows && rows[0].count > 0)
    {
      return true;
    }
    return false;
  }


  async updateById(table,id,data)
  {
    data.updated_ts = data.updated_ts || Date.now();
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

    value_params.push(id);
    let text = `UPDATE ${table}(${columns.join(',')}) VALUES (${value_params.join(',')}) WHERE id = $${value_params.length}`; //(${COLUMNS}) VALUES (${VALUE_PARAMS})


    return this.doQuery({
      text,
      values
    })



  }

  async insert(table,data)
  {
    data.created_ts = data.created_ts || Date.now();
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
  async insertUpdateRecordById(table,id,data)
  {
    let exists = await this.idExists(table,id);

    if (exists)
    {
      return this.updateById(table,id,data);
    }
    else {
      return this.insert(table,data);
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
  async updateDeviceData(deviceData)
  {
    for (let id of deviceData)
    {
      //removes any unsupported fields
      let {carrier,connection_type,hardware,os,os_version} = deviceData;
      let data = {carrier,connection_type,hardware,os,os_version};
      let result = await this.insertUpdateRecordById(`device`,id,data);
    }
  }


  async updateReporting(policyTableObject)
  {

    if (policyTableObject.device_data)
    {
      this.logger.debug(`updating device_data`);
      await this.updateDeviceData(policyTableObject.device_data);
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
        resolve({
          error,
          rows
        })
      })
    })
  }


}

ReportingService.obj = null;


module.exports = ReportingService;
