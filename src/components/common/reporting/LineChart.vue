
<script>
    import { Line } from 'vue-chartjs'

    export default {
        extends: Line,
        props: [
            'chart',
            // 'data',
            // 'options'
        ],
        mounted () {

            let options = this.chart.options;

            options.response = false;
            options.maintainAspectRatio = false;

            this.renderChart(this.chart.data, options)
        }
    }
</script>
