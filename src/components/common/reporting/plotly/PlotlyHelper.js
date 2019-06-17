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

            for (let key in obj)
            {
                values.push(obj[key]);

                if (labelMapping && labelMapping[key])
                {
                    labels.push(labelMapping[key]);

                }
                else {
                    labels.push(key);
                }
            }
            let data = [
                {
                    values,
                    labels,
                    type: 'pie',
                    hole: options.hole || 0,
                    // 'textinfo' : 'label+text+value+percent',
                    'textinfo' : 'label+text+percent'

                }
            ];
            // var data = [{
            //     values: [19, 26, 55],
            //     labels: ['Residential', 'Non-Residential', 'Utility'],
            //     type: 'pie'
            // }];

            var layout = {
                height: 400,
                width: 500
            };

            return {
                data
            }
        }
    };


export default self;