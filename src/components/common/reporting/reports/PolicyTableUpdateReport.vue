<template>

        <div>

            <div v-if="carrierPolar" >

                Carriers
                <chart
                        :width="300" :height="300"
                        v-if="carrierPolar" v-bind:chart="carrierPolar"></chart>

            </div>

            <div v-if="modelPie" >

                Models
                <chart
                        :width="300" :height="300"
                        v-if="modelPie" v-bind:chart="modelPie"></chart>
                <chart v-if="modelPie" v-bind:chart="modelPie"></chart>

            </div>

            <div v-if="deviceOsPie" >

                Device OS
                <chart v-if="deviceOsPie" v-bind:chart="deviceOsPie"></chart>

            </div>

            Daily Policy Table Updates

            <chart v-if="modelPie" v-bind:chart="modelPie"></chart>
            <chart v-if="modelPie" v-bind:chart="modelPie"></chart>

            <chart v-if="ptuDonutChart" v-bind:chart="ptuDonutChart"></chart>
            <chart v-if="ptuPieChart" v-bind:chart="ptuPieChart"></chart>

            <chart v-if="ptuChartStacked" v-bind:chart="ptuChartStacked"></chart>



        </div>

</template>

<script>
    import Chart from "../Chart";

    let obj = {
        props: ['policy_table_updates_by_trigger','total_policy_table_updates_by_trigger',
        'total_device_os',
        'total_device_model',
        'total_device_carrier'],
        data () {
            let obj = {
                stackedTimeSeries: Chart.exampleCharts.stackedTimeSeries,
                ptuChartStacked: null,
                ptuPieChart: null,
                ptuDonutChart: null,
                deviceOsPie: null,
                modelPie: null,
                carrierPolar: null,

            };

            return obj;
        },
        mounted (){

            if (this.total_policy_table_updates_by_trigger)
            {
                this.ptuPieChart = Chart.getBasicPieChartFromJson(this.total_policy_table_updates_by_trigger);
                this.ptuDonutChart = Chart.getBasicDonutChartFromJson(this.total_policy_table_updates_by_trigger);

            }

            if (this.total_device_os)
            {
                this.deviceOsPie = Chart.getBasicPieChartFromJson(this.total_device_os);
            }
            if (this.total_device_model)
            {
                this.modelPie = Chart.getBasicPieChartFromJson(this.total_device_model);

            }

            if (this.total_device_carrier)
            {
                this.carrierPolar = Chart.getBasicPolarChartFromJson(this.total_device_carrier);
                console.log(`carrierPolar`,this.total_device_carrier);
            }

            let ptuChartStacked;

            let ptu = this.policy_table_updates_by_trigger;
            console.log(`policy-table-update-report`,ptu);

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

            ptuChartStacked = {
                type: 'bar-chart',
                options: Chart.defaultOptions.stackedTimeSeries,
                data: {
                    datasets,
                }
            };

            console.log(`policy-table-update-report`,datasets,ptuChartStacked);


            this.ptuChartStacked = ptuChartStacked
        },
    };
    export default obj;

</script>
