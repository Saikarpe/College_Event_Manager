<?php
/**
 * config.php
 * Database connection configuration file.
 *
 * Every other PHP file in this project includes this file
 * using: include 'config.php';
 * This avoids repeating the connection code everywhere.
 */

// Suppress PHP error HTML output — errors are returned as JSON instead
// This prevents "<br /><b>Warning</b>..." from corrupting the JSON response
error_reporting(0);
ini_set('display_errors', '0');

// Database server host — 'localhost' means the same machine running XAMPP
define('DB_HOST', 'localhost');

// MySQL username — default on XAMPP is 'root'
define('DB_USER', 'root');

// MySQL password — XAMPP default is empty string ''
// Change this ONLY if you manually set a MySQL root password
define('DB_PASS', '');

// The name of our database (created in college_events.sql)
define('DB_NAME', 'college_events');

try {
    $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
} catch (Exception $e) {
    // Send a JSON error response and stop the script
    http_response_code(500); // HTTP 500 = Internal Server Error
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit(); // Stop all further execution
}

// Set character encoding to UTF-8 so special characters work correctly
mysqli_set_charset($conn, 'utf8mb4');
?>