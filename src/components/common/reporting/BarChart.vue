<script>
    // CommitChart.js
    import { Bar } from 'vue-chartjs'

    export default {
        extends: Bar,
        props: ['chart'],
        mounted () {

            // let options = this.options;
            // let data = this.data;


            return this.renderChart(this.chart.data,this.chart.options);

        }
    }
</script>