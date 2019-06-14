<!-- Copyright (c) 2018, Livio, Inc. -->
<template>
    <div class="container-fluid color-bg-gray">
        <div class="row">

            <page-side-nav/>
            <page-user-nav/>

            <main class="col-sm-9 ml-sm-auto col-md-10 pt-3 main-content" role="main">
                <h4>Reporting</h4>

                <div class="functional-content" v-if="aggregateReport">

                    <div class="form-row mb-0">
                        <h4 for="name">Report for the Last {{aggregateReport.report_days}} Days</h4>

                        <div class="row">
                            <div class="col-sm-12">


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

            </main>
        </div>
    </div>
</template>

<script>

    //http://demo.vue-chartjs.org/



    import Chart from "../common/reporting/Chart";

    let obj = {
        data () {
            return {
                "aggregateReport": null,
            }
        },
        computed: {
            fieldsDisabled: function () {
                return true;
            }
        },
        methods: {
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
