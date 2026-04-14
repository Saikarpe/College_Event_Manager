<?php
/**
 * login.php
 * Authenticates a coordinator against the MySQL database.
 *
 * Method : POST
 * Params : dept_id, coord_id, password
 * Returns: JSON { success, dept_id, dept_name }  OR  { success: false, message }
 */

// Include DB connection (creates $conn variable)
include 'config.php';

// Tell the browser the response will be JSON
header('Content-Type: application/json');

// Allow requests from any origin (needed for local development / CORS)
header('Access-Control-Allow-Origin: *');

// Read POST parameters — using ?? '' to give a default empty string if not provided
$dept_id  = $_POST['dept_id']  ?? '';
$coord_id = $_POST['coord_id'] ?? '';
$password = $_POST['password'] ?? '';

// Validate all fields are filled
if (!$dept_id || !$coord_id || !$password) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit();
}

/**
 * Prepared Statement — a safe way to query the database.
 * Instead of inserting values directly into the SQL string (which allows SQL Injection),
 * we use '?' as placeholders and bind values separately.
 *
 * This prevents hackers from injecting malicious SQL code.
 */
$sql  = "SELECT * FROM coordinators WHERE dept_id = ? AND coord_id = ? AND password = ?";
$stmt = mysqli_prepare($conn, $sql);  // Prepare the statement

// Bind values to the placeholders
// 'sss' = three string parameters (s = string, i = integer)
mysqli_stmt_bind_param($stmt, 'sss', $dept_id, $coord_id, $password);

// Execute the query on the database
mysqli_stmt_execute($stmt);

// Get the result rows
$result = mysqli_stmt_get_result($stmt);
$row    = mysqli_fetch_assoc($result);   // Fetch one row as associative array

if ($row) {
    // Coordinator found — now get the department name for the response
    $deptSql  = "SELECT name FROM departments WHERE id = ?";
    $deptStmt = mysqli_prepare($conn, $deptSql);
    mysqli_stmt_bind_param($deptStmt, 's', $dept_id);
    mysqli_stmt_execute($deptStmt);
    $deptResult = mysqli_stmt_get_result($deptStmt);
    $deptRow    = mysqli_fetch_assoc($deptResult);

    // Send success response with dept info
    echo json_encode([
        'success'   => true,
        'dept_id'   => $dept_id,
        'dept_name' => $deptRow ? $deptRow['name'] : $dept_id
    ]);
} else {
    // No matching record — wrong ID or password
    echo json_encode(['success' => false, 'message' => 'Invalid Coordinator ID or password.']);
}

// Close DB connection to free resources
mysqli_close($conn);
?>
