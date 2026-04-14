<?php
/**
 * get_events.php
 * Fetches all events from the database, including the club name.
 *
 * Method : GET
 * Returns: JSON { success: true, events: [ {...}, {...} ] }
 *
 * SQL Concept — JOIN:
 * We use LEFT JOIN to combine data from two tables:
 *   events (e) and clubs (c)
 * The condition e.club_id = c.id links them.
 * AS club_name gives the club's name column an alias.
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// SQL query: select all event columns + the club name from clubs table
$sql = "SELECT e.*, c.name AS club_name
        FROM events e
        LEFT JOIN clubs c ON e.club_id = c.id
        ORDER BY e.event_date ASC";

// mysqli_query() runs a simple SQL query (no user input, so no need for prepared statement)
$result = mysqli_query($conn, $sql);

// Check for SQL error
if (!$result) {
    echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
    exit();
}

// Loop through all rows and collect them into an array
$events = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Cast numeric fields from string (MySQL returns all as strings) to int
    $row['id']         = (int) $row['id'];
    $row['club_id']    = (int) $row['club_id'];
    $row['rsvp_count'] = (int) $row['rsvp_count'];
    $events[] = $row;
}

// json_encode() converts the PHP array into a JSON string
echo json_encode(['success' => true, 'events' => $events]);

mysqli_close($conn);
?>
