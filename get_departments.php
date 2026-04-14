<?php
/**
 * get_departments.php
 * Fetches all departments from the database.
 *
 * Method : GET
 * Returns: JSON { success: true, departments: [ {...}, {...} ] }
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// SELECT all departments ordered by name
$sql    = "SELECT * FROM departments ORDER BY name ASC";
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
    exit();
}

$departments = [];
while ($row = mysqli_fetch_assoc($result)) {
    $departments[] = $row;
}

echo json_encode(['success' => true, 'departments' => $departments]);

mysqli_close($conn);
?>
