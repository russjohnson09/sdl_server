<template>

    <div>
        <h4>Application Report For Past {{appReport.report_days}} Days</h4>


        <div class="row">
            <div class="col-sm-4"
                 style="min-width:350px"
            >
                <div v-if="usageTimeReport" >
                    <vue-plotly v-if="usageTimeReport"
                                :data="usageTimeReport.data"
                                :layout="usageTimeReport.layout"
                                :options="usageTimeReport.options"

                    />
                </div>
                <div v-else >
                    <img src="~@/assets/images/black_graphs/bargraphtall_blank.png" alt="No data"/>
                </div>

            </div>

            <div class="col-sm-4"
                 style="min-width:350px"
            >
                <div v-if="miscStats" >
                    <vue-plotly v-if="miscStats"
                                :data="miscStats.data"
                                :layout="miscStats.layout"
                                :options="miscStats.options"

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
    import Chart from "../Chart";

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
                usageTimeReport: null,
                miscStats: null,
                stackedCountsReport: null,
                lineChartRejectedRPCCalls: null,
                lineChartUserSelectionCounts: null,

                defaultWidth,
                defaultHeight

            };

            return obj;
        },
        methods: {
            getStackedReportFromHistoryReport(report,validTypes)
            {
                let datasets = this.getDataSetsFromHistoryReport(report,validTypes);

                let barchartStacked = {
                    type: 'bar-chart',
                    options: Chart.defaultOptions.stackedTimeSeries,
                    data: {
                        datasets,
                    }
                };
                return barchartStacked;
            },
            getDataSetsFromHistoryReport(report,validTypes)
            {
                let datasetsIndex = {};
                let datasets = [];
                if (report)
                {
                    for (let date in report)
                    {

                        let record = report[date];
                        for (let type in record)
                        {
                            if (validTypes && validTypes.indexOf(type) === -1)
                            {
                                continue;
                            }
                            if (datasetsIndex[type] == undefined)
                            {
                                datasetsIndex[type] = datasets.length;
                                datasets.push({
                                    label: type,
                                    backgroundColor: Chart.chartColors[datasets.length],
                                    data: []
                                })
                            }
                            let dataset = datasets[datasetsIndex[type]];

                            dataset.data.push({
                                x: date,
                                y: record[type]
                            })
                        }
                    }
                }

                return datasets;
            },
        },

        mounted (){

            if (this.appReport)
            {
                let {app,report_days,aggregate_counts} = this.appReport;
                let {usage_time,count_of_user_selections,count_of_rejected_rpcs_calls} = aggregate_counts;

                if (usage_time)
                {
                    let usePie = true;
                    if (usePie)
                    {
                        this.usageTimeReport = Chart.getSmartChartFromJson(usage_time,{
                            title: 'App Usage Time',
                            plot_bgcolor: '#FFFFFF',
                            paper_bgcolor: '#FFFFFF'
                        });
                    }
                    else {
                        this.usageTimeReport = Chart.getBarChartFromJson(usage_time,{
                            title: 'App Usage Time',
                            plot_bgcolor: '#FFFFFF',
                            paper_bgcolor: '#FFFFFF'
                        })
                    }
                }

                if (count_of_user_selections)
                {
                    this.miscStats = Chart.getTableFromJson({
                        count_of_user_selections,
                        count_of_rejected_rpcs_calls
                    },{
                        isPercent: false,
                        title: 'Other Stats',
                        plot_bgcolor: '#FFFFFF',
                        paper_bgcolor: '#FFFFFF',
                        labelMapping: {
                            count_of_user_selections: 'User Selections',
                            count_of_rejected_rpcs_calls: 'RPC Rejections',
                        }
                    });
                }


            }
        },
    };
    export default obj;

</script>
