<?php 
session_start();
require_once "Middleware.php";
adminMiddleware();
header("Location: ../public/admin.html");
exit;

?>

