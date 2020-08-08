// A $( document ).ready() block.
jQuery(document).ready(function($) {

    const ACTION = {
        SAVE_RATE: 'save_rate'
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

        function generateData() {
            var unit = 'hour';

            function unitLessThanDay() {
                return unit === 'second' || unit === 'minute' || unit === 'hour';
            }

            function beforeNineThirty(date) {
                return date.hour() < 9 || (date.hour() === 9 && date.minute() < 30);
            }

            // Returns true if outside 9:30am-4pm on a weekday
            function outsideMarketHours(date) {
                if (date.isoWeekday() > 5) {
                    return true;
                }
                if (unitLessThanDay() && (beforeNineThirty(date) || date.hour() > 16)) {
                    return true;
                }
                return false;
            }

            function randomNumber(min, max) {
                return Math.random() * (max - min) + min;
            }

            function randomBar(date, lastClose) {
                var open = randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);
                var close = randomNumber(open * 0.95, open * 1.05).toFixed(2);
                return {
                    t: date.valueOf(),
                    y: close
                };
            }

            var date = moment('Jan 01 1990', 'MMM DD YYYY');
            var now = moment();
            var data = [];
            var lessThanDay = unitLessThanDay();
            for (; data.length < 600 && date.isBefore(now); date = date.clone().add(1, unit).startOf(unit)) {
                if (outsideMarketHours(date)) {
                    if (!lessThanDay || !beforeNineThirty(date)) {
                        date = date.clone().add(date.isoWeekday() >= 5 ? 8 - date.isoWeekday() : 1, 'day');
                    }
                    if (lessThanDay) {
                        date = date.hour(9).minute(30).second(0);
                    }
                }
                data.push(randomBar(date, data.length > 0 ? data[data.length - 1].y : 30));
            }

            return data;
        }

        var ctx = document.getElementById('chart1').getContext('2d');
        ctx.canvas.width = 500;
        ctx.canvas.height = 300;

        var color = Chart.helpers.color;
        var cfg = {
            data: {
                datasets: [{
                    label: 'CHRT - Chart.js Corporation',
                    backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                    borderColor: window.chartColors.red,
                    data: generateData(),
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
                        type: 'time',
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
                            var majorUnit = scale._majorUnit;
                            var firstTick = ticks[0];
                            var i, ilen, val, tick, currMajor, lastMajor;

                            val = moment(ticks[0].value);
                            if ((majorUnit === 'minute' && val.second() === 0) ||
                                (majorUnit === 'hour' && val.minute() === 0) ||
                                (majorUnit === 'day' && val.hour() === 9) ||
                                (majorUnit === 'month' && val.date() <= 3 && val.isoWeekday() === 1) ||
                                (majorUnit === 'year' && val.month() === 0)) {
                                firstTick.major = true;
                            } else {
                                firstTick.major = false;
                            }
                            lastMajor = val.get(majorUnit);

                            for (i = 1, ilen = ticks.length; i < ilen; i++) {
                                tick = ticks[i];
                                val = moment(tick.value);
                                currMajor = val.get(majorUnit);
                                tick.major = currMajor !== lastMajor;
                                lastMajor = currMajor;
                            }
                            return ticks;
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            drawBorder: false
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Closing price ($)'
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
        var dataset = chart.config.data.datasets[0];
        dataset.type = 'line';
        dataset.data = generateData();
        chart.update();
    }
    // Area of menu Biểu đồ end ===================================================

});