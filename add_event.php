<?php
/**
 * add_event.php
 * Inserts a new event record into the database.
 *
 * Method : POST
 * Params : title, club_id, dept_id, event_date, event_time, venue, status, description
 * Returns: JSON { success: true, id: newId }  OR  { success: false, message }
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Read all POST parameters with default empty string fallbacks
$title       = $_POST['title']       ?? '';
$club_id     = $_POST['club_id']     ?? '';
$dept_id     = $_POST['dept_id']     ?? '';
$event_date  = $_POST['event_date']  ?? '';
$event_time  = $_POST['event_time']  ?? '10:00 AM';
$venue       = $_POST['venue']       ?? '';
$status      = $_POST['status']      ?? 'upcoming';
$description = $_POST['description'] ?? '';

// Validate that required fields are filled
if (!$title || !$club_id || !$event_date || !$venue) {
    echo json_encode(['success' => false, 'message' => 'Title, Club, Date and Venue are required.']);
    exit();
}

/**
 * Prepared INSERT statement:
 * ? placeholders keep us safe from SQL injection.
 * rsvp_count starts at 0 for every new event.
 */
$sql  = "INSERT INTO events (title, club_id, dept_id, event_date, event_time, venue, status, description, rsvp_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)";
$stmt = mysqli_prepare($conn, $sql);

// 'sissssss' = 1 string, 1 integer, 6 strings
// s = string, i = integer
mysqli_stmt_bind_param($stmt, 'sissssss',
    $title, $club_id, $dept_id, $event_date, $event_time, $venue, $status, $description
);

mysqli_stmt_execute($stmt);

if (mysqli_stmt_affected_rows($stmt) > 0) {
    // mysqli_insert_id() returns the auto-generated ID of the newly inserted row
    $newId = mysqli_insert_id($conn);
    echo json_encode(['success' => true, 'id' => (int)$newId]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add event.']);
}

mysqli_close($conn);
?>
