<?php
/**
 * edit_event.php
 * Updates an existing event record in the database.
 *
 * Method : POST
 * Params : id, title, club_id, event_date, event_time, venue, status, description
 * Returns: JSON { success: true }  OR  { success: false, message }
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$id          = $_POST['id']          ?? '';
$title       = $_POST['title']       ?? '';
$club_id     = $_POST['club_id']     ?? '';
$event_date  = $_POST['event_date']  ?? '';
$event_time  = $_POST['event_time']  ?? '';
$venue       = $_POST['venue']       ?? '';
$status      = $_POST['status']      ?? '';
$description = $_POST['description'] ?? '';

if (!$id || !$title || !$club_id || !$event_date || !$venue) {
    echo json_encode(['success' => false, 'message' => 'ID, Title, Club, Date and Venue are required.']);
    exit();
}

$sql  = "UPDATE events SET title = ?, club_id = ?, event_date = ?, event_time = ?, venue = ?, status = ?, description = ? WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'sisssssi', $title, $club_id, $event_date, $event_time, $venue, $status, $description, $id);
mysqli_stmt_execute($stmt);

if (mysqli_stmt_affected_rows($stmt) >= 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update event.']);
}

mysqli_close($conn);
?>
