<script>

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


let self =
    {
        getBasicPolarChartFromJson(jsonObj,labelMapping)
        {

        },
        getDonutChartFromJson(jsonObj,labelMapping){
            return self.getPieChartFromJson(jsonObj,labelMapping, {
                hole: 0.4
            });
        },
        //https://dataviz.love/2017/03/17/alternative-chart-types-pie-chart/
        getPieChartFromJson(obj,labelMapping,options)
        {
            options = options || {};
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
            let maxLabelCount = 20;
            let showLegend = false;
            if (keyCount > maxLabelCount)
            {
                textinfo = 'text';
                showLegend = true;
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
                    showlegend: showLegend,
                    legend: {
                    }
                }
            }
        },

        getStackedBarChartFromJson(obj,labelMapping,options)
        {
            options = options || {};
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
            if (keyCount > 3)
            {
                textinfo = 'text';
            }
            let data = [
                {
                    y: values,
                    x: labels,
                    type: 'bar',
                    // 'textinfo' : 'label+text+value+percent',
                    textinfo

                }
            ];

            return {
                data,
                layout: {
                }
            }
        },
        getBarChartFromJson(obj,labelMapping,options)
        {
            options = options || {};
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
            if (keyCount > 3)
            {
                textinfo = 'text';
            }
            let data = [
                {
                    y: values,
                    x: labels,
                    type: 'bar',
                    // 'textinfo' : 'label+text+value+percent',
                    textinfo

                }
            ];

            return {
                data,
                layout: {
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
        //https://courses.lumenlearning.com/atd-austincc-mathlibarts/chapter/presenting-categorical-data-graphically/
        getTableFromJson(obj,labelMapping,options)
        {
            options = options || {};

            // let toalPercent = '100%';
            let total = 0;


            let cellValues = [];
            let percentValues = [];

            let itemNames = [];

            // let values = [];
            // let tableValues = [];



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
                        values: options.headerValues,
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
                            values,
                            percentValues
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
    };


export default self;

</script>