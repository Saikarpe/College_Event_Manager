<?php
/**
 * get_clubs.php
 * Fetches all clubs from the database.
 *
 * Method : GET
 * Returns: JSON { success: true, clubs: [ {...}, {...} ] }
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Simple SELECT query — get all clubs, sorted by name alphabetically
$sql    = "SELECT * FROM clubs ORDER BY name ASC";
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
    exit();
}

$clubs = [];
while ($row = mysqli_fetch_assoc($result)) {
    $row['id'] = (int) $row['id']; // Cast id to integer
    $clubs[]   = $row;
}

echo json_encode(['success' => true, 'clubs' => $clubs]);

mysqli_close($conn);
?>
