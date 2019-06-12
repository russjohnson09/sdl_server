
module.exports = class StatisticsController
    // extends BaseController
{

    // router;
    // useTestData = true;
    //
    //
    // testData = {
    //     popular_models:  []
    // };


    /**
     * Test data for all apps.
     */
    getAggregateTestData()
    {
        let obj = {
            //Number of daily PTUs during the retention period, stacked by the triggering event (miles, days, ignition cycles)
            report_days: 30,
            total_policy_table_updates_by_trigger:
                {
                    unknown: 10,
                    mileage: 10,
                    days: 10,
                    ignition_cycles: 10,

                },
            device_model_counts: {
                "iPhone 8": 10,
                "Nexus 7": 5,
                "unknown": 1,
            },
            app_opens: {

            },
            rejected_rpcs: { //Aggregate count of rejected RPCs, over the retention period
                unknown: 10,
                getTires: 10
            },

        };


        return obj;
    }


    //https://github.com/smartdevicelink/sdl_evolution/blob/master/proposals/0233-policy-server-statistics-recording-visualizations.md
    getTestDataByAppId(appId)
    {
        //stored data, computed data.
        let obj = {
            //Number of daily PTUs during the retention period, stacked by the triggering event (miles, days, ignition cycles)
            report_days: 30,
            total_policy_table_updates_by_trigger:
                {
                    unknown: 10,
                    mileage: 10,
                    days: 10,
                    ignition_cycles: 10,

                },
            device_model_counts: {
                "iPhone 8": 10,
                "Nexus 7": 5,
                "unknown": 1,
            },
            app_opens: {

            },
            rejected_rpcs: { //Aggregate count of rejected RPCs, over the retention period
                unknown: 10,
                getTires: 10
            },

        };


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



    async init()
    {
        let self = this;
        let {router} = self;


        router.get('/ping', (req,res) => {
            res.send('pong');
        });

        if (self.useTestData)
        {
            // router.get('/',self.getTestDataRoute());
            router.get('/aggregate-report',self.getTestDataRoute())
        }
        else {
            // router.get('/',self.getTestDataRoute())
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