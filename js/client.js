// A $( document ).ready() block.
jQuery(document).ready(function($) {

    const ACTION = {
        GET_ALL_RATE_HISTORY: 'get_all_rate_history',
        GET_ALL_SERVICE_CHANGE_MONEY: 'get_all_service_change_money',
    };

    const FORMAT_DATA = {
        YYYY_MM_DD: 'YYYY-MM-DD',
        DD_MM_YYYY: 'DD/MM/YYYY'
    };

    const CLASS = {
        CHART_MENU: '.chart_menu',
        MONEY_RATE_BUY_SALE: '.money-rate-buy-sale',
        MONEY_CHANGE: '.money-change'
    };

    const TYPE = {
        VN_CN: 'VN_CN',
        CN_VN: 'CN_VN',
        TTH: 'TTH'
    }

    var sericeChangeMoney = [];

    // Area of menu Tỷ giá start ===================================================
    let chart_menu = $(CLASS.CHART_MENU);
    let money_rate_buy_sale = $(CLASS.MONEY_RATE_BUY_SALE);
    let money_change = $(CLASS.MONEY_CHANGE);

    if (money_rate_buy_sale.length > 0) {
        startTime();

        let currentDate = moment(new Date()).format(FORMAT_DATA.DD_MM_YYYY);
        $(CLASS.MONEY_RATE_BUY_SALE + ' .date').text(currentDate);

        function startTime() {
            var today = new Date();
            var h = today.getHours();
            var m = today.getMinutes();
            var s = today.getSeconds();
            m = checkTime(m);
            s = checkTime(s);
            $(CLASS.MONEY_RATE_BUY_SALE + ' .time').text(h + ":" + m + ":" + s);
            var t = setTimeout(startTime, 500);
        }

        function checkTime(i) {
            if (i < 10) { i = "0" + i }; // add zero in front of numbers < 10
            return i;
        }

        $(CLASS.MONEY_RATE_BUY_SALE).show();
    }
    // Area of menu Tỷ giá end ===================================================

    if (money_change.length > 0) {
        let type = $(CLASS.MONEY_CHANGE + ' .money-change-type').val();

        $(CLASS.MONEY_CHANGE + ' .input-money input[type=text]').on({
            keyup: function() {
                let selectValue = $('.' + type).val();
                let money = 0;
                let inputMoney = parseStringToInt($(this).val());
                let chargeTrans = 0;
                let rate_sale = parseStringToInt($('.rate-sale').val());
                if (type == TYPE.CN_VN) {
                    // Wechat,alipay : (số tiền-phí rút alipay,wechat - phí giao dịch 1)* tỷ giá mua
                    chargeTrans = 0;
                    let fee_withdraw_alipay_wechat = parseStringToInt($(CLASS.MONEY_CHANGE + ' .fee_withdraw_alipay_wechat').val());
                    let difference_rate_tm_and_tk = parseStringToInt($(CLASS.MONEY_CHANGE + ' .difference_rate_tm_and_tk').val());
                    let rate_buy = parseStringToInt($(CLASS.MONEY_CHANGE + ' .rate-buy').val());
                    if (selectValue == 1) {
                        money = (inputMoney - fee_withdraw_alipay_wechat - chargeTrans) * rate_buy;

                        // Tiền mặt : (số tiền- phí giao dịch 1)*(tỷ giá mua -tỷ giá chênh lệch tm và tk)
                    } else if (selectValue == 2) {
                        money = (inputMoney - chargeTrans) * (rate_buy - difference_rate_tm_and_tk);

                        // Tài khoản : (số tiền - phí giao dịch 1)* tỷ giá mua
                    } else if (selectValue == 3) {
                        money = (inputMoney - chargeTrans) * rate_buy;
                    }
                } else if (type == TYPE.VN_CN) {
                    // (số tiền + phí giao dịch 2)* tỷ giá bán
                    chargeTrans = 0;
                    money = (inputMoney + chargeTrans) * rate_sale;
                } else if (type == TYPE.TTH) {
                    // (số tiền + phí giao dịch 3)* tỷ giá bán
                    chargeTrans = 0;
                    money = (inputMoney + chargeTrans) * rate_sale;
                }

                $(CLASS.MONEY_CHANGE + ' .output-money input[type=text]').val(money + ' VNĐ');
            },
            blur: function() {}
        });

        $(CLASS.MONEY_CHANGE + ' select').change(function() {
            $(CLASS.MONEY_CHANGE + ' .input-money input[type=text]').trigger('keyup');
        });

        /**
         * Get data service change money
         */
        function getSericeChangeMoney(type) {
            // Get data for char
            $.ajax({
                url: exchange_rate_js_vars.ajaxurl,
                type: "GET",
                data: {
                    action: ACTION.GET_ALL_SERVICE_CHANGE_MONEY,
                    type: type
                },
                dataType: "json",
                success: function(res) {
                    sericeChangeMoney = res.data;
                }
            })
        }

        // Get data show screen
        getSericeChangeMoney(type);

        function parseStringToInt(value) {
            if (value == undefined || value == '') {
                return 0;
            }

            return parseInt(value);
        }
    }

    // Area of menu Biểu đồ start ===================================================
    if (chart_menu.length > 0) {

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

        $('.chart_menu .menu-select').click(function() {
            let offset = $(this).offset();
            $('.menu-select-child').css({
                top: offset.top + 30,
                left: offset.left - 100,
                display: 'block'
            })
        });

        $('.chart_menu .menu-select-child li').click(function() {
            $(this).siblings('.active').removeClass('active');
            $(this).addClass('active');

            reloadChart();
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

        /**
         * Reload chart
         */
        function reloadChart() {
            let $this = $('.chart_menu .menu-select-child li').filter('.active');
            let data = {};
            if ($($this).hasClass('this-week')) {
                data = getThisWeekDates();
            } else if ($($this).hasClass('this-month')) {
                data = getThisMonthDateRange();
            } else if ($($this).hasClass('last-monnt')) {
                data = getLastMonthDateRange();
            }

            // Get data for char
            getDataForChart(data);
        }
    }
    // Area of menu Biểu đồ end ===================================================

});