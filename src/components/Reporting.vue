<!-- Copyright (c) 2018, Livio, Inc. -->
<template>
    <div class="container-fluid color-bg-gray">
        <div class="row">

            <page-side-nav/>
            <page-user-nav/>

            <main class="col-sm-9 ml-sm-auto col-md-10 pt-3 main-content" role="main">

                <div v-if="ENABLE_REPORTING">
                    <h4>Reporting</h4>
                    <div class="functional-content" v-if="aggregateReport">

                        <div class="form-row mb-0">
                            <h4 for="name">Report for the Last {{aggregateReport.report_days}} Days</h4>

                            <div class="row">
                                <div class="col-sm-12">



                                    <vue-plotly v-if="ptuChartStacked"
                                                  v-bind:data="ptuChartStacked.data"
                                                  v-bind:layout="ptuChartStacked.layout"
                                                  v-bind:options="ptuChartStacked.options"

                                    />

<!--                                    https://plot.ly/javascript/pie-charts/-->
<!--                                    https://plot.ly/~yusuf.sultan/119/pie-charts-5-labels-text-hoverinf/#/-->
                                    <vue-plotly v-if="ptuPieChart"
                                                v-bind:data="ptuPieChart.data"
                                                v-bind:layout="ptuPieChart.layout"
                                                v-bind:options="ptuPieChart.options"

                                    />

                                                                    <policy-table-update-report v-bind:policy_table_updates_by_trigger="aggregateReport.policy_table_updates_by_trigger"
                                                                                                v-bind:total_policy_table_updates_by_trigger="aggregateReport.total_policy_table_updates_by_trigger"

                                                                                                v-bind:total_device_os="aggregateReport.total_device_os"
                                                                                                v-bind:total_device_model="aggregateReport.total_device_model"
                                                                                                v-bind:total_device_carrier="aggregateReport.total_device_carrier"


                                                                    />


                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                <div v-if="!ENABLE_REPORTING">
                    Reporting is disabled.
                    <a class="fa fa-question-circle color-primary doc-link" v-b-tooltip.hover title="Click here for more info about this page" href="https://smartdevicelink.com/en/guides/sdl-server/getting-started/installation/" target="_blank"></a>
<!--                    <h4>About this Policy Server-->
<!--                       </h4>-->

                </div>


            </main>
        </div>
    </div>
</template>

<script>

    //http://demo.vue-chartjs.org/



    import Chart from "./common/reporting/Chart";
    import PlotlyHelper from "./common/reporting/plotly/PlotlyHelper";

    let obj = {
        data () {
            return {
                ENABLE_REPORTING: ENABLE_REPORTING,
                "aggregateReport": null,

                ptuChartStacked: null,
                ptuPieChart: null,
                ptuDonutChart: null


            }
        },
        computed: {
            fieldsDisabled: function () {
                return true;
            }
        },
        methods: {
            populateCharts() {
                let aggregateReport = this.aggregateReport;
                let {
                    total_policy_table_updates_by_trigger
                } = this.aggregateReport;





                let labelMapping = {
                    'mileage': 'Mileage',
                    'days': 'Days',
                    'ignition_cycle': 'Ignition Cycle'
                }

                let ptu = aggregateReport.policy_table_updates_by_trigger;


                let datasetsIndex = {};
                let datasets = [];

                /**
                 * ptu is indexed by date and then type. We want to split
                 * this into 3 datasets by type.
                 *
                 * TODO does it make sense to do this in the frontend?
                 */
                if (ptu)
                {
                    for (let date in ptu)
                    {

                        let record = ptu[date];
                        for (let type in record)
                        {
                            let label = type;
                            if (labelMapping && labelMapping[type]) {
                                label = labelMapping[type];
                            }

                            if (datasetsIndex[label] == undefined)
                            {
                                datasetsIndex[label] = datasets.length;
                                datasets.push({
                                    type: 'bar',
                                    name: label,
                                    marker: {
                                        color: Chart.chartColors[datasets.length],
                                    },
                                    // backgroundColor: Chart.chartColors[datasets.length],
                                    // data: [],
                                    x: [],
                                    y: []
                                })
                            }
                            let dataset = datasets[datasetsIndex[label]];


                            dataset.x.push(date);
                            dataset.y.push(ptu[date][type]);
                        }
                    }
                }

                let ptuTableTitle = 'Policy Table Updates By Trigger'
                this.ptuChartStacked = {
                    data: datasets,
                    layout : {barmode: 'stack',
                        title: ptuTableTitle,

                        xaxis: {range: ['2019-06-01','2019-07-01']},

                        yaxis: {
                            fixedrange: true
                        },
                        dragmode: 'pan'

                    },
                    options: {
                        yaxis: {
                            fixedrange: true
                        },
                        dragmode: 'pan'
                    }

                // options: Chart.defaultOptions.stackedTimeSeries,
                    // data: {
                    //     datasets,
                    // }
                };

                this.ptuChartStacked.options.toImageButtonOptions = {
                    filename: ptuTableTitle,
                    width: 800,
                    height: 600,
                    format: 'png'
                };

                // let data = [trace1,trace2];
                //
                // ptuChartStacked = {
                //     type: 'bar-chart',
                //     options: Chart.defaultOptions.stackedTimeSeries,
                //     data: {
                //         datasets,
                //     }
                // };



                if (total_policy_table_updates_by_trigger)
                {
                    this.ptuPieChart = PlotlyHelper.getPieChartFromJson(total_policy_table_updates_by_trigger,labelMapping);
                    // this.ptuPieChart.data.push(this.ptuChartStacked.data[0]);
                    this.ptuPieChart.layout = {
                        title: 'Policy Table Updates By Trigger',
                    };

                    this.ptuPieChart.options = {
                        toImageButtonOptions: {
                            filename: this.ptuPieChart.layout.title,
                            width: 800,
                            height: 600,
                            format: 'png'
                        }
                    }

                    // this.ptuPieChart = Chart.getBasicPieChartFromJson(this.total_policy_table_updates_by_trigger);
                    // this.ptuDonutChart = Chart.getBasicDonutChartFromJson(this.total_policy_table_updates_by_trigger);

                }
            }
        },
        created (){
            let self = this;
            self.httpRequest("get", "reporting/aggregate-report", {}, (err, response) => {
                if(err){
                    // error
                    console.error("Error receiving about info.");
                    console.error(response);
                }else{
                    // success
                    response.json().then(parsed => {
                        self.aggregateReport = parsed.data;
                        self.populateCharts();
                    });
                }
            });
        },
        mounted (){
        },
        beforeDestroy () {
        }
    };


    export default obj;


</script>
