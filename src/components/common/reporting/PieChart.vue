<script>


    import { Pie } from 'vue-chartjs'

    export default {
        extends: Pie,
        props: ['chart'],
        mounted () {
            this.renderChart(this.chart.data, this.chart.options)
        }
    }
</script>