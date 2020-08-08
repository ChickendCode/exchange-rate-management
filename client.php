<?php
/**
 * Plugin Name: Exchange rate management client
 * Description: Exchange rate management client
 * Version: 0.1
 * Author: Tran Dang Tin
 */

 /**
 * Money change service
 */
function money_change_cn_vn_shortcode() {

    $Content = '<div>';
    $Content = 'Đổi tiền Trung sang tiền Việt';
	$Content .= '</div>';
	 
    return $Content;
}

add_shortcode('money-change-cn-vn', 'money_change_cn_vn_shortcode');