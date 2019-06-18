<script>
    // CommitChart.js
    // import { HorizontalBar } from 'vue-chartjs'
    import { HorizontalBar } from 'vue-chartjs'

    export default {
        extends: HorizontalBar,
        props: ['chart',
        'width',
        'height'],
        mounted () {

            let options = this.chart.options;
            options.response = false;
            options.maintainAspectRatio = false;


            //https://codepen.io/marcusvilete/pen/EEpKMx
            options.pan =
                {
                    enabled: true,
                    mode: "x",
                    speed: 10,
                    threshold: 10
                };

            options.scales = {
                xAxes: [{
                    stacked: true
                }],
                    yAxes: [{
                    stacked: true
                }]
            };


            return this.renderChart(this.chart.data,options);

        }
    }
</script>