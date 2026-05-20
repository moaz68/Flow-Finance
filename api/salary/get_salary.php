<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../api/Middleware.php';
authMiddleware();
$file = __DIR__ . '/salary.json';

if(!file_exists($file)){
     echo json_encode([
        "status" => "error",
        "message" => "Salary file not found"
    ]);
    exit;
}

$loaddata = file_get_contents($file);
$all = json_decode($loaddata, true);

if(!$all){
    $all = [];
}

$user_id = $_SESSION["email"];

if(!$user_id){
    echo json_encode([
        "status" => "error",
        "message" => "User not authenticated",
        "salary" => []
    ]);
    exit;
}

foreach($all as $item){
    if($item["email"] == $user_id){
        $usersalary = $item["salary"];
        break;
    }
}

echo json_encode([
    "status" => "success",
    "salary" => $usersalary,
]);

?>