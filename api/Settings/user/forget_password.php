<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../Middleware.php';
authMiddleware();
$file = __DIR__ . '/../../users.json';

if(!file_exists($file)){
    echo json_encode([
        "status" => "error",
        "message" => "Users file not found"
    ]);
    exit;
}
$loaddata=file_get_contents($file);
$users=json_decode($loaddata,true);

if(!$users){
    $users=[];
}

$data = json_decode(file_get_contents("php://input"), true);

if(!$data){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}

$currentEmail=$_SESSION["email"];
$email=$data["email"];
$code = $data["code"];




?>