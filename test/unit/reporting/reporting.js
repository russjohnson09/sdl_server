const moment = require('moment');



// var common = require('../../common');
// var expect = common.expect;
// var endpoint = '/api/v1/applications';



//Example postgres set in the .env file


// DB_USER=livio
// DB_PASSWORD=password
// DB_DATABASE=sdl_server
// DB_HOST=localhost
// DB_PORT=5432

//sdl_server/settings.js

//sdl_server/app/v1/policy/model.js


// /

//sdl_server/custom/databases/postgres/index.js
//    dbParameters.database = config.dbDatabase;


//const setupSqlCommand = app.locals.db.setupSqlCommand;
//const res = await client.query('SELECT $1::text as message', ['Hello world!'])
//queryString,params


//
// create table reporting_detail
// (
//   id serial
// constraint reporting_detail_pk
// primary key,
//   name varchar,
//   value varchar
// );


//TODO taken from index.js
//custom modules
// require('dotenv').config({
//   path: './../../'
// });

//must be run in the root directory.
const config = require('../../../settings'); //configuration module
const log = require(`../../../custom/loggers/${config.loggerModule}/index.js`);


console.log(`config`,config);
const db = require(`../../../custom/databases/${config.dbModule}/index.js`)(log); //pass in the logger module that's loaded
// const flame = require('../../lib/flame-box');
// const hashify = require('../../lib/hashify');
// const arrayify = require('../../lib/arrayify');
// const parcel = require('./helpers/parcel');
// const Cron = require('cron').CronJob;
const ReportingService = require('../../../lib/reporting/ReportingService');

const expect = require('chai').expect;


/**@type {ReportingService} **/
let reportingService;


describe('update from policy table', () => {


  it('init services', async () => {
    reportingService = await ReportingService.create({db})
  });

  it('old device', async () => {
    let result = await reportingService.updateReporting({
      device_data: {
        "old": { //device id from core
          "carrier": "",
          "connection_type": "BTMAC",
          "hardware": "Pixel",
          "os": "Android",
          "os_version": "8.1.0"
        },
      }
    },
      moment().subtract(60,'days').toDate());
  })

  it('basic test', async () => {
      // console.log(`reporting`);
      // db.sqlCommand();
      //
      let result = await reportingService.updateReporting({
          device_data: {
      "1280e3a858d9ab45ed129c2205abb7443eb6797e3fc23f38180879b5090c731f": { //device id from core
            "carrier": "",
              "connection_type": "BTMAC",
              "hardware": "Pixel",
              "os": "Android",
              "os_version": "8.1.0"
          },
            "test2": { //device id from core
              "carrier": "",
              "connection_type": "BTMAC",
              "hardware": "Pixel",
              "os": "Android",
              "os_version": "8.1.0"
            },
            "test1": { //device id from core
              "carrier": "",
              "connection_type": "BTMAC",
              "hardware": "Pixel",
              "os": "Android",
              "os_version": "8.1.0"
            }
          }
      });

    expect(result.success).to.be.true;
    // const query = {
    //   text: 'INSERT INTO reporting_detail(name) VALUES($1)',
    //   values: ['brianc'],
    // };



  });



  //TODO device load testing







  //usage_and_error_counts


  it('usage_and_error_counts', async () => {
    // console.log(`reporting`);
    // db.sqlCommand();
    //
    let result = await reportingService.updateReporting({
      //TODO what if (probably likely) this spans multiple days and so we cannot associate specific days with this usage.
      //solution: multiple users will create an aggregate that is closer to what is actually going on.
      usage_and_error_counts: { //app usage since last update.
        "2aa52453-dec2-415f-bacc-2908557e003a": {
          "count_of_user_selections": 0,
          "count_of_rejected_rpc_calls":0,
          "minutes_in_hmi_background": 0,
          "minutes_in_hmi_full": 0,
          "minutes_in_hmi_limited": 0,
          "minutes_in_hmi_none": 0
        }
      }
    });

    expect(result.success).to.be.true;
    // const query = {
    //   text: 'INSERT INTO reporting_detail(name) VALUES($1)',
    //   values: ['brianc'],
    // };



  });


  it('exit connections', async() => {
    db.end();
    // process.exit(0);
  })

})
