<?php
/**
 * submit_rsvp.php
 * Handles RSVP registration for events.
 *
 * Method : POST
 * Params : event_id, student_name, student_email
 *          (optional) reg_type = 'team', team_name, team_size
 * Returns: JSON { success: true, rsvp_count: <updatedCount> }
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Read POST data
$event_id      = isset($_POST['event_id'])      ? (int)$_POST['event_id']         : 0;
$student_name  = isset($_POST['student_name'])  ? trim($_POST['student_name'])     : '';
$student_email = isset($_POST['student_email']) ? trim($_POST['student_email'])    : '';
$reg_type      = isset($_POST['reg_type'])      ? trim($_POST['reg_type'])         : 'individual';
$team_name     = isset($_POST['team_name'])     ? trim($_POST['team_name'])        : '';
$team_size     = isset($_POST['team_size'])     ? (int)$_POST['team_size']         : 1;

// Validate required fields
if (!$event_id || !$student_name || !$student_email) {
    echo json_encode(['success' => false, 'message' => 'Event ID, name, and email are required.']);
    exit();
}

// Validate email format
if (!filter_var($student_email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit();
}

// Make sure the event exists
$check = mysqli_prepare($conn, "SELECT id FROM events WHERE id = ?");
if (!$check) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
    exit();
}
mysqli_stmt_bind_param($check, 'i', $event_id);
mysqli_stmt_execute($check);
$checkResult = mysqli_stmt_get_result($check);
if (mysqli_num_rows($checkResult) === 0) {
    echo json_encode(['success' => false, 'message' => 'Event not found.']);
    exit();
}

// Check for duplicate registration (same email for same event)
$dupCheck = mysqli_prepare($conn, "SELECT id FROM rsvp WHERE event_id = ? AND student_email = ?");
if (!$dupCheck) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
    exit();
}
mysqli_stmt_bind_param($dupCheck, 'is', $event_id, $student_email);
mysqli_stmt_execute($dupCheck);
$dupResult = mysqli_stmt_get_result($dupCheck);
if (mysqli_num_rows($dupResult) > 0) {
    echo json_encode(['success' => false, 'message' => 'You have already registered for this event.']);
    exit();
}

// Determine team info
if ($reg_type === 'team') {
    if (!$team_name) {
        echo json_encode(['success' => false, 'message' => 'Team name is required for team registration.']);
        exit();
    }
    $team_size = max(2, min(10, $team_size)); // Clamp between 2 and 10
} else {
    $team_name = null;
    $team_size = 1;
}

// Insert RSVP record
$stmt = mysqli_prepare($conn, "INSERT INTO rsvp (event_id, student_name, student_email, team_name, team_size) VALUES (?, ?, ?, ?, ?)");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($conn)]);
    exit();
}
mysqli_stmt_bind_param($stmt, 'isssi', $event_id, $student_name, $student_email, $team_name, $team_size);
mysqli_stmt_execute($stmt);

if (mysqli_stmt_affected_rows($stmt) > 0) {
    // Get updated total RSVP count for this event
    $countStmt = mysqli_prepare($conn, "SELECT COALESCE(SUM(team_size), 0) AS total FROM rsvp WHERE event_id = ?");
    mysqli_stmt_bind_param($countStmt, 'i', $event_id);
    mysqli_stmt_execute($countStmt);
    $countResult = mysqli_stmt_get_result($countStmt);
    $countRow    = mysqli_fetch_assoc($countResult);
    $totalRsvp   = (int)$countRow['total'];

    // Sync rsvp_count in events table
    $updateStmt = mysqli_prepare($conn, "UPDATE events SET rsvp_count = ? WHERE id = ?");
    mysqli_stmt_bind_param($updateStmt, 'ii', $totalRsvp, $event_id);
    mysqli_stmt_execute($updateStmt);

    echo json_encode([
        'success'    => true,
        'message'    => 'Registered successfully!',
        'rsvp_count' => $totalRsvp
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
}

mysqli_close($conn);
?>
