<script>
    // CommitChart.js
    import { Bar } from 'vue-chartjs'

    export default {
        extends: Bar,
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


            return this.renderChart(this.chart.data,options);

        }
    }
</script>