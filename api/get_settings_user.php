<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/Middleware.php';
authMiddleware();
$file = __DIR__ . '/users.json';

if(!file_exists($file)){
     echo json_encode([
        "status" => "error",
        "message" => "users file not found"
    ]);
    exit;
}

$loaddata = file_get_contents($file);
$users = json_decode($loaddata, true);

if(!$users){
    $users = [];
}

$currentEmail=$_SESSION["email"];
foreach($users as $user){
    if($user["email"]===$currentEmail){
        echo json_encode([
            "status" => "success",
            "name"=>$user["name"],
            "email"=>$user["email"],
            "currency"=>$user["currency"] ?? "USD",
            "role"=>$user["role"],
        ]);
        exit;
    }
}

echo json_encode([
    "status" => "error",
    "message" => "users not found"
]);

?>