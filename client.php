<?php
/**
 * Plugin Name: Exchange rate management client
 * Description: Exchange rate management client
 * Version: 0.1
 * Author: Tran Dang Tin
 */


 // Add javascript to client
add_action( 'wp_footer', 'load_client_style' );
function load_client_style() {
    wp_register_style( 'exchange_rate-jquery-ui', plugins_url( '/css/lib/jquery-ui.css', __FILE__ ) );
    wp_enqueue_style( 'exchange_rate-jquery-ui' );

    wp_register_style( 'exchange_rate', plugins_url( '/css/client.css', __FILE__ ) );
   wp_enqueue_style( 'exchange_rate' );
    
    wp_enqueue_script( 'exchange_rate-jquery', plugins_url( '/js/lib/jquery.min.js', __FILE__ ) );
    wp_enqueue_script( 'exchange_rate-jquery-ui', plugins_url( '/js/lib/jquery-ui.min.js', __FILE__ ) );
    
    wp_enqueue_script( 'exchange_rate-moment', plugins_url( '/js/lib/moment.min.js', __FILE__ ) );
    wp_enqueue_script( 'exchange_rate-moment', plugins_url( '/js/lib/moment-timezone-with-data.js', __FILE__ ) );
    wp_enqueue_script( 'exchange_rate-chart-js', plugins_url( '/js/lib/Chart.min.js', __FILE__ ) );
    wp_enqueue_script( 'exchange_rate-utils', plugins_url( '/js/lib/utils.js', __FILE__ ) );

    wp_enqueue_script( 'exchange_rate', plugins_url( '/js/client.js', __FILE__ ) );
 
    wp_localize_script( 'exchange_rate', 'exchange_rate_js_vars', array( 'ajax_image' => plugin_dir_url( __FILE__ ) . 'images/loading.gif', 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) );
 }

 // ==========================Area rate buy and rate sale start ========================
 /**
 * Money change service
 */
function money_rate_buy_sale_shortcode() {
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
    $Content .= '           <td><div><span class="rate_buy">'. $rateBuy . '</span><span class="arow-up"></span></div></td>';
    $Content .= '           <td><div><span class="rate_sale">'. $rateSale . '</span><span class="arow-down"></span></div></td>';
    $Content .= '       <tr>';
    $Content .= '   </table>';
    $Content .= '</div>';
	 
    return $Content;
}

add_shortcode('money-rate-buy-sale', 'money_rate_buy_sale_shortcode');

/**
 * Get data table wp_rate
 */
function get_rate_table() {
    global $wpdb;
    $rate = $wpdb->get_results("SELECT * FROM wp_rate");

    return $rate;
}

 // ==========================Area rate buy and rate sale end===========================

/**
 * Money change service
 */
function money_change_shortcode($atts) {
    $type = $atts['type'];

    $Content = '<div class="money-change">';
    $Content .= '   <div class="text">Đổi tiền Trung sang tiền Việt</div>';;
    $Content .= '   <table>';
    $Content .= '       <tr>';
    $Content .= '           <td>';
    $Content .= '               <select class="cn-vn">';
    $Content .= '                   <option value="0">Chọn nguồn tiền trung</option>';
    $Content .= '                   <option value="1">Wechat, alipay</option>';
    $Content .= '                   <option value="2">Tiền mặt</option>';
    $Content .= '                   <option value="3">Tài khoản</option>';
    $Content .= '               </select>';
    $Content .= '           </td>';
    $Content .= '           <td>';
    $Content .= '               <div class="input-money">';
    $Content .= '                   <span>$</span>';
    $Content .= '                   <input type="text" placeholder="Nhập số tiền muốn đổi" />';
    $Content .= '               </div>';
    $Content .= '           <td>';
    $Content .= '           <td>';
    $Content .= '               <div class="output-money">';
    $Content .= '                   <span>$</span>';
    $Content .= '                   <input type="text" readonly value="100.000.000 VND"/>';
    $Content .= '               </div>';
    $Content .= '           <td>';
    $Content .= '       <tr>';
    $Content .= '   </table>';
    $Content .= '</div>';
	 
    return $Content;
}

add_shortcode('money-change', 'money_change_shortcode');


// ================================Area of Chart start================================
 /**
 * Chart history shortcode
 */
function chart_history_shortcode() {

    $Content = '';
    $Content .= '<div class="chart_menu">';
    $Content .= '   <div style="width: 500px">';
    $Content .= '       <div>';
    $Content .= '           <p class="menu-select">&#8226;&#8226;&#8226;</p>';
    $Content .= '           <div class="menu-select-child">';
    $Content .= '               <ul>';
    $Content .= '                   <li class="this-week active">Tuần này</li>';
    $Content .= '                   <li class="this-month">Tháng này</li>';
    $Content .= '                   <li class="last-monnt">Tháng trước</li>';
    $Content .= '               </ul>';
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