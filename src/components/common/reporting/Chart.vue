<template>



    <div v-if="type === 'line-chart'">
        <line-chart />

    </div>
    <div v-else-if="type === 'B'">
        B
    </div>
    <div v-else-if="type === 'C'">
        C
    </div>
    <div v-else>
        Not A/B/C

        {{type}}
    </div>

</template>

<script>
    import { Line } from 'vue-chartjs'

    export default {
        props: [
            'type',
            'options'],
        mounted () {

            // let options = this.options;
            // options = {
            //     "datasets": [
            //         {
            //             "label": "GitHub Commits",
            //             "backgroundColor": "#f87979",
            //             "data": [
            //                 {
            //                     "x": "2016-12-25",
            //                     "y": 20
            //                 },
            //                 {
            //                     "x": "2016-12-26",
            //                     "y": 10
            //                 },
            //                 {
            //                     "x": "2016-12-27",
            //                     "y": 10
            //                 }
            //             ]
            //         }
            //     ]
            // };
            //
            // // options = {
            // //     labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            // //     datasets: [
            // //         {
            // //             label: 'GitHub Commits',
            // //             backgroundColor: '#f87979',
            // //             data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11]
            // //         }
            // //     ]
            // // };
            //
            // console.log(`linechart`,options,this.options);
            // //TODO default options,
            // this.renderChart(
            //     options
            // )
        }
    }
</script>
