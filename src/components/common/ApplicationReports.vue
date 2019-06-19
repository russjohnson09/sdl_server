<template>

    <div>
        <h4>Application Report For Past {{appReport.report_days}} Days</h4>


        <pre>{{appReport}}</pre>
        <div class="row">
            <div class="col-sm-12"
                 style="min-width:350px"
            >
                <div v-if="timeUsageReport" >
                    <vue-plotly v-if="timeUsageReport"
                                :data="timeUsageReport.data"
                                :layout="timeUsageReport.layout"
                                :options="timeUsageReport.options"

                    />
                </div>
                <div v-else >
                    <img src="~@/assets/images/black_graphs/bargraphtall_blank.png" alt="No data"/>
                </div>

            </div>

        </div>

        <div class="row">
            <div class="col-sm-12"
                 style="min-width:350px"
            >
                <div v-if="userSelectionsReport" >
                    <vue-plotly v-if="userSelectionsReport"
                                :data="userSelectionsReport.data"
                                :layout="userSelectionsReport.layout"
                                :options="userSelectionsReport.options"

                    />
                </div>
                <div v-else >
                    <img src="~@/assets/images/black_graphs/bargraphtall_blank.png" alt="No data"/>
                </div>

            </div>

        </div>



        <div v-if="stackedCountsReport" >
            <chart
                    v-bind:height="defaultHeight"
                    v-bind:width="defaultWidth"
                    v-if="stackedCountsReport" v-bind:chart="stackedCountsReport"></chart>
        </div>


        <div v-if="lineChartRejectedRPCCalls" >
            <chart
                    v-bind:height="defaultHeight"
                    v-bind:width="defaultWidth"
                    v-if="lineChartRejectedRPCCalls" v-bind:chart="lineChartRejectedRPCCalls"></chart>
        </div>

        <div v-if="lineChartUserSelectionCounts" >
            <chart
                    v-bind:height="defaultHeight"
                    v-bind:width="defaultWidth"
                    v-if="lineChartUserSelectionCounts" v-bind:chart="lineChartUserSelectionCounts"></chart>
        </div>

    </div>

</template>

<script>
    import Chart from "./Chart";

    let defaultWidth,defaultHeight;
    defaultWidth = defaultHeight = 300;

    let obj = {
        props: [
            'appReport' //usage aggregates by day for this application.
            // eg {
            //     "app": {
            //         "name": "TEST APP"
            //     },
            //     "report_days": 30,
            //     "aggregate_counts": {
            //         "usage_time": {
            //             "minutes_in_hmi_background": 100,
            //             "minutes_in_hmi_full": 1000,
            //             "minutes_in_hmi_limited": 20,
            //             "minutes_in_hmi_none": 2
            //         },
            //         "count_of_user_selections": 10,
            //         "count_of_rejected_rpcs_calls": 100
            //     }
            // }
        ],
        data () {
            let obj = {
                timeUsageReport: null,
                userSelectionsReport: null,

                defaultWidth,
                defaultHeight

            };

            return obj;
        },
        methods: {
        },

        mounted (){

            if (this.appReport)
            {
                let {app,report_days,aggregate_counts,usage_time_history,user_selection_history} = this.appReport;
                let {usage_time,count_of_user_selections,count_of_rejected_rpcs_calls,
                } = aggregate_counts;



                this.timeUsageReport = Chart.getTimeSeriesStackedFromJson(usage_time_history,{
                            title: 'App Usage Time',
                            plot_bgcolor: '#FFFFFF',
                            paper_bgcolor: '#FFFFFF',
                    labelMapping: {
                                'minutes_in_hmi_none': "Minutes in None"
                    }
                });


                this.userSelectionsReport = Chart.getTimeSeriesStackedFromJson(user_selection_history,{
                    title: 'App Usage Time',
                    plot_bgcolor: '#FFFFFF',
                    paper_bgcolor: '#FFFFFF',
                    labelMapping: {
                        'minutes_in_hmi_none': "Minutes in None"
                    }
                })
                // if (usage_time)
                // {
                //     this.usageTimeReport = Chart.getSmartChartFromJson(usage_time,{
                //         title: 'App Usage Time',
                //         plot_bgcolor: '#FFFFFF',
                //         paper_bgcolor: '#FFFFFF'
                //     });
                // }

                // if (count_of_user_selections)
                // {
                //     this.miscStats = Chart.getTableFromJson({
                //         count_of_user_selections,
                //         count_of_rejected_rpcs_calls
                //     },{
                //         isPercent: false,
                //         title: 'Other Stats',
                //         plot_bgcolor: '#FFFFFF',
                //         paper_bgcolor: '#FFFFFF',
                //         labelMapping: {
                //             count_of_user_selections: 'User Selections',
                //             count_of_rejected_rpcs_calls: 'RPC Rejections',
                //         }
                //     });
                // }


            }
        },
    };
    export default obj;

</script>
