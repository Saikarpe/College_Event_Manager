<?php
/**
 * add_club.php
 * Inserts a new club into the database.
 *
 * Method : POST
 * Params : name, category, description, dept_id
 * Returns: JSON { success: true, id: newId }  OR  { success: false, message }
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$name        = $_POST['name']        ?? '';
$category    = $_POST['category']    ?? 'Technical';
$description = $_POST['description'] ?? '';
$dept_id     = $_POST['dept_id']     ?? '';

// Validate required fields
if (!$name || !$dept_id) {
    echo json_encode(['success' => false, 'message' => 'Club name and department are required.']);
    exit();
}

// Prepared INSERT statement
$sql  = "INSERT INTO clubs (name, category, description, dept_id) VALUES (?, ?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);

// 'ssss' = four string parameters
mysqli_stmt_bind_param($stmt, 'ssss', $name, $category, $description, $dept_id);
mysqli_stmt_execute($stmt);

if (mysqli_stmt_affected_rows($stmt) > 0) {
    $newId = mysqli_insert_id($conn);
    echo json_encode(['success' => true, 'id' => (int)$newId]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to create club.']);
}

mysqli_close($conn);
?>
