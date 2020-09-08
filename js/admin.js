// A $( document ).ready() block.
jQuery(document).ready(function($) {

    const ACTION = {
        SAVE_RATE: 'save_rate',
        SAVE_RATE_HISTORY: 'save_rate_history',
        VIEW_RATE_HISTORY: 'view_rate_history',
        GET_ALL_RATE_HISTORY: 'get_all_rate_history',
        GET_ALL_SERVICE_CHANGE_MONEY: 'get_all_service_change_money',
        GET_ALL_SERVICE_CHANGE_MONEY_OPTION: 'get_all_service_change_money_option',
        SAVE_SERVICE_CHANGE_MONEY: 'save_service_change_money',
        SAVE_SERVICE_CHANGE_MONEY_OPTION: 'save_service_change_money_option'
    }

    const FORMAT_DATA = {
        YYYY_MM_DD: 'YYYY-MM-DD'
    }

    const TYPE = {
        VN_CN: 'VN_CN',
        CN_VN: 'CN_VN',
        TTH: 'TTH'
    }

    const CLASS_NAME = {
        MONEY_CHANGE_VN_CN: '.money_change_vn_cn',
        MONEY_CHANGE_CN_VN: '.money_change_cn_vn',
        MONEY_CHANGE_TTH: '.money_change_tth',
        EXCHANGE_RATE_MENU: '.exchange_rate_menu'
    }

    const UNIT = {
        MONEY: 'money',
        PERCENT: 'percent'
    }

    var listRange = [];

    // Area of menu Tỷ giá start ===================================================
    let exchange_rate_menu = $(CLASS_NAME.EXCHANGE_RATE_MENU);
    let chart_menu = $('.chart_menu');
    let money_change_vn_cn = $(CLASS_NAME.MONEY_CHANGE_VN_CN);
    let money_change_cn_vn = $(CLASS_NAME.MONEY_CHANGE_CN_VN);
    let money_change_tth = $(CLASS_NAME.MONEY_CHANGE_TTH);

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

        function getRate() {
            let rate = replaceCurrency($(CLASS_NAME.EXCHANGE_RATE_MENU + ' #rate').val());
            if (rate == '') {
                return 0;
            }
            return parseInt(rate);
        }

        function getRateBuy() {
            let rateBuy = replaceCurrency($(CLASS_NAME.EXCHANGE_RATE_MENU + ' #rateBuy').val());
            if (rateBuy == '') {
                return 0;
            }
            return parseInt(rateBuy);
        }

        function getRateSale() {
            let rateSale = replaceCurrency($(CLASS_NAME.EXCHANGE_RATE_MENU + ' #rateSale').val());
            if (rateSale == '') {
                return 0;
            }
            return parseInt(rateSale);
        }

        /**
         * Calculator rate buy
         */
        function calRateBuy() {
            // priceBuy = rate - rateBuy
            let priceBuy = getRate() - getRateBuy();
            $(CLASS_NAME.EXCHANGE_RATE_MENU + ' #priceBuy').text(formatCurrencyText(priceBuy));
        }

        /**
         * Calculator rate sale
         */
        function calRateSale() {
            // priceSale = rate + rateSale
            let priceSale = getRate() + getRateSale();
            $(CLASS_NAME.EXCHANGE_RATE_MENU + ' #priceSale').text(formatCurrencyText(priceSale));
        }

        /**
         * Event save rate
         */
        $(CLASS_NAME.EXCHANGE_RATE_MENU + ' #saveRate').click(function() {
            let rate = getRate();
            let rateBuy = getRateBuy();
            let rateSale = getRateSale();

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

        $("#startDate").datepicker({
            dateFormat: FORMAT_DATA.DD_MM_YYYY_SMALL
        });

        $("#endDate").datepicker({
            dateFormat: FORMAT_DATA.DD_MM_YYYY_SMALL
        });

        // On change date
        $("#startDate").change(function() {
            var date = $(this).datepicker('getDate');
            date.setDate(date.getDate() + 29);

            $("#endDate").datepicker({
                dateFormat: FORMAT_DATA.DD_MM_YYYY_SMALL,
                maxDate: date
            }).datepicker("setDate", date);

            let data = getStartEndDate();
            // Get data for char
            getDataForChart(data);
        });

        $("#endDate").change(function() {
            var date = $(this).datepicker('getDate');
            date.setDate(date.getDate() - 29);

            $("#startDate").datepicker({
                dateFormat: FORMAT_DATA.DD_MM_YYYY_SMALL,
                maxDate: date
            }).datepicker("setDate", date);

            let data = getStartEndDate();
            // Get data for char
            getDataForChart(data);
        });

        function getStartEndDate() {
            let startDate = $('#startDate').datepicker('getDate');
            let endDate = $('#endDate').datepicker('getDate');

            return {
                startDate: moment(startDate).format(FORMAT_DATA.YYYY_MM_DD),
                endDate: moment(endDate).format(FORMAT_DATA.YYYY_MM_DD)
            }
        }

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

        // Get data for char from 30 day before to current date
        function getDatesBeforeToCurrentDate() {
            let startDayTemp = moment();

            var day = startDayTemp.day();
            let startDate = moment().add('days', (day - 32)).format(FORMAT_DATA.YYYY_MM_DD);
            let endDate = moment().format(FORMAT_DATA.YYYY_MM_DD);

            return {
                startDate: startDate,
                endDate: endDate
            }
        }
        
        getDataForChart(getDatesBeforeToCurrentDate());

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
            let rateBuy = replaceCurrency($('.chart_menu #rateBuy').val());
            let rateSale = replaceCurrency($('.chart_menu #rateSale').val());

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
                    // Set data for input
                    setDataInput('', '');
                    alert(data.message);
                    reloadChart();
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

            // Set data for input
            setDataInput('', '');

            $.ajax({
                url: exchange_rate_js_vars.ajaxurl,
                type: "POST",
                data: data,
                dataType: "json",
                success: function(data) {
                    if (data.status == 200) {
                        // Set data for input
                        setDataInput(data.data.rate_buy, data.data.rate_sale);
                    } else {
                        alert(data.message);
                    }
                }
            })
        });

        /**
         * Set data for input
         */
        function setDataInput(rateBuy, rateSale) {
            $('.chart_menu #rateBuy').val(formatCurrencyText(rateBuy));
            $('.chart_menu #rateSale').val(formatCurrencyText(rateSale));
        }

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


    // Area of menu VNĐ -> CHY start ===================================================
    else if (money_change_vn_cn.length > 0) {
        // Bind event click button
        bindEventButton(CLASS_NAME.MONEY_CHANGE_VN_CN, TYPE.VN_CN);

        // Get init data
        getSericeChangeMoney(TYPE.VN_CN, renderRow.bind(this, CLASS_NAME.MONEY_CHANGE_VN_CN));
    }

    // Area of menu VNĐ -> CHY end ===================================================

    // Area of menu CHY -> VNĐ start ===================================================
    else if (money_change_cn_vn.length > 0) {
        /**
         * Get data service change money option
         */
        function getSericeChangeMoneyOption(type) {
            // Get data for char
            $.ajax({
                url: exchange_rate_js_vars.ajaxurl,
                type: "GET",
                data: {
                    action: ACTION.GET_ALL_SERVICE_CHANGE_MONEY_OPTION,
                    type: type
                },
                dataType: "json",
                success: function(res) {
                    let data = res.data[0];
                    $('#rateDifference').val(data.difference_rate_tm_and_tk);
                    $('#chargeWithdraw').val(data.fee_withdraw_alipay_wechat);
                }
            })
        }

        // Get data show screen
        getSericeChangeMoneyOption(TYPE.CN_VN);

        // Bind event click button
        bindEventButton(CLASS_NAME.MONEY_CHANGE_CN_VN, TYPE.CN_VN);

        // Get init data
        getSericeChangeMoney(TYPE.CN_VN, renderRow.bind(this, CLASS_NAME.MONEY_CHANGE_CN_VN));
    }

    // Area of menu CHY -> VNĐ end ===================================================

    // Area of menu Dich vụ thanh toán hộ start ======================================
    else if (money_change_tth.length > 0) {
        // Bind event click button
        bindEventButton(CLASS_NAME.MONEY_CHANGE_TTH, TYPE.TTH);

        // Get init data
        getSericeChangeMoney(TYPE.TTH, renderRow.bind(this, CLASS_NAME.MONEY_CHANGE_TTH));
    }

    // Area of menu Dich vụ thanh toán hộ end ===========================================

    /**
     * Get data service change money
     */
    function getSericeChangeMoney(type, callbacks) {
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
                listRange = res.data;
                callbacks();
            }
        })
    }

    /**
     * Render list in table
     * 
     * @param {*} className 
     */
    function renderRow(className) {
        $(className + ' table').empty();
        let htmlHeader = `
            <tr>
                <td>STT</td>
                <td>Từ</td>
                <td>Đến</td>
                <td>Phí giao dịch</td>
                <td>Đơn vị</td>
                <td></td>
            </tr>
        `;

        let htmlRow = '';

        for (let index = 0; index < listRange.length; index++) {
            const element = listRange[index];
            htmlRow += `
                <tr data-index="` + index + `">
                    <td>` + (index + 1) + `</td>
                    <td data-id="range_from">` + element.range_from + `</td>
                    <td><input data-id="range_to" type="number" value="` + element.range_to + `"></td>
                    <td><input data-id="change_transaction" type="number" value="` + element.change_transaction + `"></td>
                    <td>
                        <select class="unit" data-id="unit">`;
            if (element.unit == UNIT.MONEY) {
                htmlRow += `
                            <option value="` + UNIT.MONEY + `" selected>vnd</option>
                            <option value="` + UNIT.PERCENT + `">%</option>
                            `;
            } else {
                htmlRow += `
                            <option value="` + UNIT.MONEY + `">vnd</option>
                            <option value="` + UNIT.PERCENT + `" selected>%</option>
                            `;
            }
            htmlRow += `            
                        </select>
                    </td>
                    <td id="deleteRow" class="delete">x</td>
                </tr>
            `;
        }

        $(className + ' table').append(htmlHeader);
        $(className + ' table').append(htmlRow);

        // Bind event change input in table
        bindEventElementInTable(className);
    }

    /**
     * Bind event change input in table
     */
    function bindEventElementInTable(className) {
        $(className + ' table input').keyup(function() {
            let prop = $(this).data('id');
            let value = $(this).val();
            let index = $(this).closest('tr').data('index');
            listRange[index][prop] = value;

            if (prop == 'range_to' && index < (listRange.length - 1)) {
                listRange[index + 1]['range_from'] = value;
                $(className + ' table tr[data-index="' + (index + 1) + '"] td[data-id="range_from"]').text(value);
            }

            return false;
        });

        $(className + ' table select.unit').change(function() {
            let prop = $(this).data('id');
            let value = $(this).val();
            let index = $(this).closest('tr').data('index');
            listRange[index][prop] = value;

            return false;
        });

        // Event click button delete row
        $(className + ' #deleteRow').click(function() {
            let index = $(this).closest('tr').data('index');

            listRange.splice(index, 1);
            renderRow(className);
        });
    }

    /**
     * Bind event click button
     */
    function bindEventButton(className, type) {
        // Event add new row on table
        $(className + ' #addRange').click(function() {
            let row = {
                range_to: '',
                change_transaction: '',
                unit: UNIT.MONEY,
                type: type
            };

            if (listRange.length == 0) {
                row.range_from = 0;
            } else {
                row.range_from = listRange[listRange.length - 1].range_to;
            }

            listRange.push(row);
            renderRow(className);
        });

        // Event click button save range
        $(className + ' #saveRange').click(function() {
            let result = confirm("Bạn có chắc chắn muốn lưu không?");
            if (!result) {
                return;
            }

            let data = {
                action: ACTION.SAVE_SERVICE_CHANGE_MONEY,
                listRange: listRange,
                type: type
            }

            if (type = TYPE.CN_VN) {
                data.difference_rate_tm_and_tk = $('#rateDifference').val();
                data.fee_withdraw_alipay_wechat = $('#chargeWithdraw').val();
            }

            $.ajax({
                url: exchange_rate_js_vars.ajaxurl,
                type: "POST",
                data: data,
                dataType: "json",
                success: function(res) {
                    alert(res.message);
                }
            })
        });

        // Event click button delete all range
        $(className + ' #deleteAllRange').click(function() {
            listRange = [];
            renderRow(className);
        });

        bindEventCommon();
    }
});