// A $( document ).ready() block.
jQuery(document).ready(function($) {

    const ACTION = {
        SAVE_RATE: 'save_rate',
        SAVE_RATE_HISTORY: 'save_rate_history',
        VIEW_RATE_HISTORY: 'view_rate_history',
        GET_ALL_RATE_HISTORY: 'get_all_rate_history'
    }

    // Area of menu Tỷ giá start ===================================================
    let exchange_rate_menu = $('.exchange_rate_menu');
    let chart_menu = $('.chart_menu');

    if (exchange_rate_menu.length > 0) {
        calRateBuy();
        calRateSale();

        /**
         * Change value input
         */
        $('.exchange_rate_menu input').keyup(function(event) {
            calRateBuy();
            calRateSale();

        }).keydown(function(event) {});

        /**
         * Calculator rate buy
         */
        function calRateBuy() {
            // priceBuy = rate - rateBuy
            let priceBuy = $('.exchange_rate_menu #rate').val() - $('.exchange_rate_menu #rateBuy').val();
            $('.exchange_rate_menu #priceBuy').text(priceBuy);
        }

        /**
         * Calculator rate sale
         */
        function calRateSale() {
            // priceSale = rate - rateSale
            let priceSale = $('.exchange_rate_menu #rate').val() - $('.exchange_rate_menu #rateSale').val();
            $('.exchange_rate_menu #priceSale').text(priceSale);
        }

        /**
         * Event save rate
         */
        $('.exchange_rate_menu #saveRate').click(function() {
            let rate = $('.exchange_rate_menu #rate').val();
            let rateBuy = $('.exchange_rate_menu #rateBuy').val();
            let rateSale = $('.exchange_rate_menu #rateSale').val();

            if (rate == '' || rateBuy == '' || rateSale == '') {
                alert('Hãy nhập đầy đủ thông tin');
                return false;
            }

            let data = {
                action: ACTION.SAVE_RATE,
                rate: rate,
                rateBuy: rateBuy,
                rateSale: rateSale
            };

            $.ajax({
                url: exchange_rate_js_vars.ajaxurl,
                type: "POST",
                data: data,
                dataType: "json",
                success: function(data) {
                    alert(data.message);
                }
            })
        });
    }
    // Area of menu Tỷ giá end ===================================================


    // Area of menu Biểu đồ start ===================================================
    else if (chart_menu.length > 0) {
        $("#datepicker").datepicker({
            dateFormat: 'dd/mm/yy',
            maxDate: new Date
        }).datepicker("setDate", new Date());

        // Get data for char
        $.ajax({
            url: exchange_rate_js_vars.ajaxurl,
            type: "POST",
            data: { action: ACTION.GET_ALL_RATE_HISTORY },
            dataType: "json",
            success: function(res) {
                drawChart(res.data);
            }
        })



        function drawChart(data) {
            var ctx = document.getElementById('chart1').getContext('2d');
            ctx.canvas.width = 500;
            ctx.canvas.height = 300;

            let labels = data.map(element => element.date);
            let datas = data.map(element => element.rate_buy);

            var color = Chart.helpers.color;
            var cfg = {
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Tỷ giá mua',
                        backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                        borderColor: window.chartColors.red,
                        data: datas,
                        type: 'line',
                        pointRadius: 0,
                        fill: false,
                        lineTension: 0,
                        borderWidth: 2
                    }]
                },
                options: {
                    animation: {
                        duration: 0
                    },
                    scales: {
                        xAxes: [{
                            distribution: 'series',
                            offset: true,
                            ticks: {
                                major: {
                                    enabled: true,
                                    fontStyle: 'bold'
                                },
                                source: 'data',
                                autoSkip: true,
                                autoSkipPadding: 75,
                                maxRotation: 0,
                                sampleSize: 100
                            },
                            afterBuildTicks: function(scale, ticks) {
                                return ticks;
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                drawBorder: false
                            },
                            scaleLabel: {
                                display: false
                            }
                        }]
                    },
                    tooltips: {
                        intersect: false,
                        mode: 'index',
                        callbacks: {
                            label: function(tooltipItem, myData) {
                                var label = myData.datasets[tooltipItem.datasetIndex].label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += parseFloat(tooltipItem.value).toFixed(2);
                                return label;
                            }
                        }
                    }
                }
            };

            var chart = new Chart(ctx, cfg);
            chart.update();
        }

        /**
         * Event save rate history
         */
        $('.chart_menu #saveRateHistory').click(function() {
            let datepicker = $('.chart_menu #datepicker').val();
            let rateBuy = $('.chart_menu #rateBuy').val();
            let rateSale = $('.chart_menu #rateSale').val();

            if (datepicker == '' || rateBuy == '' || rateSale == '') {
                alert('Hãy nhập đầy đủ thông tin');
                return false;
            }

            let data = {
                action: ACTION.SAVE_RATE_HISTORY,
                datepicker: datepicker,
                rateBuy: rateBuy,
                rateSale: rateSale
            };

            $.ajax({
                url: exchange_rate_js_vars.ajaxurl,
                type: "POST",
                data: data,
                dataType: "json",
                success: function(data) {
                    alert(data.message);
                }
            })
        });

        /**
         * Event save rate history
         */
        $('.chart_menu #viewRateHistory').click(function() {
            let datepicker = $('.chart_menu #datepicker').val();

            if (datepicker == '') {
                alert('Hãy nhập đầy đủ thông tin');
                return false;
            }

            let data = {
                action: ACTION.VIEW_RATE_HISTORY,
                datepicker: datepicker
            };

            $.ajax({
                url: exchange_rate_js_vars.ajaxurl,
                type: "POST",
                data: data,
                dataType: "json",
                success: function(data) {
                    if (data.status_code == 200) {
                        $('.chart_menu #rateBuy').val(data.data.rate_buy);
                        $('.chart_menu #rateSale').val(data.data.rate_sale);
                    } else {
                        alert(data.message);
                    }
                }
            })
        });
    }
    // Area of menu Biểu đồ end ===================================================

});