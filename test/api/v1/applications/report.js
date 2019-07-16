// var common = require('../../../common');
// var expect = common.expect;
var endpoint = '/api/v1/applications';
const config = require('../../../../settings.js');

let defaultUrl = 'http://' + config.policyServerHost + ':' + config.policyServerPort;
let BASE_URL = process.env.BASE_URL || defaultUrl;
const request = require('request');


describe(`/api/v1/applications/report tests`, function() {
    describe(`create and view report for application from policy update request`, function() {
        it(`/api/v1/production/policy POST`, function(done) {

            // let options
        })
    })
})

common.post(
  'should report for application',
  '/api/v1/production/policy',
  {
      policy_table: {
          module_config: {
              full_app_id_supported: true,
              app_policies: {

              },
              consumer_friendly_messages: {

              },
              device_data: {

              },
              functional_groupings: {

              },
              usage_and_error_counts: {
                  app_level: {
                      "4b5145c5-0970-4a42-ba4b-08a9ff47aea3": {
                          count_of_TLS_errors: 0,
                          count_of_user_selections: 1,
                          count_of_rejected_rpc_calls: 2,
                          minutes_in_hmi_background: 3,
                          minutes_in_hmi_full: 4,
                          minutes_in_hmi_limited: 5,
                          minutes_in_hmi_none: 6
                      }
                  }
              }
          }
      },
      usage_and_error_counts: {
          app_level
      }
  },
  (err, res, done) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      //expect(res.body.data.applications).to.have.lengthOf.above(0);
      done();
  }
);

common.get(
    'should report for application',
    endpoint,
    {uuid: '4b5145c5-0970-4a42-ba4b-08a9ff47aea3'},
    (err, res, done) => {
        console.log(res)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        //expect(res.body.data.applications).to.have.lengthOf.above(0);
        done();
    }
);
