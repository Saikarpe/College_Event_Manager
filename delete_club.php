<?php
/**
 * delete_club.php
 * Deletes a club and all its events (and their RSVPs) from the database.
 *
 * Method : POST
 * Params : id (club ID)
 * Returns: JSON { success: true }  OR  { success: false, message }
 *
 * Deletion order (because of FOREIGN KEY constraints):
 *   RSVPs → Events → Club
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$id = $_POST['id'] ?? '';

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Club ID is required.']);
    exit();
}

// Step 1: Get all event IDs that belong to this club
$evSql  = "SELECT id FROM events WHERE club_id = ?";
$evStmt = mysqli_prepare($conn, $evSql);
mysqli_stmt_bind_param($evStmt, 'i', $id);
mysqli_stmt_execute($evStmt);
$evResult = mysqli_stmt_get_result($evStmt);

// Step 2: For each event, delete its RSVP records first
while ($evRow = mysqli_fetch_assoc($evResult)) {
    $rsvpSql  = "DELETE FROM rsvp WHERE event_id = ?";
    $rsvpStmt = mysqli_prepare($conn, $rsvpSql);
    mysqli_stmt_bind_param($rsvpStmt, 'i', $evRow['id']);
    mysqli_stmt_execute($rsvpStmt);
}

// Step 3: Delete all events of this club
$delEvSql  = "DELETE FROM events WHERE club_id = ?";
$delEvStmt = mysqli_prepare($conn, $delEvSql);
mysqli_stmt_bind_param($delEvStmt, 'i', $id);
mysqli_stmt_execute($delEvStmt);

// Step 4: Delete the club itself
$sql  = "DELETE FROM clubs WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'i', $id);
mysqli_stmt_execute($stmt);

echo json_encode(['success' => true]);

mysqli_close($conn);
?>
