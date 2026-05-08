<?php
session_start();
require_once __DIR__ . '/../api/Middleware.php';
authMiddleware();


$user = $_SESSION["email"];
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Dashboard</title><link rel="stylesheet" href="../assets/css/dashboard.css">
</head>

<body>

<div class="container">

<h2>Welcome 🎉</h2>

<p>You are logged in as: <?php echo htmlspecialchars($user); ?></p>

<button onclick="logout()">Logout</button>

</div><script src="../assets/js/dashboard.js" defer></script>
</body>
</html>
