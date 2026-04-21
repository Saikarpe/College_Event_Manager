<?php
/**
 * get_rsvp.php
 * Fetches all RSVP registrations for a specific event.
 *
 * Method : GET
 * Params : event_id (required)
 * Returns: JSON { success: true, registrations: [...], total_count: N }
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$event_id = $_GET['event_id'] ?? '';

if (!$event_id) {
    echo json_encode(['success' => false, 'message' => 'event_id is required.']);
    exit();
}

// Fetch all registrations for this event
$sql = "SELECT id, student_name, student_email, team_name, team_size, registered_at
        FROM rsvp
        WHERE event_id = ?
        ORDER BY registered_at DESC";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'i', $event_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$registrations = [];
$totalCount = 0;
while ($row = mysqli_fetch_assoc($result)) {
    $row['id'] = (int) $row['id'];
    $row['team_size'] = (int) $row['team_size'];
    $totalCount += $row['team_size'];
    $registrations[] = $row;
}

echo json_encode([
    'success' => true,
    'registrations' => $registrations,
    'total_count' => $totalCount
]);

mysqli_close($conn);
?>