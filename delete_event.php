<?php
/**
 * delete_event.php
 * Deletes an event and its RSVP records from the database.
 *
 * Method : POST
 * Params : id (the event's ID to delete)
 * Returns: JSON { success: true }  OR  { success: false, message }
 *
 * Note: We delete RSVPs first because of the FOREIGN KEY constraint —
 * MySQL won't allow deleting a parent row (event) if child rows (rsvps) exist.
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$id = $_POST['id'] ?? '';

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Event ID is required.']);
    exit();
}

// Step 1: Delete all RSVP records linked to this event
$rsvpSql  = "DELETE FROM rsvp WHERE event_id = ?";
$rsvpStmt = mysqli_prepare($conn, $rsvpSql);
mysqli_stmt_bind_param($rsvpStmt, 'i', $id); // 'i' = integer
mysqli_stmt_execute($rsvpStmt);

// Step 2: Now safely delete the event itself
$sql  = "DELETE FROM events WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'i', $id);
mysqli_stmt_execute($stmt);

if (mysqli_stmt_affected_rows($stmt) > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Event not found.']);
}

mysqli_close($conn);
?>
