<?php
/**
 * rsvp.php
 * Handles student event registration (RSVP) via PHP.
 *
 * Method : POST (Content-Type: application/json)
 * Body   : JSON object with:
 *   - event_id      (required)
 *   - reg_type      'solo' or 'team'
 *   - team_name     (required for team)
 *   - members       array of { name, email } objects
 *                   Solo: 1 member, Team: 2-4 members
 *
 * Returns: JSON { success: true }  OR  { success: false, message }
 *
 * CHANGE: Now accepts JSON body and handles multiple team members.
 * Each member gets their own rsvp row. rsvp_count increases by member count.
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Read JSON body
$rawInput = file_get_contents('php://input');
$input    = json_decode($rawInput, true);

// Fallback: if JSON decode fails, try traditional POST (backward compatibility)
if (!$input) {
    $input = [
        'event_id'  => $_POST['event_id']      ?? '',
        'reg_type'  => $_POST['reg_type']       ?? 'solo',
        'team_name' => $_POST['team_name']      ?? null,
        'members'   => [
            [
                'name'  => $_POST['student_name']  ?? '',
                'email' => $_POST['student_email'] ?? ''
            ]
        ]
    ];
}

$event_id  = $input['event_id']  ?? '';
$reg_type  = $input['reg_type']  ?? 'solo';
$team_name = $input['team_name'] ?? null;
$members   = $input['members']   ?? [];

// Validate required fields
if (!$event_id) {
    echo json_encode(['success' => false, 'message' => 'Event ID is required.']);
    exit();
}

// Validate reg_type
if ($reg_type !== 'solo' && $reg_type !== 'team') {
    $reg_type = 'solo';
}

// If solo registration, clear team_name
if ($reg_type === 'solo') {
    $team_name = null;
}

// Validate members array
if (empty($members)) {
    echo json_encode(['success' => false, 'message' => 'At least one member is required.']);
    exit();
}

// For team, validate team size (2-4)
if ($reg_type === 'team') {
    if (count($members) < 2 || count($members) > 4) {
        echo json_encode(['success' => false, 'message' => 'Team must have 2-4 members.']);
        exit();
    }
    if (!$team_name) {
        echo json_encode(['success' => false, 'message' => 'Team name is required for team registration.']);
        exit();
    }
}

// Validate each member has name and email
foreach ($members as $i => $member) {
    if (empty($member['name']) || empty($member['email'])) {
        $num = $i + 1;
        echo json_encode(['success' => false, 'message' => "Member $num: Name and Email are required."]);
        exit();
    }
}

// Insert each member into rsvp table
$insertCount = 0;
$sql  = "INSERT INTO rsvp (event_id, student_name, student_email, reg_type, team_name) VALUES (?, ?, ?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);

foreach ($members as $member) {
    $name  = $member['name'];
    $email = $member['email'];
    mysqli_stmt_bind_param($stmt, 'issss', $event_id, $name, $email, $reg_type, $team_name);
    mysqli_stmt_execute($stmt);
    if (mysqli_stmt_affected_rows($stmt) > 0) {
        $insertCount++;
    }
}

if ($insertCount > 0) {
    // Increment rsvp_count by number of members registered
    $updateSql  = "UPDATE events SET rsvp_count = rsvp_count + ? WHERE id = ?";
    $updateStmt = mysqli_prepare($conn, $updateSql);
    mysqli_stmt_bind_param($updateStmt, 'ii', $insertCount, $event_id);
    mysqli_stmt_execute($updateStmt);

    echo json_encode([
        'success' => true,
        'message' => "Registered $insertCount member(s) successfully!"
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
}

mysqli_close($conn);
?>
