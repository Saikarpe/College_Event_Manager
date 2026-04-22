<?php
/**
 * edit_club.php
 * Updates an existing club record in the database.
 *
 * Method : POST
 * Params : id, name, category, description
 * Returns: JSON { success: true }  OR  { success: false, message }
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$id          = $_POST['id']          ?? '';
$name        = $_POST['name']        ?? '';
$category    = $_POST['category']    ?? '';
$description = $_POST['description'] ?? '';

if (!$id || !$name) {
    echo json_encode(['success' => false, 'message' => 'Club ID and Name are required.']);
    exit();
}

$sql  = "UPDATE clubs SET name = ?, category = ?, description = ? WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'sssi', $name, $category, $description, $id);
mysqli_stmt_execute($stmt);

if (mysqli_stmt_affected_rows($stmt) >= 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update club.']);
}

mysqli_close($conn);
?>
