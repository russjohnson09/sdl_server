<!-- Copyright (c) 2018, Livio, Inc. -->

<!--https://community.rstudio.com/t/how-can-i-generate-this-kind-of-polar-chart-in-r-studio/2158/4-->
<template>
    <div class="container-fluid color-bg-gray">
        <div class="row">

            <page-side-nav/>
            <page-user-nav/>

            <main class="col-sm-9 ml-sm-auto col-md-10 pt-3 main-content" role="main">

                <div v-if="ENABLE_REPORTING">
                    <h2>Reporting</h2>
                    <!--                    class="functional-content" v-if="aggregateReport"-->
                    <div v-if="aggregateReport">

                        <!--                         class="form-row mb-0"-->
                        <div>
                            <h3>Policy Table Updates</h3>

                            <div style="width:20%">
                                <chartist
                                        ratio="ct-major-second"
                                        type="Line"
                                        :data="chartist.line.data"
                                        :options="chartist.line.options" />
                            </div>


                            <div class="row">
                                <div class="col-sm-3">

                                    <chartist
                                            ratio="ct-major-second"
                                            type="Line"
                                            :data="chartist.line.data"
                                            :options="chartist.line.options" />
                                </div>

                                <div class="col-sm-3">

                                    <chartist
                                            ratio="ct-major-second"
                                            type="Line"
                                            :data="chartist.line.data"
                                            :options="chartist.line.options" />
                                </div>

                                <div class="col-sm-3">

                                    <chartist
                                            ratio="ct-major-second"
                                            type="Line"
                                            :data="chartist.line.data"
                                            :options="chartist.line.options" />
                                </div>
                            </div>


                            <!--                            <h4 for="name">Report for the Last {{aggregateReport.report_days}} Days</h4>-->

                            <div class="row">
                                <div class="col-sm-12">

                                    <vue-plotly v-if="ptuChartStacked"
                                                :data="ptuChartStacked.data"
                                                :layout="ptuChartStacked.layout"
                                                :options="ptuChartStacked.options"

                                    />
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-4"
                                     style="min-width:350px"
                                >
                                    <div
                                            v-if="ptuPieChart">
                                        <vue-plotly v-if="ptuPieChart"
                                                    :data="ptuPieChart.data"
                                                    :layout="ptuPieChart.layout"
                                                    :options="ptuPieChart.options"

                                        />
                                    </div>

                                </div>
                            </div>

                            <h3>Devices</h3>
                            <div class="row">
                                <div class="col-sm-6" style="min-width:550px"
                                >
                                    <vue-plotly v-if="deviceOsPie"
                                                :data="deviceOsPie.data"
                                                :layout="deviceOsPie.layout"
                                                :options="deviceOsPie.options"

                                    />

                                </div>

                                <div class="col-sm-6" style="min-width:550px"
                                >

                                    <chart v-if="deviceOsPie2"
                                           :chart="deviceOsPie2"

                                    />

                                </div>
                                <div class="col-sm-6" style="min-width:550px"
                                >


                                    <vue-plotly v-if="modelPie"
                                                :data="modelPie.data"
                                                :layout="modelPie.layout"
                                                :options="modelPie.options"

                                    />
                                </div>


                                <div class="col-sm-6" style="width:550px"
                                >


                                    <chart v-if="modelPie2"
                                           :chart="modelPie2"

                                    />
                                </div>


                            </div>

                            <div class="row">

                                <div class="col-sm-6" style="width:550px"
                                >


                                    <vue-plotly v-if="carrierPie"
                                                :data="carrierPie.data"
                                                :layout="carrierPie.layout"
                                                :options="carrierPie.options"

                                    />
                                </div>

                                <div class="col-sm-6" style="width:550px"
                                >


                                    <chart v-if="carrierPie2"
                                                :chart="carrierPie2"

                                    />
                                </div>
                            </div>
                            <div class="row">

<!--                                 style="width:550px"-->
                                <div class="col-sm-6"
                                >


<!--                                    <chart v-if="carrierChart3"-->
<!--                                           :chart="carrierChart3"-->

<!--                                    />-->

                                    <vue-plotly v-if="carrierChart3"
                                                :data="carrierChart3.data"
                                                :layout="carrierChart3.layout"
                                                :options="carrierChart3.options"

                                    />
                                </div>
                            </div>


                        </div>
                    </div>


                </div>


                <div v-if="!ENABLE_REPORTING">
                    Reporting is disabled.
                    <a class="fa fa-question-circle color-primary doc-link" v-b-tooltip.hover
                       title="Click here for more info about this page"
                       href="https://smartdevicelink.com/en/guides/sdl-server/getting-started/installation/"
                       target="_blank"></a>
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
        data() {
            return {
                ENABLE_REPORTING: ENABLE_REPORTING,
                "aggregateReport": null,

                ptuChartStacked: null,
                ptuPieChart: null,
                ptuDonutChart: null,

                deviceOsPie: null,
                deviceOsPie2: null,

                modelPie: null,
                modelPie2: null,

                carrierPie: null,
                carrierPie2: null,
                carrierChart3: null,

                chartData: {
                    labels: ["A", "B", "C"],
                    series:[[1, 3, 2], [4, 6, 5]]
                },
                chartOptions: {
                    lineSmooth: false
                },

                chartist: {
                    line: {
                        data: {
                            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                            series: [
                                [12, 9, 7, 8, 5],
                                [2, 1, 3.5, 7, 3],
                                [1, 3, 4, 5, 6]
                            ]
                        },
                        options: {
                            // fullWidth: true,
                            // chartPadding: {
                            //     right: 40
                            // }
                        }
                    }
                }


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
                    total_policy_table_updates_by_trigger,
                    total_device_os,
                    total_device_carrier,
                    total_device_model,
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
                if (ptu) {
                    for (let date in ptu) {

                        let record = ptu[date];
                        for (let type in record) {
                            let label = type;
                            if (labelMapping && labelMapping[type]) {
                                label = labelMapping[type];
                            }

                            if (datasetsIndex[label] == undefined) {
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

                let ptuTableTitle = 'Policy Table Updates By Trigger';
                this.ptuChartStacked = {
                    data: datasets,
                    layout: {
                        barmode: 'stack',
                        title: ptuTableTitle,

                        xaxis: {range: ['2019-06-01', '2019-07-01']},

                        yaxis: {
                            fixedrange: true
                        },
                        dragmode: 'pan'

                    },
                    options: {
                        yaxis: {
                            fixedrange: true
                        },
                        dragmode: 'pan',
                        responsive: true,

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


                if (total_policy_table_updates_by_trigger) {
                    this.ptuPieChart = PlotlyHelper.getPieChartFromJson(total_policy_table_updates_by_trigger, labelMapping);
                    // this.ptuPieChart = PlotlyHelper.getDonutChartFromJson(total_policy_table_updates_by_trigger,labelMapping);

                    // this.ptuPieChart.data.push(this.ptuChartStacked.data[0]);
                    this.ptuPieChart.layout = {
                        title: 'Policy Table Updates By Trigger',
                    };

                    //https://plot.ly/javascript/responsive-fluid-layout/
                    this.ptuPieChart.options = {
                        responsive: true,
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


                if (total_device_os) {

                    let pieChart = PlotlyHelper.getPieChartFromJson(total_device_os, labelMapping);
                    pieChart.layout.title = 'Device OS';
                    pieChart.options = {
                        responsive: true,

                        toImageButtonOptions: {
                            filename: pieChart.layout.title,
                            width: 800,
                            height: 600,
                            format: 'png'
                        }
                    };
                    this.deviceOsPie = pieChart;
                }


                if (total_device_model) {
                    // let pieChart = PlotlyHelper.getPieChartFromJson(total_device_model, labelMapping);

                    // let pieChart = PlotlyHelper.getStackedBarChartFromJson(total_device_model, labelMapping);

                    let pieChart = PlotlyHelper.getTableFromJson(total_device_model, labelMapping,{
                        headerValues: [
                            "Device Model",
                            "Total",
                            "Percent Total"
                        ]
                    });

                    pieChart.layout.title = 'Device Model';

                    // pieChart.layout = {
                    //     title:
                    // };
                    pieChart.options = {
                        responsive: true,

                        toImageButtonOptions: {
                            filename: pieChart.layout.title,
                            width: 800,
                            height: 600,
                            format: 'png'
                        }
                    };
                    this.modelPie = pieChart;

                    // this.modelPie = Chart.getBasicPieChartFromJson(this.total_device_model);

                }

                //https://community.rstudio.com/t/how-can-i-generate-this-kind-of-polar-chart-in-r-studio/2158/5
                if (total_device_carrier) {
                    let pieChart = PlotlyHelper.getPieChartFromJson(total_device_carrier, labelMapping);
                    pieChart.layout.title = 'Device Carrier';

                    // pieChart.layout = {
                    //     title: 'Device Carrier',
                    // };
                    pieChart.options = {
                        responsive: true,

                        toImageButtonOptions: {
                            filename: pieChart.layout.title,
                            width: 800,
                            height: 600,
                            format: 'png'
                        }
                    };
                    this.carrierPie = pieChart;
                }



                if (total_device_carrier)
                {
                    this.carrierPie2 = Chart.getBasicPieChartFromJson(total_device_carrier);

                }


                if (total_device_carrier)
                {
                    // this.carrierChart3 = Chart.getBarChartFromJson(total_device_carrier);
                    // this.carrierChart3 = Chart.getStackedBarPlotly(total_device_carrier,{
                    //     name: 'Device Breakdown',
                    //
                    // });

                    this.carrierChart3 = Chart.getBarChartPlotly(total_device_carrier,{
                        name: 'Device Breakdown',
                        title: 'Carriers By %',
                        xTitle: ''

                    });

                    // this.carrierChart3 = Chart.getHorizontalStackedBarPlotly(total_device_carrier,{
                    //     name: 'Device Breakdown',
                    //
                    // });

                }

                if (total_device_model)
                {
                    this.modelPie2 = Chart.getBasicPieChartFromJson(total_device_model);

                }

                if (total_device_os)
                {
                    this.deviceOsPie2 = Chart.getBasicPieChartFromJson(total_device_os);

                }


            }
        },
        created() {
            let self = this;
            self.httpRequest("get", "reporting/aggregate-report", {}, (err, response) => {
                if (err) {
                    // error
                    console.error("Error receiving about info.");
                    console.error(response);
                } else {
                    // success
                    response.json().then(parsed => {
                        self.aggregateReport = parsed.data;
                        self.populateCharts();
                    });
                }
            });
        },
        mounted() {
        },
        beforeDestroy() {
        }
    };


    export default obj;


</script>
