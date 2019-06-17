const moment = require('moment');

module.exports = class ReportingController
{


    generateTestUsageAndErrorCountsHistory()
    {
        // let usage_and_error_counts_history = [];
        let usage_and_error_counts_history = {};
        let date = moment().subtract(30,'days');

        //number of times the app has been opened
        //for each day get count_of_rejected_rpcs_calls, count_of_user_selections

        //TODO can we get times for the requests or just use aggregates
        let report_days = 30;
        for (let i = 0; i < report_days; i++)
        {
            let reportDate = moment(date).add(i,'days');

            let count_of_rejected_rpcs_calls = 1;
            let count_of_user_selections = 1;


            if (i % 2 === 0)
            {
                count_of_user_selections++;
            }

            if (i % 3 === 0)
            {
                count_of_rejected_rpcs_calls++;
            }


            if (i % 4 === 0)
            {
                count_of_user_selections++;
            }


            //2 or more datasets
            // usage_and_error_counts_history.push({
            //     created_date: reportDate,
            //     count_of_rejected_rpcs_calls,
            //     count_of_user_selections,
            //     minutes_in_hmi_background: 10,
            //     minutes_in_hmi_full: 20,
            //     minutes_in_hmi_limited: 40,
            //     minutes_in_hmi_none: 50
            // });


            usage_and_error_counts_history[moment(reportDate).format('YYYY-MM-DD')] =
                {
                // created_date: reportDate,
                count_of_rejected_rpcs_calls,
                count_of_user_selections,
                minutes_in_hmi_background: 10,
                minutes_in_hmi_full: 20,
                minutes_in_hmi_limited: 40,
                minutes_in_hmi_none: 50
            };


        }

        return usage_and_error_counts_history;
    }


    generateTestPolicyTableUpdateHistory()
    {
        let ptu_history = [];
        let date = moment().subtract(30,'days');

        // let report_days = 30;
        let report_days = 90;

        for (let i = 0; i < report_days; i++)
        {
            if (i % 9 === 0)
            {
                continue;
                // ptu_history.push({
                //     created_date: reportDate,
                //     update_type: 'days',
                // });
            }
            let reportDate = moment(date).add(i,'days');


            ptu_history.push({
                created_date: reportDate,
                update_type: 'days',
            });

            ptu_history.push({
                created_date: reportDate,
                update_type: 'mileage',
            });

            ptu_history.push({
                created_date: reportDate,
                update_type: 'ignition_cycle',
            });


            ptu_history.push({
                created_date: reportDate,
                update_type: 'mileage',
            });



            if (i % 2 === 0)
            {
                ptu_history.push({
                    created_date: reportDate,
                    update_type: 'mileage',
                });
            }

            if (i % 3 === 0)
            {
                ptu_history.push({
                    created_date: reportDate,
                    update_type: 'days',
                });
            }

        }

        return ptu_history;

    }

    getTotalPolicyUpdatesByTrigger(ptu_history)
    {
        let result = {

        };
        for (let history of ptu_history)
        {
            let {update_type} = history;

            if (!result[update_type])
            {
                result[update_type] = 0;
            }
            result[update_type]++;
        }
        return result;
    }

    getPolicyTableUpdatesByTrigger(ptu_history)
    {
        let result = {

        };
        for (let history of ptu_history)
        {
            let {update_type,created_date} = history;

            created_date = moment(created_date).format('YYYY-MM-DD');

            if (!result[created_date])
            {
                result[created_date] = {};
            }

            if (!result[created_date][update_type])
            {
                result[created_date][update_type] = 0;
            }
            result[created_date][update_type]++;
        }
        return result;


    }


    /**
     * Test data for all apps.
     */
    getAggregateTestData()
    {


        let policy_table_update_history = this.generateTestPolicyTableUpdateHistory();

        let policy_table_updates_by_trigger = this.getPolicyTableUpdatesByTrigger(policy_table_update_history);

        let total_policy_table_updates_by_trigger = this.getTotalPolicyUpdatesByTrigger(policy_table_update_history);



        let obj = {
            //Number of daily PTUs during the retention period, stacked by the triggering event (miles, days, ignition cycles)
            report_days: 30,
            policy_table_update_history,
            policy_table_updates_by_trigger,
            total_policy_table_updates_by_trigger,
            total_device_model: { //totals by model
                "iPhone 8": 10,
                "Nexus 7": 5,
                "unknown": 1,
                "Nexus 1": 5,
                "Nexus 2": 5,
                "Nexus 3": 5,
                "Nexus 4": 5,
                "Nexus 5": 5,
                "Nexus 6": 5,
                "Liquid Zest": 5,
                "Liquid Jade Z": 5,
                "Liquid Jade X": 5,
                "Small 1": 1,
                "Small 2": 1,
                "Small 3": 1,
                "Small 4": 1,
                "Small 5": 1,
                "Small 6": 1,
                "Small 7": 1,
                "Small 8": 1,
                "Small 9": 1,
                "Small 10": 1,
            },
            total_device_os: {
                "Android": 5,
                "iOS": 10
            },
            total_device_carrier: {
                "Verizon": 5,
                "Sprint": 10,
                'T-Mobile': 2,
                // "Ting": 2,
                // "1": 1,
                // "2": 1,
                // "3": 1,
                // "4": 1,
                // "5": 1,
                // "6": 1,

            },
            // app_opens: { //app level

            // },
            rejected_rpcs: { //Aggregate count of rejected RPCs, over the retention period
                unknown: 10,
                getTires: 10
            },

        };




        return obj;
    }


    async getTestDataByAppId(appId)
    {

        let usage_and_error_counts_history = await this.generateTestUsageAndErrorCountsHistory();

        //stored data, computed data.
        let obj = {
            app: {
                name: 'TEST APP'
            },
            //Number of daily PTUs during the retention period, stacked by the triggering event (miles, days, ignition cycles)
            report_days: 30,
            usage_and_error_counts_history

        };


        return obj;


    }

    /**
     *
     * @param opts
     */
    constructor(opts)
    {
        let {router,useTestData} = opts;


        if (useTestData !== undefined)
        {
            this.useTestData = useTestData;
        }
        else {
            this.useTestData = true;
        }

        this.router = router;

        // this.parcel = parcel;

    }


    getTestDataRoute()
    {

        let self = this;
        let testData = this.getAggregateTestData();

        return async function(req,res) {
            return res.parcel.setStatus(200)
                .setData(testData)
                .deliver();
        }
    }

    getTestAppReportRoute()
    {

        let self = this;
        return async function(req,res) {
            try {
                console.log(`fetch test data`)
                let testData = await self.getTestDataByAppId(req.params.id);
                // return res.send('ok');
                return res.parcel.setStatus(200)
                    .setData(testData)
                    .deliver();
            }
            catch (e)
            {
                console.error(e);
                return res.setStatus(500).send();
            }

        }
    }



    async init()
    {
        let self = this;
        let {router} = self;


        router.get('/ping', (req,res) => {
            res.send('pong');
        });

        if (self.useTestData)
        {
            router.get('/aggregate-report',self.getTestDataRoute());

            router.get('/application-report/:id',self.getTestAppReportRoute());
        }
        else {
        }


    }

    /**
     * Given a router and ... opts
     * create a controller.
     *
     * Connect to the postgres pool etc.
     *
     * Limit global references.
     * @returns {Promise<void>}
     */
    static async create(opts)
    {
        let obj = new this(opts);
        await obj.init();

        return obj;



    }

}


// module.exports = StatisticsController;