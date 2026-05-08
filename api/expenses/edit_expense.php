<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../api/Middleware.php';
authMiddleware();
$file=__DIR__ . '/../../api/expenses/expense.json';

if(!file_exists($file)){
    echo json_encode([
        "status" => "error",
        "message" => "Expenses file not found"
    ]);
    exit;
}

$loaddata=file_get_contents($file);
$expenses =json_decode($loaddata,true);

if(!$expenses){
    $expenses=[];
}

$data=json_decode(file_get_contents("php://input"),true);

if(!$data){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}

$currentEmail = $_SESSION["email"];
$Category=$data["category"];
$Expense_name=trim(strtolower($data["title"]));
$amount =$data["amount"];
$found=false;

foreach($expenses as &$exp){
    if($exp["email"]===$currentEmail){
        $found=true;
        if(isset($Expense_name)){
            $exp["title"]=$Expense_name;
        }
        if(isset($amount)){
            $exp["amount"]=$amount;
        }
        if(isset($Category)){
            $exp["category"]=$Category;
        }
        break;
    }
}
if(!$found){
    echo json_encode([
        "status" => "error",
        "message" => "expenses not found"
    ]);
    exit;
}

file_put_contents($file,json_encode($expenses,JSON_PRETTY_PRINT));

echo json_encode([
    "status" => "success",
    "message" => "expenses updated"
]);
?>