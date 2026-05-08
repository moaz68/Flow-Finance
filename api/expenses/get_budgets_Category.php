<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../api/Middleware.php';
authMiddleware();

$file = __DIR__ . '/../../api/expenses/budgets.json';

if(!file_exists($file)){
    echo json_encode([
        "status" => "error",
        "message" => "budgets file not found"
    ]);
    exit;
}

$loaddata=file_get_contents($file);
$budgets =json_decode($loaddata,true);

if(!$budgets){
    $budgets=[];
}

$currentEmail=$_SESSION["email"];
$found=false;

foreach($budgets as $b){
    if($b["email"]===$currentEmail){
        echo json_encode([
            "status" => "success",
            "budgets" => $b ?? []
        ]);
        exit;
    }
}
echo json_encode([
    "status" => "error",
    "message" => "budgets not found"
]);

?>
