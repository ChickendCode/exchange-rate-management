<?php

/**
 * Plugin Name: Exchange rate management client
 * Description: Exchange rate management client
 * Version: 0.1
 * Author: Tran Dang Tin
 */


// Add javascript to client
add_action('wp_footer', 'load_client_style');
function load_client_style()
{
    wp_register_style('exchange_rate-jquery-ui', plugins_url('/css/lib/jquery-ui.css', __FILE__));
    wp_enqueue_style('exchange_rate-jquery-ui');

    wp_register_style('exchange_rate', plugins_url('/css/client.css', __FILE__));
    wp_enqueue_style('exchange_rate');

    // wp_enqueue_script( 'exchange_rate-jquery', plugins_url( '/js/lib/jquery.min.js', __FILE__ ) );
    wp_enqueue_script('exchange_rate-jquery-ui', plugins_url('/js/lib/jquery-ui.min.js', __FILE__));

    wp_enqueue_script('exchange_rate-moment', plugins_url('/js/lib/moment.min.js', __FILE__));
    wp_enqueue_script('exchange_rate-moment', plugins_url('/js/lib/moment-timezone-with-data.js', __FILE__));
    wp_enqueue_script('exchange_rate-chart-js', plugins_url('/js/lib/Chart.min.js', __FILE__));
    wp_enqueue_script('exchange_rate-utils', plugins_url('/js/lib/utils.js', __FILE__));

    wp_enqueue_script('exchange_rate_common', plugins_url('/js/common.js', __FILE__));
    wp_enqueue_script('exchange_rate', plugins_url('/js/client.js', __FILE__));

    wp_localize_script('exchange_rate', 'exchange_rate_js_vars', array('ajax_image' => plugin_dir_url(__FILE__) . 'images/loading.gif', 'ajaxurl' => admin_url('admin-ajax.php')));
}

// ==========================Area rate buy and rate sale start ========================
/**
 * Money change service
 */
function money_rate_buy_sale_shortcode()
{
    $rates = get_rate_table();
    $rateBuy = '';
    $rateSale = '';
    if (count($rates) > 0) {
        $rate = $rates[0]->rate;
        $rateX = $rates[0]->rate_buy;
        $rateY = $rates[0]->rate_sale;

        $rateBuy = $rate - $rateX;
        $rateSale = $rate + $rateY;
    }

    $Content = '<div class="money-rate-buy-sale hide">';
    $Content .= '   <div class="text">Tỷ giá tiền trung hôm nay <span class="date"></span> lúc <span class="time"><span></div>';;
    $Content .= '   <table>';
    $Content .= '       <tr>';
    $Content .= '           <td class="title">MUA VÀO</td>';
    $Content .= '           <td class="title">BÁN RA</td>';
    $Content .= '       <tr>';
    $Content .= '       <tr>';
    $Content .= '           <td><div><span class="rate_buy">' . $rateBuy . '</span><span class="arow-up"></span></div></td>';
    $Content .= '           <td><div><span class="rate_sale">' . $rateSale . '</span><span class="arow-down"></span></div></td>';
    $Content .= '       <tr>';
    $Content .= '   </table>';
    $Content .= '</div>';

    return $Content;
}

add_shortcode('money-rate-buy-sale', 'money_rate_buy_sale_shortcode');

/**
 * Get data table wp_rate
 */
function get_rate_table()
{
    global $wpdb;
    $rate = $wpdb->get_results("SELECT * FROM wp_rate");

    return $rate;
}

// ==========================Area rate buy and rate sale end===========================

/**
 * Money change service
 */
function money_change_shortcode($atts)
{
    $VN_CN = 'VN_CN';
    $CN_VN = 'CN_VN';
    $TTH = 'TTH';
    $type = $atts['type'];

    // Get data rate
    $rates = get_rate_table();
    $rateBuy = 0;
    $rateSale = 0;
    if (count($rates) > 0) {
        $rate = $rates[0]->rate;
        $rateX = $rates[0]->rate_buy;
        $rateY = $rates[0]->rate_sale;

        $rateBuy = $rate - $rateX;
        $rateSale = $rate + $rateY;
    }

    // get_wp_service_change_money_option

    $get_wp_service_change_money_option = get_wp_service_change_money_option();
    $fee_withdraw_alipay_wechat = 0;
    $difference_rate_tm_and_tk = 0;

    if (count($get_wp_service_change_money_option) > 0) {
        $fee_withdraw_alipay_wechat = $get_wp_service_change_money_option[0]->fee_withdraw_alipay_wechat;
        $difference_rate_tm_and_tk = $get_wp_service_change_money_option[0]->difference_rate_tm_and_tk;
    }

    $Content = '<div class="money-change">';
    $Content .= '   <input class="rate-buy" type="hidden" value="' . $rateBuy . '" />';
    $Content .= '   <input class="rate-sale" type="hidden" value="' . $rateSale . '" />';
    if ($type == $CN_VN) {
        $Content .= '   <div class="title">Đổi tiền Trung sang tiền Việt</div>';
        $Content .= '   <input class="fee_withdraw_alipay_wechat" type="hidden" value="' . $fee_withdraw_alipay_wechat . '" />';
        $Content .= '   <input class="difference_rate_tm_and_tk" type="hidden" value="' . $difference_rate_tm_and_tk . '" />';
    } else if ($type == $VN_CN) {
        $Content .= '   <div class="title">Đổi tiền Việt sang tiền Trung</div>';
    } else if ($type == $TTH) {
        $Content .= '   <div class="title">Thanh toán hộ</div>';
    }

    $Content .= ' <div class="money-change-table">';
    $Content .= '           <div>';

    if ($type == $CN_VN) {
        $Content .= '               <select class="' . $CN_VN . '">';
        $Content .= '                   <option value="0">Chọn nguồn tiền trung</option>';
        $Content .= '                   <option value="1">Wechat, alipay</option>';
        $Content .= '                   <option value="2">Tiền mặt</option>';
        $Content .= '                   <option value="3">Tài khoản</option>';
        $Content .= '               </select>';
    } else if ($type == $VN_CN) {
        $Content .= '               <select class="' . $VN_CN . '">';
        $Content .= '                   <option value="0">Chọn nguồn tiền trung</option>';
        $Content .= '                   <option value="1">Nạp tệ wechat, alipay</option>';
        $Content .= '                   <option value="2">Chuyển khoản</option>';
        $Content .= '               </select>';
    } else if ($type == $TTH) {
        $Content .= '               <select class="' . $TTH . '">';
        $Content .= '                   <option value="0">Chọn trang cần thanh toán</option>';
        $Content .= '                   <option value="1">Taobao</option>';
        $Content .= '                   <option value="2">1688</option>';
        $Content .= '                   <option value="3">Khác</option>';
        $Content .= '               </select>';
    }

    $Content .= '           </div>';
    $Content .= '           <div class="money input-money">';
    $Content .= '                <span>$</span>';
    $Content .= '                <input type="text" placeholder="Nhập số tiền muốn đổi" />';
    $Content .= '           </div>';
    $Content .= '           <div class="money output-money">';
    $Content .= '               <span>$</span>';
    $Content .= '               <input type="text" readonly value="0 VND"/>';
    $Content .= '           </div>';
    $Content .= '   </div>';
    $Content .= '   <div class="footer">';
    $Content .= '       <input class="money-change-type" type="hidden" value="' . $type . '" />';
    $Content .= '   </div>';
    $Content .= '</div>';

    return $Content;
}

add_shortcode('money-change', 'money_change_shortcode');

/**
 * Get data table wp_service_change_money_option
 */
function get_wp_service_change_money_option()
{
    global $wpdb;
    $wp_service_change_money_option = $wpdb->get_results("SELECT * FROM wp_service_change_money_option");

    return $wp_service_change_money_option;
}


// ================================Area of Chart start================================
/**
 * Chart history shortcode
 */
function chart_history_shortcode()
{

    $Content = '<div class="chart_menu hide">';
    $Content .= '   <div class="form-search">';
    $Content .= '       <input placeholder="Ngày bắt đầu" type="text" id="startDate">';
    $Content .= '       <input placeholder="Ngày kết thúc" type="text" id="endDate">';
    $Content .= '   </div>';
    $Content .= '   <div style="width: 100%;">';
    $Content .= '       <div style="float: right">';
    $Content .= '           <div class="menu-select-child dropdown">';
    $Content .= '               <p class="menu-select">&#8226;&#8226;&#8226;</p>';
    $Content .= '               <div class="dropdown-content">';
    $Content .= '                   <ul>';
    $Content .= '                       <li class="this-month active">Tháng này</li>';
    $Content .= '                       <li class="last-monnt">Tháng trước</li>';
    $Content .= '                   </ul>';
    $Content .= '            </div>';
    $Content .= '           </div>';
    $Content .= '       </div>';
    $Content .= '       <div id="legend" class="chart-legend"></div>';
    $Content .= '       <div class="area-chart">';
    $Content .= '       </div>';
    $Content .= '   </div>';
    $Content .= '</div>';

    return $Content;
}

add_shortcode('chart-history', 'chart_history_shortcode');

// ================================Area of Chart end================================

/**
 * Rate buy shortcode
 */
function rate_buy_shortcode($atts)
{

    // Get data rate
    $rates = get_rate_table();
    $rateBuy = 0;
    if (count($rates) > 0) {
        $rate = $rates[0]->rate;
        $rateX = $rates[0]->rate_buy;

        $rateBuy = $rate - $rateX;
    }

    $Content = '<span>Tỷ giá mua: </span>'.$rateBuy;

    return $Content;
}

add_shortcode('get_rate_buy', 'rate_buy_shortcode');

/**
 * Rate sale shortcode
 */
function rate_sale_shortcode($atts)
{

    // Get data rate
    $rates = get_rate_table();
    $rateSale = '';
    if (count($rates) > 0) {
        $rate = $rates[0]->rate;
        $rateY = $rates[0]->rate_sale;

        $rateSale = $rate + $rateY;
    }

    $Content = '<span>Tỷ giá bán: </span>'.$rateSale;

    return $Content;
}

add_shortcode('get_rate_sale', 'rate_sale_shortcode');

/**
 * Charge transaction shortcode
 */
function charge_trans_shortcode($atts)
{

    $Content = '<span>Phí giao dịch: </span><span class="charge_trans_display"></span>';

    return $Content;
}

add_shortcode('charge_trans', 'charge_trans_shortcode');


/**
 * Money real recive shortcode
 */
function money_real_recive_shortcode($atts)
{

    // Get data rate
    $Content = '<span>Số tiền việt cần thanh toán: </span><span class="money_real_recive_display"></span>';

    return $Content;
}

add_shortcode('money_real_recive', 'money_real_recive_shortcode');


/**
 * Withdrawal fee shortcode
 */
function withdrawal_fee_shortcode($atts)
{

    // Get data rate
    $Content = '<span>Phí rút tiền Wechat: </span><span class="withdrawal_fee_display"></span>';

    return $Content;
}

add_shortcode('withdrawal_fee', 'withdrawal_fee_shortcode');