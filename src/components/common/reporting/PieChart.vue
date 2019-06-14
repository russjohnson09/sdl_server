<script>


    import { Pie } from 'vue-chartjs'
    export default {
        extends: Pie,
        props: ['chart'],
        mounted () {
            let options = this.chart.options;

            options.pieceLabel = null;
            options.response = false;
            options.maintainAspectRatio = false;

            this.renderChart(this.chart.data, options)
        }
    }
</script>