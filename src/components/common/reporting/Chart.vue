<template>


    <div v-if="chart.type === 'line-chart'">
        <line-chart/>

    </div>
    <div v-else-if="chart.type === 'bar-chart'">
        <bar-chart v-bind:chart="chart"/>
    </div>
    <div v-else-if="chart.type === 'pie-chart'">
        <pie-chart v-bind:chart="chart"/>

    </div>
    <div v-else-if="chart.type === 'donut-chart'">
        <donut-chart v-bind:chart="chart"/>

    </div>
    <div v-else-if="chart.type === 'polar-chart'">
        <polar-chart v-bind:chart="chart"/>

    </div>
    <div v-else>
        {{chart.type}} not supported
    </div>

</template>

<script>
    // Can not find Chart object.
    // (anonymous)
    // import 'chartjs-plugin-labels';
    //chartjs-plugin-labels

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
        0: chartColors.brown,
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

    //https://codepen.io/kasiditp/pen/jwBqBZ
    //pie chart label
    //npm install chartjs-plugin-labels
    let obj =
    {
        getBasicDonutChartFromJson(json)
        {
            let chart = obj.getBasicPieChartFromJson(json);
            chart.type = 'donut-chart';
            return chart;
        },
        getBasicPolarChartFromJson(json)
        {
          let chart = obj.getBasicPieChartFromJson(json);
          chart.type = 'polar-chart';
          return chart;
        },
        getBasicPieChartFromJson(json)
        {
            let data = [];
            let labels = [];
            let backgroundColor = [];
            //
            // if (!false)
            // {
            //     return {
            //         type: 'pie-chart',
            //         options: {
            //
            //         },
            //         data: {
            //             datasets: [
            //                 {
            //                     data: [1,3,4],
            //                     backgroundColor: [
            //                         chartColors[0],
            //                         chartColors[1],
            //                         chartColors[2],
            //
            //
            //                     ]
            //                 }
            //             ],
            //             labels: ['l1','l2']
            //         },
            //     }
            // }

            for (let key in json)
            {
                labels.push(key);
                backgroundColor.push(chartColors[data.length]);
                data.push(json[key]);
            }

            let chart = {
                type: 'pie-chart',
                options: {
                    maintainAspectRatio: false, //allow resizing
                    pieceLabel: {
                        mode: 'percentage',
                        precision: 1
                    },
                    tooltips: {
                        // enabled: false
                    },
                    plugins: {
                        datalabels: {
                            formatter: (value, ctx) => {
                                console.log(`get datalabel`,value)
                                let sum = 0;
                                let dataArr = ctx.chart.data.datasets[0].data;
                                dataArr.map(data => {
                                    sum += data;
                                });
                                let percentage = (value*100 / sum).toFixed(2)+"%";
                                return percentage;
                            },
                            color: '#fff',
                        }
                    }
                },
                data: {
                    datasets: [
                        {
                            data,
                            backgroundColor
                        }
                    ],
                    labels
                },
            };

            return chart


        },
        extends: Chart,
        props: ['chart'],
        mounted() {
            // this.type = this.chart.type
        },
        defaultOptions,
        chartColors,
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
