<?php

// ================================ scheduled start =============================================
global $wpdb; // this is how you get access to the database
    
// Get data rate
$rates = $wpdb->get_results("SELECT * FROM wp_rate");
$rateBuy = 0;
$rateSale = 0;
if (count($rates) > 0) {
    $rate = $rates[0]->rate;
    $rateX = $rates[0]->rate_buy;
    $rateY = $rates[0]->rate_sale;

    $rateBuy = $rate - $rateX;
    $rateSale = $rate + $rateY;
}

date_default_timezone_set('Asia/Ho_Chi_Minh');
$datepicker = date('Y-m-d');

$query = "INSERT INTO `wp_rate_history`(`rate_buy`, `rate_sale`, `date`) 
            VALUES (". $rateBuy .", ". $rateSale .", '". $datepicker ."')";

$wpdb->query( $query );

// ================================ scheduled end =============================================