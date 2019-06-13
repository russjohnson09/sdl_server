<script>


    import {Pie} from 'vue-chartjs'

    //chart sizing
    //https://github.com/apertureless/vue-chartjs/issues/17
    //https://github.com/emn178/chartjs-plugin-labels/issues/47
    //https://github.com/chartjs/chartjs-plugin-datalabels/issues/10#

    // import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';
    //
    // var app = new Vue({
    //     el: '#app',
    //     data: {
    //         message: 'Hello Vue!'
    //     },
    //     components: {
    //         ChartJsPluginDataLabels,
    //     },
    // })
    /**
     * Example Pie Chart
     */
    export default {
        extends: Pie,
        props: ['chart'],
        mounted() {
            // let options = this.chart.options;
            // options.maintainAspectRatio = false;
            this.renderChart(
                {
                    labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
                    datasets: [
                        {
                            backgroundColor: [
                                '#41B883',
                                '#E46651',
                                '#00D8FF',
                                '#DD1B16'
                            ],
                            data: [40, 20, 80, 10]
                        }
                    ]
                },
                {
                    responsive: true,
                    maintainAspectRatio: false,
                    pieceLabel: {
                        mode: 'percentage',
                        precision: 1
                    }
                })
        }
    }
</script>