<?php
$is_localhost = strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false;
$path = $is_localhost ? '/moaz/progect/public/pro.html' : '/public/pro.html';
header("Location: $path");
exit();
?>
