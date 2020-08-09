// A $( document ).ready() block.
jQuery(document).ready(function($) {

    const ACTION = {
        SAVE_RATE: 'save_rate',
        SAVE_RATE_HISTORY: 'save_rate_history',
        VIEW_RATE_HISTORY: 'view_rate_history',
        GET_ALL_RATE_HISTORY: 'get_all_rate_history'
    }

    const FORMAT_DATA = {
        YYYY_MM_DD: 'YYYY-MM-DD'
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

        function getThisWeekDates() {
            let startDayTemp = moment();

            var day = startDayTemp.day();
            var startDate;
            var endDate;

            if (day == 0) {
                day = 7;
                startDate = moment().add('days', -(day - 1)).format(FORMAT_DATA.YYYY_MM_DD);
                endDate = moment().format(FORMAT_DATA.YYYY_MM_DD);
            } else {
                startDate = moment().add('days', -(day - 1)).format(FORMAT_DATA.YYYY_MM_DD);
                endDate = moment().add('days', (7 - day)).format(FORMAT_DATA.YYYY_MM_DD);
            }

            return {
                startDate: startDate,
                endDate: endDate
            }
        }

        /**
         * Get range date
         * 
         * @param {*} yeah 
         * @param {*} month 
         */
        function getMonthDateRange(yeah, month) {
            // array is 'year', 'month', 'day', etc
            var startDate = moment([yeah, month]);

            // Clone the value before .endOf()
            var endDate = moment(startDate).endOf('month');

            // make sure to call toDate() for plain JavaScript date type
            return { startDate: startDate.format(FORMAT_DATA.YYYY_MM_DD), endDate: endDate.format(FORMAT_DATA.YYYY_MM_DD) };
        }

        /**
         * Get range date this month
         */
        function getThisMonthDateRange() {
            var current = moment();
            return getMonthDateRange(current.year(), current.month());
        }

        /**
         * Get range date last month
         */
        function getLastMonthDateRange() {
            var current = moment();
            return getMonthDateRange(current.year(), current.month() - 1);
        }

        // Get data for char
        getDataForChart(getThisWeekDates());

        /**
         * Get data for char
         */
        function getDataForChart(date) {
            // Get data for char
            $.ajax({
                url: exchange_rate_js_vars.ajaxurl,
                type: "POST",
                data: {
                    action: ACTION.GET_ALL_RATE_HISTORY,
                    startDate: date.startDate,
                    endDate: date.endDate
                },
                dataType: "json",
                success: function(res) {
                    drawChart(res.data);
                }
            })
        }

        function drawChart(data) {
            $('.area-chart').empty();
            $('.area-chart').append('<canvas id="chart"></canvas>');

            var ctx = document.getElementById('chart').getContext('2d');

            ctx.canvas.width = 500;
            ctx.canvas.height = 300;

            let labels = data.map(element => element.date);
            let rateBuyData = data.map(element => element.rate_buy);
            let rateSaleData = data.map(element => element.rate_sale);

            var color = Chart.helpers.color;
            var cfg = {
                data: {
                    labels: labels,
                    datasets: [{
                            label: 'Tỷ giá mua',
                            backgroundColor: '#1CA1FF',
                            borderColor: '#1CA1FF',
                            data: rateBuyData,
                            type: 'line',
                            pointRadius: 0,
                            fill: false,
                            lineTension: 0,
                            borderWidth: 2
                        },
                        {
                            label: 'Tỷ giá bán',
                            backgroundColor: '#20EAA2',
                            borderColor: '#20EAA2',
                            data: rateSaleData,
                            type: 'line',
                            pointRadius: 0,
                            fill: false,
                            lineTension: 0,
                            borderWidth: 2
                        }
                    ]
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
                            },
                            gridLines: {
                                display: false
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                display: false
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
                    },
                    legend: {
                        display: false
                    },
                    legendCallback: function(chart) {
                        var text = [];
                        text.push('<ul class="' + chart.id + '-legend">');
                        for (var i = 0; i < chart.data.datasets.length; i++) {
                            text.push('<li><div class="legendValue"><span style="background-color:' + chart.data.datasets[i].backgroundColor + '">&nbsp;&nbsp;&nbsp;&nbsp;</span>');

                            if (chart.data.datasets[i].label) {
                                text.push('<span class="label">' + chart.data.datasets[i].label + '</span>');
                            }

                            text.push('</div></li><div class="clear"></div>');
                        }

                        text.push('</ul>');

                        return text.join('');
                    }
                }
            };

            var chart = new Chart(ctx, cfg);
            $('#legend').empty();
            $('#legend').prepend(chart.generateLegend());
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

        $('.chart_menu .menu-select').click(function() {
            let offset = $(this).offset();
            $('.menu-select-child').css({
                top: offset.top,
                left: offset.left - 100,
                display: 'block'
            })
        });

        $('.chart_menu .menu-select-child li').click(function() {
            $(this).siblings('.active').removeClass('active');
            $(this).addClass('active');

            let data = {};
            if ($(this).hasClass('this-week')) {
                data = getThisWeekDates();
            } else if ($(this).hasClass('this-month')) {
                data = getThisMonthDateRange();
            } else if ($(this).hasClass('last-monnt')) {
                data = getLastMonthDateRange();
            }

            // Get data for char
            getDataForChart(data);
        });

        $(document).click(function(event) {
            if (event.target.className == 'menu-select') {
                return;
            }
            closeChildMenu();
        });

        function closeChildMenu() {
            $('.menu-select-child').css(
                'display', 'none'
            );
        }
    }
    // Area of menu Biểu đồ end ===================================================

});