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


  async updateReporting(policyTableObject)
  {

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
    let q = {
      text: 'INSERT INTO reporting_detail(name, email) VALUES($1, $2)',

      // text: 'INSERT INTO users(name, email) VALUES($1, $2)',
      // values: ['brianc', 'brian.m.carlson@gmail.com'],
    }
    let db = this.db;
    q = "select 1 AS COUNT";
    // q = "select * from app_info;";
    // q = "select * from public.reporting_detail;";
    // q = "INSERT INTO reporting_detail(name, value) VALUES('test','2')"
    q = "INSERT INTO reporting_detail(name) values(null);"

    q = {
      text: "INSERT INTO reporting_detail(name) values($1);",
      values: [null]
    }

    //https://dba.stackexchange.com/questions/168150/obvious-reason-postgres-users-cant-read-a-table

    // q = 'select * from information_schema.columns WHERE table_name = \'reporting_detail\''
    // q = 'select * from information_schema.columns'

    this.logger.debug(q);
    return new Promise((resolve,reject) => {
      db.doQuery(q,(error,rows) => {
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
