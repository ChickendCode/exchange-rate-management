<?php
/**
 * Plugin Name: Exchange rate management admin
 * Description: Exchange rate management admin
 * Version: 0.1
 * Author: Tran Dang Tin
 */

 // ============================== Area config start ==========================================
 // Update CSS within in Admin
 
function load_admin_style() {
   wp_register_style( 'exchange_rate-jquery-ui', plugins_url( '/css/lib/jquery-ui.css', __FILE__ ) );
   wp_enqueue_style( 'exchange_rate-jquery-ui' );

   wp_register_style( 'exchange_rate', plugins_url( '/css/admin.css', __FILE__ ) );
   wp_enqueue_style( 'exchange_rate' );
   
   wp_enqueue_script( 'exchange_rate-jquery', plugins_url( '/js/lib/jquery.min.js', __FILE__ ) );
   wp_enqueue_script( 'exchange_rate-jquery-ui', plugins_url( '/js/lib/jquery-ui.min.js', __FILE__ ) );
   
   wp_enqueue_script( 'exchange_rate-moment', plugins_url( '/js/lib/moment.min.js', __FILE__ ) );
   wp_enqueue_script( 'exchange_rate-chart-js', plugins_url( '/js/lib/Chart.min.js', __FILE__ ) );
   wp_enqueue_script( 'exchange_rate-utils', plugins_url( '/js/lib/utils.js', __FILE__ ) );

   wp_enqueue_script( 'exchange_rate', plugins_url( '/js/admin.js', __FILE__ ) );

   wp_localize_script( 'exchange_rate', 'exchange_rate_js_vars', array( 'ajax_image' => plugin_dir_url( __FILE__ ) . 'images/loading.gif', 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) );
}
  add_action( 'admin_enqueue_scripts', 'load_admin_style' );

/**
 * Crate table when active plugin
 */
function create_plugin_database_table() {
    global $wpdb;

    // Create table Rate
    $wp_rate_table = 'wp_rate';

    #Check to see if the table exists already, if not, then create it
    if($wpdb->get_var( "show tables like wp_rate" ) != $wp_rate_table) 
    {

        $sql = "CREATE TABLE `". $wp_rate_table . "` ( ";
        $sql .= "  `id`  int(11)   NOT NULL auto_increment, ";
        $sql .= "  `rate`  int(128)   NOT NULL, ";
        $sql .= "  `rate_buy`  int(128)   NOT NULL, ";
        $sql .= "  `rate_sale`  int(128)   NOT NULL, ";
        $sql .= "  PRIMARY KEY `rate_id` (`id`) "; 
        $sql .= ") ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ; ";
        require_once( ABSPATH . '/wp-admin/includes/upgrade.php' );
        dbDelta($sql);
    }

    // Create table Rate history
    $wp_rate_history_table = 'wp_rate_history';

    #Check to see if the table exists already, if not, then create it
    if($wpdb->get_var( "show tables like wp_rate_history" ) != $wp_rate_history_table) 
    {

        $sql = "CREATE TABLE `". $wp_rate_history_table . "` ( ";
        $sql .= "  `id`  int(11)   NOT NULL auto_increment, ";
        $sql .= "  `rate_buy`  int(128)   NOT NULL, ";
        $sql .= "  `rate_sale`  int(128)   NOT NULL, ";
        $sql .= "  `date`  date   NOT NULL DEFAULT '0000-00-00', ";
        $sql .= "  PRIMARY KEY `rate_history_id` (`id`) "; 
        $sql .= ") ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ; ";
        require_once( ABSPATH . '/wp-admin/includes/upgrade.php' );
        dbDelta($sql);
    }
}

 register_activation_hook( __FILE__, 'create_plugin_database_table' );

 // ============================== Area config end ==========================================
 
 // ============================== Area of menu Tỷ giá start ================================
 function exchange_rate_menu_admin() {
    add_menu_page(
        __( 'Cấu hình tỷ giá', 'ty-gia' ),
        __( 'Tỷ giá', 'ty-gia' ),
        'manage_options',
        'ty-gia',
        'exchange_rate_menu_content',
        'dashicons-schedule',
        3
    );
}

function exchange_rate_menu_content() {
    $rate = '';
    $rateBuy = '';
    $rateSale = '';

    $rates = get_rate();
    if (count($rates) > 0) {
        $rate = $rates[0]->rate;
        $rateBuy = $rates[0]->rate_buy;
        $rateSale = $rates[0]->rate_sale;
    }

    ?>
        <div class="exchange_rate_menu">
            <h1>
                <?php esc_html_e( 'Cấu hình tỷ giá', 'my-plugin-textdomain' ); ?>
            </h1>
            <table>
                <tr>
                    <td>Tỷ giá</td>
                    <td colspan="2"><input value="<?php esc_html_e( $rate, 'my-plugin-textdomain' ); ?>" style="width: 100%;" type="number" id="rate" placeholder="Nhập tỷ giá"></td>
                </tr>
                <tr>
                    <td>Giá trị X (Tỷ giá mua)</td>
                    <td><input value="<?php esc_html_e( $rateBuy, 'my-plugin-textdomain' ); ?>" type="number" id="rateBuy" placeholder="Nhập X"></td>
                    <td class="price-buy"><label id="priceBuy"></label></td>
                </tr>
                <tr>
                    <td>Giá trị Y (Tỷ giá bán)</td>
                    <td><input value="<?php esc_html_e( $rateSale, 'my-plugin-textdomain' ); ?>" type="number" id="rateSale" placeholder="Nhập Y"></td>
                    <td class="price-sale"><label id="priceSale"></label></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td><button id="saveRate">Lưu dữ liệu</button></td>
                </tr>
            </table>
        </div>
    <?php
}

add_action( 'admin_menu', 'exchange_rate_menu_admin' );

/**
 * Add action process save rate
 */
add_action( 'wp_ajax_save_rate', 'save_rate' );
function save_rate() {
	try {
		global $wpdb; // this is how you get access to the database
		
		$rate = $_POST['rate'];
        $rateBuy = $_POST['rateBuy'];
        $rateSale = $_POST['rateSale'];

        $rates = get_rate();
        // Update data
        if (count($rates) > 0) {
            // Create query update
            $query = 'UPDATE `wp_rate` 
                    SET `rate`='. $rate .',`rate_buy`='. $rateBuy .',`rate_sale`='. $rateSale.'';
        
        // Insert data
        } else {
            // Create query insert
            $query = 'INSERT INTO `wp_rate`(`rate`, `rate_buy`, `rate_sale`) 
            VALUES ('. $rate .' , '. $rateBuy .', '. $rateSale .')';
        }
		
		$wpdb->query( $query );

		wp_send_json( array('success' => true, 'message' => 'Lưu thành công'), $status_code = null );
	
	} catch (Exception $e) {
		wp_send_json( array('fail' => false, 'message' => 'Lưu không thành công'), $status_code = null );
	}
}

/**
 * Get data table wp_rate
 */
function get_rate() {
    global $wpdb;
    $rate = $wpdb->get_results("SELECT * FROM wp_rate");

    return $rate;
}
// ================================Area of menu Tỷ giá end ================================

// ================================Area of menu DV đổi tiền VN-CN start================================
function money_change_vn_cn_menu_admin() {
    add_menu_page(
        __( 'DV đổi tiền VN-CN', 'doi-tien-viet-trung' ),
        __( 'DV đổi tiền VN-CN', 'doi-tien-viet-trung' ),
        'manage_options',
        'doi-tien-viet-trung',
        'money_change_vn_cn_menu_content',
        'dashicons-schedule',
        3
    );
}

function money_change_vn_cn_menu_content() {
    ?>
        <h1>
            <?php esc_html_e( 'DV đổi tiền VN-CN', 'my-plugin-textdomain' ); ?>
        </h1>
    <?php
}

add_action( 'admin_menu', 'money_change_vn_cn_menu_admin' );
// ================================Area of menu DV đổi tiền VN-CN end================================

// ================================Area of menu Biểu đồ start================================
function chart_menu_admin() {
    add_menu_page(
        __( 'Biểu đồ', 'bieu-do' ),
        __( 'Biểu đồ', 'bieu-do' ),
        'manage_options',
        'bieu-do',
        'chart_menu_content',
        'dashicons-schedule',
        3
    );
}

function chart_menu_content() {
    ?>
    <div class="chart_menu">
        <h1>
            <?php esc_html_e( 'BIỂU ĐỒ LỊCH SỬ TỶ GIÁ', 'my-plugin-textdomain' ); ?>
        </h1>
        <table>
            <tr>
                <td>Chọn ngày cần sửa</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td colspan="2"><input style="width: 100%;" type="text" id="datepicker" width="100%"></td>
                <td><button id="viewRateHistory">Xem dữ liệu</button></td>
            </tr>
            <tr>
                <td>Tỷ giá mua</td>
                <td>Tỷ giá bán</td>
                <td></td>
            </tr>
            <tr>
                <td><input type="number" id="rateBuy"></td>
                <td><input type="number" id="rateSale"></td>
                <td><button id="saveRateHistory">Lưu dữ liệu</button></td>
            </tr>
        </table>
        <div style="width: 500px">
            <canvas id="chart1"></canvas>
        </div>
    </div>
<?php
}

add_action( 'admin_menu', 'chart_menu_admin' );

/**
 * Add action process save rate history
 */
add_action( 'wp_ajax_save_rate_history', 'save_rate_history' );
function save_rate_history() {
	try {
		global $wpdb; // this is how you get access to the database
		
        $rateBuy = $_POST['rateBuy'];
        $rateSale = $_POST['rateSale'];
        $parts = explode('/', $_POST['datepicker']);
        $datepicker  = "$parts[2]-$parts[1]-$parts[0]";

        $rate_history = get_rate_history_by_date($datepicker);
        // Update data
        if (count($rate_history) > 0) {
            // Create query update
            $query = "UPDATE `wp_rate_history` 
                    SET `rate_buy`=". $rateBuy .",`rate_sale`=". $rateSale."
                    where date='". $datepicker."'";
        
        // Insert data
        } else {
            // Create query insert
            $query = "INSERT INTO `wp_rate_history`(`rate_buy`, `rate_sale`, `date`) 
                    VALUES (". $rateBuy .", ". $rateSale .", '". $datepicker ."')";
        }
		
		$wpdb->query( $query );

		wp_send_json( array('success' => true, 'message' => 'Lưu thành công'), $status_code = null );
	
	} catch (Exception $e) {
		wp_send_json( array('fail' => false, 'message' => 'Lưu không thành công'), $status_code = null );
	}
}

/**
 * Add action process save rate history
 */
add_action( 'wp_ajax_view_rate_history', 'view_rate_history' );
function view_rate_history() {
	try {
        $parts = explode('/', $_POST['datepicker']);
        $datepicker  = "$parts[2]-$parts[1]-$parts[0]";

        $rate_history = get_rate_history_by_date($datepicker);
        // Update data
        if (count($rate_history) > 0) {
            wp_send_json( array('status_code'=> 200, 'success' => true, 'message' => '', 'data'=> $rate_history[0]), $status_code = 200 );
        
        } else {
            wp_send_json( array('status_code'=> 400, 'success' => true, 'message' => 'Không tìm thấy dữ liệu',  'data'=> []), $status_code = 404 );
        }
	
	} catch (Exception $e) {
		wp_send_json( array('fail' => false, 'message' => 'Error server'), $status_code = null );
	}
}

/**
 * Add action process save rate history
 */
add_action( 'wp_ajax_get_all_rate_history', 'get_all_rate_history' );
function get_all_rate_history() {
	try {
        global $wpdb;
        $rate_history = $wpdb->get_results("SELECT * FROM wp_rate_history");
        wp_send_json( array('status_code'=> 200, 'success' => true, 'message' => '', 'data'=> $rate_history), $status_code = 200 );
	
	} catch (Exception $e) {
		wp_send_json( array('fail' => false, 'message' => 'Error server'), $status_code = null );
	}
}

function get_rate_history_by_date($date) {
    global $wpdb;
    $rate_history = $wpdb->get_results("SELECT * FROM wp_rate_history where date='".$date."'");

    return $rate_history;
}
// ================================Area of menu Biểu đồ end================================