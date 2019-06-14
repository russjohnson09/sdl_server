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
            return this.renderChart(this.chart.data,options);

        }
    }
</script>