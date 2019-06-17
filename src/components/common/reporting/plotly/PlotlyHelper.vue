<script>

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
            if (keyCount > 3)
            {
                textinfo = 'text';
            }
            let data = [
                {
                    values,
                    labels,
                    type: 'pie',
                    hole: options.hole || 0,
                    // 'textinfo' : 'label+text+value+percent',
                    textinfo

                }
            ];
            // var data = [{
            //     values: [19, 26, 55],
            //     labels: ['Residential', 'Non-Residential', 'Utility'],
            //     type: 'pie'
            // }];

            // var layout = {
            //     height: 400,
            //     width: 500
            // };

            //https://github.com/plotly/plotly.js/issues/53
            return {
                data,
                layout: {
                    showlegend: true,
                    legend: {
                        // xanchor:"center",
                        // yanchor:"top",
                        // y:-1.3, // play with it
                        // x:0.5,   // play with it
                        orientation: 'h',
                        // x: 0,
                        // y: 1
                    }
                }
            }
        }
    };


export default self;

</script>