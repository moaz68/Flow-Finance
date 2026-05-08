<?php 
function authMiddleware(){
    if(!isset($_SESSION["email"])){
        $is_localhost = strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false;
        $path = $is_localhost ? '/moaz/progect/public/pro.html' : '/public/pro.html';
        header("Location: $path");
        exit();
    }
}
function adminMiddleware(){
    authMiddleware();

    if(!isset($_SESSION["role"]) || $_SESSION["role"] !== "admin"){
        $is_localhost = strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false;
        $path = $is_localhost ? '/moaz/progect/public/pro.html' : '/public/pro.html';
        header("Location: $path");
        exit();
    }
}
?>
