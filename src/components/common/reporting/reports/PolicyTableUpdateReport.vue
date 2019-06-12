<template>

        <div>

            Daily Policy Table Updates
            <chart  v-bind:chart="stackedTimeSeries" />

            <chart v-if="ptuChartStacked" v-bind:chart="ptuChartStacked"></chart>

        </div>

</template>

<script>
    import Chart from "../Chart";

    let obj = {
        props: ['policy_table_updates_by_trigger'],
        data () {
            let obj = {
                stackedTimeSeries: Chart.exampleCharts.stackedTimeSeries,
                ptuChartStacked: null
            };

            return obj;
        },
        mounted (){

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
