<!-- Copyright (c) 2018, Livio, Inc. -->
<template>
    <div class="container-fluid color-bg-gray">
        <div class="row">

            <page-side-nav/>
            <page-user-nav/>

            <main class="col-sm-9 ml-sm-auto col-md-10 pt-3 main-content" role="main">
                <h4>Reporting</h4>

                <div class="functional-content" v-if="appReport">

                    <div class="form-row mb-0">
                        <h4 for="name"> application reports
                            <application-reports
                            v-bind:usage_and_error_counts_history="appReport.usage_and_error_counts_history"
                            />
                        </h4>
                        <div class="row">
                            <div class="col-sm-12">


                            </div>
                        </div>
                    </div>


                </div>

            </main>
        </div>
    </div>
</template>

<script>

    //http://demo.vue-chartjs.org/


    import Chart from "../common/Chart";

    let obj = {
        data() {
            return {
                "appReport": null,
            }
        },
        computed: {},
        methods: {
            populateAppReport: function () {
                this.httpRequest("get", "reporting/application-report/" + this.$route.params.id, null,
                    (err, response) => {
                        if (err) {
                            // error
                            console.error("Error receiving application.");
                            console.error(response);
                        } else {
                            // success
                            response.json().then(parsed => {
                                this.appReport = parsed.data;
                            });
                        }
                    });
            },
            getStackedReportFromHistoryReport(report)
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

                let barchartStacked = {
                    type: 'bar-chart',
                    options: Chart.defaultOptions.stackedTimeSeries,
                    data: {
                        datasets,
                    }
                };
                return barchartStacked;
            }
        },
        created() {
            let self = this;
            self.populateAppReport();
        },
        mounted() {
        },
        beforeDestroy() {
        }
    };


    export default obj;


</script>
