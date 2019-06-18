<template>

    <div>


        <pre>{{appReport}}</pre>

        <h4>Application Report For Past {{appReport.report_days}} Days</h4>

<!--        <h5>App Usage</h5>-->
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
            getLineChartFromHistoryReport(report,validTypes)
            {
                let datasets = this.getDataSetsFromHistoryReport(report,validTypes);

                let chart = {
                    type: 'line-chart',
                    options: Chart.defaultOptions.stackedTimeSeries,
                    data: {
                        datasets,
                    }
                };
                return chart;

            }
        },

        mounted (){

            if (this.appReport)
            {
                let {app,report_days,aggregate_counts} = this.appReport;
                let {usage_time} = aggregate_counts;

                if (usage_time)
                {
                    this.usageTimeReport = Chart.getSmartChartFromJson(usage_time,{
                        title: 'App Usage Time',
                        plot_bgcolor: '#FFFFFF',
                        paper_bgcolor: '#FFFFFF'
                    })
                }

            }

            // if (this.usage_and_error_counts_history)
            // {
            //     this.stackedUsageReport = this.getStackedReportFromHistoryReport(this.usage_and_error_counts_history,
            //         [
            //             'minutes_in_hmi_background',
            //             'minutes_in_hmi_full',
            //             'minutes_in_hmi_limited',
            //             'minutes_in_hmi_none'
            //         ]
            //     );
            //
            //     this.stackedCountsReport = this.getStackedReportFromHistoryReport(
            //         this.usage_and_error_counts_history,
            //         [
            //             'count_of_rejected_rpcs_calls',
            //             'count_of_user_selections'
            //         ]
            //     );
            //
            //     this.lineChartRejectedRPCCalls = this.getLineChartFromHistoryReport(
            //         this.usage_and_error_counts_history,
            //         [
            //             'count_of_rejected_rpcs_calls',
            //             'count_of_user_selections'
            //         ]
            //     )
            //
            // }
        },
    };
    export default obj;

</script>
