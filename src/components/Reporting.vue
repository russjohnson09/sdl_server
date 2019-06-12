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



                            </div>
                        </div>
                    </div>


<pre>{{aggregateReportString}}
</pre>


                </div>

            </main>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                "aggregateReport": null,
            }
        },
        computed: {
            fieldsDisabled: function () {
                return true;
            },
            aggregateReportString: function()
            {
                return JSON.stringify(this.aggregateReport,null,' ');
            }
        },
        methods: {
        },
        created (){
            this.httpRequest("get", "reporting/aggregate-report", {}, (err, response) => {
                if(err){
                    // error
                    console.log("Error receiving about info.");
                    console.log(response);
                }else{
                    // success
                    response.json().then(parsed => {
                        console.log(`got parse json`,parsed);
                        this.aggregateReport = parsed.data;

                        // this.about = parsed.data;
                        // this.about.webhook_url = this.about.base_url + "/api/v1/webhook";
                    });
                }
            });
        },
        mounted (){
        },
        beforeDestroy () {
        }
    }
</script>
