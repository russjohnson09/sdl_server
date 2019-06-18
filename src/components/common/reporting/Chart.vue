<template>


    <div v-if="chart.type === 'line-chart'">
        <line-chart

                v-bind:chart="chart"
                v-bind:height="height"
                v-bind:width="width"
        />

    </div>
    <div v-else-if="chart.type === 'bar-chart'">
        <bar-chart
                v-bind:chart="chart"
                v-bind:height="height"
                v-bind:width="width"
        />
    </div>
    <div v-else-if="chart.type === 'pie-chart'">
        <pie-chart
                v-bind:chart="chart"
                    v-bind:height="height"
                   v-bind:width="width"
        />

    </div>
    <div v-else-if="chart.type === 'donut-chart'">
        <donut-chart
                v-bind:chart="chart"
                v-bind:height="height"
                v-bind:width="width"
                />

    </div>
    <div v-else-if="chart.type === 'polar-chart'">
        <polar-chart v-bind:chart="chart"/>

    </div>
    <div v-else>
        {{chart.type}} not supported
    </div>

</template>

<script>

    let plugins_default_text = {
        labels: {
// render 'label', 'value', 'percentage', 'image' or custom function, default is 'percentage'
//                     render: 'value',

            render: 'percentage',

            // render: 'percentage',
            // precision for percentage, default is 0
            precision: 0,

            // identifies whether or not labels of value 0 are displayed, default is false
            showZero: true,

            // font size, default is defaultFontSize
            fontSize: 15,

            // font color, can be color array for each data or function for dynamic color, default is defaultFontColor
            fontColor: '#fff',

            // font style, default is defaultFontStyle
            fontStyle: 'bold',

            // font family, default is defaultFontFamily
            fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // draw text shadows under labels, default is false
            textShadow: true,

            // text shadow intensity, default is 6
            // shadowBlur: 10,

            // text shadow X offset, default is 3
            // shadowOffsetX: -5,

            // text shadow Y offset, default is 3
            // shadowOffsetY: 5,

            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,

            // text shadow color, default is 'rgba(0,0,0,0.3)'
            shadowColor: 'rgba(0,0,0,1)',

            // draw label in arc, default is false
            // bar chart ignores this
            // arc: true,

            // position to draw label, available value is 'default', 'border' and 'outside'
            // bar chart ignores this
            // default is 'default'
            position: 'default',

            // draw label even it's overlap, default is true
            // bar chart ignores this
            overlap: true,

            // show the real calculated percentages from the values and don't apply the additional logic to fit the percentages to 100 in total, default is false
            showActualPercentages: true,

            // set images when `render` is 'image'
            images: [
                {
                    src: 'image.png',
                    width: 16,
                    height: 16
                }
            ],

            // add padding when position is `outside`
            // default is 2
            outsidePadding: 4,

            // add margin of text when position is `outside` or `border`
            // default is 2
            textMargin: 4

        }
    };


    // #SDL Server
    // ##Statistics Recording & Visualizations - UI Colors

    let chartColors = {
        positive: `#76c26a`,
        negative: `#ff5e71`,
        neutral: `#b8c5cf`,
        // red: '#DD1B16'
        // green: '#aeb4a9',
        // red: '#c37d92',
        // orange: '#e0c1b3',
        // brown: '#846267'
    };
    // __Pos__
    //     `#76c26a`
    //
    // __Neg__
    //     `#ff5e71`
    //
    // __Null__
    //     `#b8c5cf`

    // ####Sequential Hierarchical Datasets
        let sequential_colors = [
        `#f68b47`,

        `#43a37b`,

        `#3e566a`,

        `#07151f`,

        `#b8c5cf`,

        `#50bbb8`,

        `#5c93ca`,

        `#ffc45c`,

        `#98c8e8`,

        `#c58dbf`,

        `#f0576b`,

        `#ffa2d3`,

        `#adadad`,

        `#245996`,

        `#a1c9ff`,

        `#ff978a`,

        `#8198aa`,

        `#aba6ff`,

        `#d3b38e`,

        `#007d92`,
            ];

    chartColors = Object.assign(chartColors,sequential_colors);

    let defaultLayout = {
        plot_bgcolor: '#F4F5F7',
        paper_bgcolor: "#F4F5F7",
    }

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

    let self;
    let obj = self =
        {
            getTimeSeriesStackedFromJson(json,options)
            {
                options = options || {};
                let defaultOptions = {
                    title: ''
                };
                options = Object.assign({

                },defaultOptions,options);
                let {name,labelMapping} = options;

                let datasetsIndex = {};
                let datasets = [];

                let start_x;
                let end_x;

                let dates = [];
                /**
                 * json is indexed by date and then type. We want to split
                 * this into datasets by type
                 *
                 * assumes date is already sorted at this point.
                 *
                 */
                for (let date in json) {
                    dates.push(date);
                    // if (!start_x)
                    // {
                    //     start_x = end_x = date;
                    // }
                    // else {
                    //     end_x = date;
                    // }

                    let record = json[date];
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
                                    color: chartColors[datasets.length],
                                },
                                x: [],
                                y: []
                            })
                        }
                        let dataset = datasets[datasetsIndex[label]];


                        dataset.x.push(date);
                        dataset.y.push(json[date][type]);
                    }
                }

                //get the 30 most recent days.
                let end_date = dates.pop();
                let start_date = dates[Math.max(0,dates.length - 30)];


                let chart = {
                    data: datasets,

                    layout: {
                        plot_bgcolor: '#F4F5F7',
                        paper_bgcolor: "#F4F5F7",
                        barmode: 'stack',
                        title: options.title,

                        xaxis: {range: [start_date, end_date]},

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
                        toImageButtonOptions: {
                            filename: options.title,
                                width: 800,
                                height: 600,
                                format: 'png'
                        }
                    }

                };


                return chart;





            },
            getTableFromJson(obj,options)
            {
                options = options || {};

                let defaultOptions = {

                };

                let headers = options.headerValues || (function() {
                    return [
                        // options.title,
                        'Name',
                        'Percent',
                        'Count',
                    ]
                })();

                let total = 0;

                let labelMapping = {options};


                let percentValues = [];

                let itemNames = [];



                let values = [];

                let keyCount = 0;

                for (let key in obj)
                {
                    keyCount++;
                    let value = +obj[key];
                    total += value;
                    values.push(value);

                    if (labelMapping && labelMapping[key])
                    {
                        itemNames.push(labelMapping[key]);

                    }
                    else {
                        itemNames.push(key);
                    }
                }

                for (let value of values)
                {
                    let percent = (((value / total) * 100)).toFixed(0) + '%';
                    percentValues.push(percent);

                }

                let textinfo = 'label+percent';

                let maxLabelCount = 20;
                if (keyCount > maxLabelCount)
                {
                    textinfo = 'text';
                }
                let data = [
                    {
                        type: 'table',
                        header: {
                            values: headers,
                            align: 'center',
                            line: {width: 1, color: 'black'},
                            // fill: {color: "grey"},
                            // fill: {color: '#119DFF'},
                            // fill: {color: sequential_colors[0]},

                            // font: {family: "Arial", size: 12, color: "white"},
                            font: {family: "Arial", size: 12, color: "black"}
                        },
                        cells: {
                            values: [
                                itemNames,
                                percentValues,
                                values,
                            ],
                            align: "center",
                            line: {color: "black", width: 1},
                            // fill: {color: [sequential_colors[1],'white']},
                            // fill: {color: ['#25FEFD', 'white']},
                            font: {family: "Arial", size: 11, color: ["black"]}
                        }


                    }
                ];

                return {
                    data,
                    layout: {
                        title: options.title,

                        plot_bgcolor: defaultLayout.plot_bgcolor,
                        paper_bgcolor: defaultLayout.paper_bgcolor,
                        // showlegend: true,
                        // legend: {
                        // xanchor:"center",
                        // yanchor:"top",
                        // y:-1.3, // play with it
                        // x:0.5,   // play with it
                        // orientation: 'h',
                        // x: 0,
                        // y: 1
                        // }
                    }
                }
            },
            //

            getSmartChartFromJson(obj,options)
            {
                let defaultOptions = {
                    title: '',
                };


                options = options || {};

                options = Object.assign({

                },defaultOptions,options);

                let {labelMapping,strategy} = options;

                let values = [];
                let labels = [];

                let keyCount = 0;

                for (let key in obj)
                {
                    keyCount++;
                    values.push(obj[key]);

                    if (labelMapping && labelMapping[key])
                    {
                        labels.push(labelMapping[key]);

                    }
                    else {
                        labels.push(key);
                    }
                }

                let textinfo = 'label+percent';
                let maxLabelCount = 5;
                let showLegend = false;

                //too large for a pie chart go to another based on strategy given
                if (keyCount > maxLabelCount)
                {
                    if (strategy === 'table')
                    {
                        return self.getTableFromJson(obj,options);
                    }
                    else if (strategy === 'bar')
                    {
                        return self.getBarChartPlotly(obj,options);
                    }
                    else { //apply default based on size.
                        if (keyCount > 15) //for vary large number of keys use a table
                        {
                            return self.getTableFromJson(obj,options);
                        }
                        else {
                            return self.getBarChartPlotly(obj,options);
                        }
                    }
                }
                let data = [
                    {
                        values,
                        labels,
                        type: 'pie',
                        hole: options.hole || 0,
                        textinfo

                    }
                ];

                //https://github.com/plotly/plotly.js/issues/53
                return {
                    data,
                    layout: {
                        title: options.title,
                        plot_bgcolor: defaultLayout.plot_bgcolor,
                        paper_bgcolor: defaultLayout.paper_bgcolor,

                        showlegend: showLegend,
                        legend: {
                        }
                    }
                }
            },
            getBarChartPlotly(json,options)
            {
                options = options || {};
                let defaultOptions = {
                    sort: true,
                    isPercent: true,
                    title: ''
                };

                options = Object.assign({

                },defaultOptions,options);
                let {name,labelMapping} = options;

                let dataAry = [];
                let total = 0;
                for (let key in json)
                {
                    let record = {
                        key: key,
                        value: json[key]
                    };
                    dataAry.push(record)
                    total += record.value;
                }



                if (options.sort)
                {
                    dataAry.sort(function(a,b) {
                        // return b.value - a.value;
                        return a.value - b.value;
                    });
                }

                name = name || '';

                let data = [
                    {
                        x: [],
                        y: [],
                        text: [],
                        type: 'bar',
                        marker: {
                            color: []
                        },
                        textposition: 'auto',
                        // textposition: 'top',
                        // textposition: 'outside',

                        orientation: 'h',
                        hoverinfo: 'x'


                        // 'textinfo' : 'label',
                    }
                ];
                // let labels = [];
                // let backgroundColor = [];

                for (let i in dataAry) {
                    let record = dataAry[i];

                    record.percent = ((record.value / total) * 100).toFixed(2);

                    if (labelMapping && labelMapping[record.key])
                    {
                        data[0].y.push(labelMapping[record.key]);

                    }
                    else {
                        data[0].y.push(record.key);
                    }

                    if (options.isPercent)
                    {
                        data[0].x.push(record.percent);
                        data[0].text.push(record.percent + `%`);
                    }
                    else {
                        data[0].x.push(record.value);
                        data[0].text.push(record.value);
                    }


                    data[0].marker.color.push(chartColors[i])

                }

                //https://plot.ly/javascript/figure-labels/
                //https://stackoverflow.com/questions/36596947/long-tick-labels-getting-cut-off-in-plotly-js-chart
                //https://plot.ly/python/hover-text-and-formatting/
                //https://codepen.io/etpinard/pen/NaVrZz?editors=0010
                //https://plot.ly/javascript/setting-graph-size/
                //https://plot.ly/javascript/reference/#layout-plot_bgcolor
                //https://community.plot.ly/t/plot-background-how-can-i-setup-it/6617
                let chart = {
                    layout: {

                        plot_bgcolor: '#F4F5F7',
                        paper_bgcolor: "#F4F5F7",
                        // bgcolor: "#F4F5F7",


                        title: options.title,
                        hovermode: false, //No tooltip is required
                        // hovermode: 'closest',

                        // width: 700,
                        height: 700,
                        autosize: true,
                        xaxis: {
                            title: {
                                text: options.xTitle, //options.isPercent ? '%' : 'Total'
                            },
                            automargin: true,

                        },
                        yaxis: {
                            automargin: true,
                        }

                    },
                    data,
                    options: {
                        toImageButtonOptions: {
                            filename: options.title,
                            width: 800,
                            height: 600,
                            format: 'png'
                        }
                    }
                };

                console.log(`chart`,chart);

                return chart;
            },
            getStackedBarPlotly(json,options)
            {
                options = options || {};
                let defaultOptions = {
                    sort: true,
                };

                options = Object.assign({

                },defaultOptions,options);
                let {name} = options;

                let dataAry = [];
                let total = 0;
                for (let key in json)
                {
                    let record = {
                        key: key,
                        value: json[key]
                    };
                    dataAry.push(record)
                    total += record.value;
                }

                // return {};




                if (options.sort)
                {
                    dataAry.sort(function(a,b) {
                        return b.value - a.value;
                        // return a.value - b.value;
                    });
                }

                name = name || '';

                let data = [];
                // let labels = [];
                // let backgroundColor = [];

                for (let record of dataAry) {
                    record.percent = record.value / total;
                    let trace = {
                        x: [name],
                        y: [record.value],
                        // y: [record.percent],
                        name: record.key,
                        type: 'bar',
                        'textinfo' : 'label+text+value+percent',

                        // width: [.1]

                        // width: [record.percent]


                        // orientation: 'h'
                    };
                    data.push(trace);

                    // labels.push(key);
                    // backgroundColor.push(chartColors[data.length]);
                    // data.push(json[key]);
                }
                let chart = {
                    layout: {
                        // orientation: 'h',
                        bargap: .9,
                        barmode: 'group',
                        // barmode: 'stack',
                        'textinfo' : 'label+text+value+percent',

                    },
                    data
                }
                return chart;
            },
            getBasicDonutChartFromJson(json) {
                let chart = obj.getBasicPieChartFromJson(json);
                chart.type = 'donut-chart';
                return chart;
            },
            getBasicPolarChartFromJson(json) {
                let chart = obj.getBasicPieChartFromJson(json);
                chart.type = 'polar-chart';
                return chart;
            },
            getBarChartFromJson(json) {
                let data = [];
                let labels = [];
                let backgroundColor = [];

                for (let key in json) {
                    labels.push(key);
                    backgroundColor.push(chartColors[data.length]);
                    data.push(json[key]);
                }

                let plugins = {
                    labels: { //https://github.com/emn178/chartjs-plugin-labels
// render 'label', 'value', 'percentage', 'image' or custom function, default is 'percentage'
//                     render: 'value',

                        render: function (args) {
                            // args will be something like:
                            // { label: 'Label', value: 123, percentage: 50, index: 0, dataset: {...} }
                            return args.label + ' ' + args.percentage + '%';

                            // return object if it is image
                            // return { src: 'image.png', width: 16, height: 16 };
                        },

                        // render: 'percentage',
                        // precision for percentage, default is 0
                        precision: 0,

                        // identifies whether or not labels of value 0 are displayed, default is false
                        showZero: true,

                        // font size, default is defaultFontSize
                        fontSize: 15,

                        // font color, can be color array for each data or function for dynamic color, default is defaultFontColor
                        fontColor: '#fff',

                        // font style, default is defaultFontStyle
                        fontStyle: 'bold',

                        // font family, default is defaultFontFamily
                        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

                        // draw text shadows under labels, default is false
                        textShadow: true,

                        // text shadow intensity, default is 6
                        // shadowBlur: 10,

                        // text shadow X offset, default is 3
                        // shadowOffsetX: -5,

                        // text shadow Y offset, default is 3
                        // shadowOffsetY: 5,

                        shadowBlur: 0,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,

                        // text shadow color, default is 'rgba(0,0,0,0.3)'
                        shadowColor: 'rgba(0,0,0,1)',

                        // draw label in arc, default is false
                        // bar chart ignores this
                        // arc: true,

                        // position to draw label, available value is 'default', 'border' and 'outside'
                        // bar chart ignores this
                        // default is 'default'
                        position: 'default',

                        // draw label even it's overlap, default is true
                        // bar chart ignores this
                        overlap: true,

                        // show the real calculated percentages from the values and don't apply the additional logic to fit the percentages to 100 in total, default is false
                        showActualPercentages: true,

                        // set images when `render` is 'image'
                        images: [
                            {
                                src: 'image.png',
                                width: 16,
                                height: 16
                            }
                        ],

                        // add padding when position is `outside`
                        // default is 2
                        outsidePadding: 4,

                        // add margin of text when position is `outside` or `border`
                        // default is 2
                        textMargin: 4

                    }
                };


                let chart = {
                    type: 'bar-chart',
                    options: {
                        legend: {
                            display: false
                        },
                        plugins,
                        responsive: false,
                        maintainAspectRatio: false
                        // responsive:true,
                        // maintainAspectRatio: false,
                        // maintainAspectRatio: false, //allow resizing
                        // pieceLabel: {
                        //     mode: 'percentage',
                        //     precision: 1
                        // },
                        // tooltips: {
                        //     // enabled: false
                        // },
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
            getBasicPieChartFromJson(json) {
                let data = [];
                let labels = [];
                let backgroundColor = [];

                for (let key in json) {
                    labels.push(key);
                    backgroundColor.push(chartColors[data.length]);
                    data.push(json[key]);
                }

                let plugins = {
                    labels: { //https://github.com/emn178/chartjs-plugin-labels
// render 'label', 'value', 'percentage', 'image' or custom function, default is 'percentage'
//                     render: 'value',

                        render: function (args) {
                            // args will be something like:
                            // { label: 'Label', value: 123, percentage: 50, index: 0, dataset: {...} }
                            return args.label + ' ' + args.percentage + '%';

                            // return object if it is image
                            // return { src: 'image.png', width: 16, height: 16 };
                        },

                        // render: 'percentage',
                        // precision for percentage, default is 0
                        precision: 0,

                        // identifies whether or not labels of value 0 are displayed, default is false
                        showZero: true,

                        // font size, default is defaultFontSize
                        fontSize: 15,

                        // font color, can be color array for each data or function for dynamic color, default is defaultFontColor
                        fontColor: '#fff',

                        // font style, default is defaultFontStyle
                        fontStyle: 'bold',

                        // font family, default is defaultFontFamily
                        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

                        // draw text shadows under labels, default is false
                        textShadow: true,

                        // text shadow intensity, default is 6
                        // shadowBlur: 10,

                        // text shadow X offset, default is 3
                        // shadowOffsetX: -5,

                        // text shadow Y offset, default is 3
                        // shadowOffsetY: 5,

                        shadowBlur: 0,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,

                        // text shadow color, default is 'rgba(0,0,0,0.3)'
                        shadowColor: 'rgba(0,0,0,1)',

                        // draw label in arc, default is false
                        // bar chart ignores this
                        // arc: true,

                        // position to draw label, available value is 'default', 'border' and 'outside'
                        // bar chart ignores this
                        // default is 'default'
                        position: 'default',

                        // draw label even it's overlap, default is true
                        // bar chart ignores this
                        overlap: true,

                        // show the real calculated percentages from the values and don't apply the additional logic to fit the percentages to 100 in total, default is false
                        showActualPercentages: true,

                        // set images when `render` is 'image'
                        images: [
                            {
                                src: 'image.png',
                                width: 16,
                                height: 16
                            }
                        ],

                        // add padding when position is `outside`
                        // default is 2
                        outsidePadding: 4,

                        // add margin of text when position is `outside` or `border`
                        // default is 2
                        textMargin: 4

                    }
                };


                let chart = {
                    type: 'pie-chart',
                    options: {
                        legend: {
                            display: false
                        },
                        plugins,
                        responsive: false,
                        maintainAspectRatio: false
                        // responsive:true,
                        // maintainAspectRatio: false,
                        // maintainAspectRatio: false, //allow resizing
                        // pieceLabel: {
                        //     mode: 'percentage',
                        //     precision: 1
                        // },
                        // tooltips: {
                        //     // enabled: false
                        // },
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
            props: ['chart',
            'height',
                'width'
            ],
            created() {
                let plugins_no_label = {
                    labels: {
                        render: () => ''
                    }
                };


                if (!this.chart.options.plugins) {
                    this.chart.options.plugins = plugins_no_label;
                }
            },
            mounted() {
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
                        ]
                    },

                },

            }
        };

    export default obj;
</script>
