<?php
/**
 * get_registrations.php
 * Fetches all RSVP registrations for a specific event.
 *
 * Method : GET
 * Params : event_id
 * Returns: JSON { success: true, registrations: [ {...}, {...} ] }
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$event_id = $_GET['event_id'] ?? '';

if (!$event_id) {
    echo json_encode(['success' => false, 'message' => 'Event ID is required.']);
    exit();
}

$sql  = "SELECT r.id, r.student_name, r.student_email, r.reg_type, r.team_name, r.registered_at,
                e.title AS event_title
         FROM rsvp r
         LEFT JOIN events e ON r.event_id = e.id
         WHERE r.event_id = ?
         ORDER BY r.registered_at DESC";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'i', $event_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$registrations = [];
while ($row = mysqli_fetch_assoc($result)) {
    $row['id'] = (int) $row['id'];
    $registrations[] = $row;
}

echo json_encode(['success' => true, 'registrations' => $registrations]);

mysqli_close($conn);
?>
