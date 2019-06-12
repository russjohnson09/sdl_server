<template>


    <div v-if="chart.type === 'line-chart'">
        <line-chart/>

    </div>
    <div v-else-if="chart.type === 'bar-chart'">
        bar chart
        <bar-chart v-bind:chart="chart"/>
    </div>
    <div v-else-if="chart.type === 'C'">
        C
    </div>
    <div v-else>
        Not A/B/C

        {{type}}
    </div>

</template>

<script>
    //https://coolors.co/app
    import {Chart} from 'vue-chartjs'

    // let colors = Chart.helpers.color;
    //https://coolors.co/export/pdf/aeb4a9-e0c1b3-d89a9e-c37d92-846267
    let chartColors = {
        green: '#aeb4a9',
        red: '#c37d92',
        orange: '#e0c1b3',
        brown: '#846267'
    };

    chartColors = {
        1: chartColors.red,
        2: chartColors.green,
        3: chartColors.orange,
    };

    let defaultOptions = {
        stackedTimeSeries:
            {
                scales: {
                    xAxes: [{
                        stacked: true,
                        type: "time",
                        time: {
                            unit: 'day',
                            round: 'day',
                            displayFormats: {
                                day: 'MMM D'
                            }
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
    };

    let exampleDataSets = {
        simpleTimeSeries1: {
            // stacked: true,
            label: "Simple 1",
            data: [{
                x: '2017-03-01', //can also use date. need to be cautious of timezones
                y: 1
            }, {
                x: '2017-03-02',
                y: 2
            }, {
                x: '2017-03-03',
                y: 3
            }, {
                x: '2017-03-04',
                y: 4
            }],
            backgroundColor: chartColors[1]
        },
        simpleTimeSeries2: {
            label: "Simple 2",
            data: [{
                x: '2017-03-01',
                y: 1
            }, {
                x: '2017-03-02',
                y: 2
            }, {
                x: '2017-03-03',
                y: 3
            }, {
                // x: '2017-03-04',
                x: '2017-03-04',
                y: 4
            }],
            backgroundColor: chartColors[2]
        },
        simpleTimeSeries3: {
            label: "Simple 3",
            data: [{
                x: '2017-03-01',
                y: 1
            }, {
                x: '2017-03-02',
                y: 2
            }, {
                x: '2017-03-03',
                y: 3
            }, {
                x: '2017-03-04',
                y: 4
            }],
            backgroundColor: chartColors[3]
        }
    };

    let obj =
    {
        extends: Chart,
        props: ['chart'],
        mounted() {
            // this.type = this.chart.type
        },
        defaultOptions,
        exampleCharts: {
            stackedTimeSeries: {
                type: 'bar-chart',
                options: defaultOptions.stackedTimeSeries,
                data: {
                    datasets: [
                        exampleDataSets.simpleTimeSeries1,
                        exampleDataSets.simpleTimeSeries2,
                        exampleDataSets.simpleTimeSeries3,
                        // {
                    //     label: "Dataset 2",
                    //     data: [{
                    //         x: new Date('2017-03-01'),
                    //         y: 1
                    //     }, {
                    //         x: new Date('2017-03-02'),
                    //         y: 2
                    //     }, {
                    //         x: new Date('2017-03-03'),
                    //         y: 3
                    //     }, {
                    //         x: new Date('2017-03-04'),
                    //         y: 4
                    //     }],
                    //     backgroundColor: "blue"
                    // }
                    ]
                },

            },

        }
    };

    export default obj;
</script>
