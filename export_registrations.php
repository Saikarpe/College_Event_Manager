<?php
/**
 * export_registrations.php
 * Exports all RSVP registrations for a specific event as a CSV file download.
 *
 * Method : GET
 * Params : event_id
 * Returns: CSV file download
 */

include 'config.php';

$event_id = $_GET['event_id'] ?? '';

if (!$event_id) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Event ID is required.']);
    exit();
}

// Get event title for the filename
$evSql  = "SELECT title FROM events WHERE id = ?";
$evStmt = mysqli_prepare($conn, $evSql);
mysqli_stmt_bind_param($evStmt, 'i', $event_id);
mysqli_stmt_execute($evStmt);
$evResult = mysqli_stmt_get_result($evStmt);
$evRow    = mysqli_fetch_assoc($evResult);
$eventTitle = $evRow ? preg_replace('/[^a-zA-Z0-9_-]/', '_', $evRow['title']) : 'event';

// Fetch all registrations for this event
$sql  = "SELECT r.student_name, r.student_email, r.reg_type, r.team_name, r.registered_at
         FROM rsvp r
         WHERE r.event_id = ?
         ORDER BY r.registered_at ASC";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'i', $event_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

// Set headers for CSV download
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="registrations_' . $eventTitle . '.csv"');
header('Access-Control-Allow-Origin: *');

// Open output stream and write CSV
$output = fopen('php://output', 'w');

// Write CSV header row
fputcsv($output, ['S.No', 'Student Name', 'Email', 'Registration Type', 'Team Name', 'Registered At']);

$sno = 1;
while ($row = mysqli_fetch_assoc($result)) {
    fputcsv($output, [
        $sno++,
        $row['student_name'],
        $row['student_email'],
        ucfirst($row['reg_type']),
        $row['team_name'] ?? '—',
        $row['registered_at']
    ]);
}

fclose($output);
mysqli_close($conn);
?>
