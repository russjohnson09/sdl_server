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

<!--                                    <plotly-chart-->
<!--                                    v-bind:data="[{ x: [1, 3], y: [2, 4] }]"-->
<!--                                    />-->
<!--                                    <plotly-bar-chart />-->

                                    <plotly-chart v-if="ptuChartStacked"
                                            v-bind:data="ptuChartStacked.data"
                                            v-bind:layout="ptuChartStacked.layout"
                                            v-bind:options="ptuChartStacked.options"

                                    />

<!--                                                                    <policy-table-update-report v-bind:policy_table_updates_by_trigger="aggregateReport.policy_table_updates_by_trigger"-->
<!--                                                                                                v-bind:total_policy_table_updates_by_trigger="aggregateReport.total_policy_table_updates_by_trigger"-->

<!--                                                                                                v-bind:total_device_os="aggregateReport.total_device_os"-->
<!--                                                                                                v-bind:total_device_model="aggregateReport.total_device_model"-->
<!--                                                                                                v-bind:total_device_carrier="aggregateReport.total_device_carrier"-->


<!--                                                                    />-->


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

    let obj = {
        data () {
            return {
                ENABLE_REPORTING: ENABLE_REPORTING,
                "aggregateReport": null,

                ptuChartStacked: null,


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
                            if (datasetsIndex[type] == undefined)
                            {
                                datasetsIndex[type] = datasets.length;
                                datasets.push({
                                    type: 'bar',
                                    name: type,
                                    marker: {
                                        color: Chart.chartColors[datasets.length],
                                    },
                                    // backgroundColor: Chart.chartColors[datasets.length],
                                    // data: [],
                                    x: [],
                                    y: []
                                })
                            }
                            let dataset = datasets[datasetsIndex[type]];
                            dataset.x.push(date);
                            dataset.y.push(record[type]);


                            // var trace1 = {
                            //     x: [1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012],
                            //     y: [219, 146, 112, 127, 124, 180, 236, 207, 236, 263, 350, 430, 474, 526, 488, 537, 500, 439],
                            //     name: 'Rest of world',
                            //     marker: {color: 'rgb(55, 83, 109)'},
                            //     type: 'bar'
                            // };
                            //
                            // var trace2 = {
                            //     x: [1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012],
                            //     y: [16, 13, 10, 11, 28, 37, 43, 55, 56, 88, 105, 156, 270, 299, 340, 403, 549, 499],
                            //     name: 'China',
                            //     marker: {color: 'rgb(26, 118, 255)'},
                            //     type: 'bar'
                            // };
                            //
                            // dataset.data.push({
                            //     x: date,
                            //     y: record[type]
                            // })
                        }
                    }
                }

                this.ptuChartStacked = {
                    data: datasets,
                    layout : {barmode: 'stack',

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

                // let data = [trace1,trace2];
                //
                // ptuChartStacked = {
                //     type: 'bar-chart',
                //     options: Chart.defaultOptions.stackedTimeSeries,
                //     data: {
                //         datasets,
                //     }
                // };
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
