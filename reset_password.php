<?php
/**
 * reset_password.php
 * Resets the coordinator's password after verifying their identity.
 *
 * Method : POST
 * Params : coord_id, dept_name (security answer — must match the department name)
 * Returns: JSON { success, new_password }  OR  { success: false, message }
 *
 * SECURITY IMPROVEMENT:
 * - Instead of revealing the existing password, a NEW random password is generated.
 * - The coordinator must type the correct department NAME (not select from dropdown)
 *   to prove their identity. This acts as a security question.
 * - The old password is replaced in the database, so any unauthorized reset
 *   would be immediately noticed by the real coordinator.
 */

include 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$coord_id  = $_POST['coord_id']  ?? '';
$dept_name = $_POST['dept_name'] ?? '';

if (!$coord_id || !$dept_name) {
    echo json_encode(['success' => false, 'message' => 'Coordinator ID and Department Name are required.']);
    exit();
}

// Step 1: Look up the coordinator by coord_id and verify department name
// Join coordinators with departments to match the department NAME (not ID)
$sql  = "SELECT c.id, c.dept_id, d.name AS dept_name 
         FROM coordinators c 
         JOIN departments d ON c.dept_id = d.id 
         WHERE c.coord_id = ? AND LOWER(d.name) = LOWER(?)";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'ss', $coord_id, $dept_name);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$row    = mysqli_fetch_assoc($result);

if ($row) {
    // Step 2: Generate a new random password (8 characters, alphanumeric + special)
    $chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789@#$!';
    $new_password = '';
    for ($i = 0; $i < 8; $i++) {
        $new_password .= $chars[random_int(0, strlen($chars) - 1)];
    }

    // Step 3: Update the password in the database
    $updateSql  = "UPDATE coordinators SET password = ? WHERE id = ?";
    $updateStmt = mysqli_prepare($conn, $updateSql);
    mysqli_stmt_bind_param($updateStmt, 'si', $new_password, $row['id']);
    mysqli_stmt_execute($updateStmt);

    if (mysqli_stmt_affected_rows($updateStmt) > 0) {
        echo json_encode([
            'success'      => true,
            'new_password' => $new_password,
            'message'      => 'Password has been reset successfully. Please use this new password to login.'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to reset password. Please try again.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Verification failed. The Coordinator ID or Department Name is incorrect.']);
}

mysqli_close($conn);
?>
