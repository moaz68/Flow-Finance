<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../api/Middleware.php';
authMiddleware();
$file = __DIR__ . '/expense.json';


if(!file_exists($file)){
     echo json_encode([
        "status" => "error",
        "message" => "Expenses file not found"
    ]);
    exit;
}
$loaddata = file_get_contents($file);
$expenses = json_decode($loaddata, true);

if(!$expenses){
    $expenses = [];
}
$user_id = $_SESSION["email"];
if(!$user_id){
    echo json_encode([
        "status" => "error",
        "message" => "User not authenticated",
        "expenses" => []
    ]);
    exit;
}


$currentMonth = date("Y-m");

$userExpenses= array_filter($expenses,function($exp) use ($user_id,$currentMonth ){
    return isset($exp["email"])
     && $exp["email"]==$user_id
     && isset($exp["date"])
     && str_starts_with($exp["date"],$currentMonth);
});

$userExpenses = array_values($userExpenses);

echo json_encode([
    "status" => "success",
    "expenses" => $userExpenses,
]);



?>