<?php

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once "../Middleware.php";
adminMiddleware();
$file = __DIR__ . '/../users.json';
$file2 = __DIR__ . '/../expenses/expense.json';
$file3 = __DIR__ . '/../expenses/budgets.json';
$file4 = __DIR__ . '/../salary/salary.json';

if(!file_exists($file)){
    echo json_encode([
        "status" => "error",
        "message" => "Users file not found"
    ]);
    exit;
}


$loaddata=file_get_contents($file);
$users =json_decode($loaddata,true);

$expenses = file_exists($file2) ? (json_decode(file_get_contents($file2), true) ?? []) : [];
$budgets  = file_exists($file3) ? (json_decode(file_get_contents($file3), true) ?? []) : [];
$salary   = file_exists($file4) ? (json_decode(file_get_contents($file4), true) ?? []) : [];

if(!$users){
    $users = [];
}

if(!$expenses){
    $expenses=[];
}

if(!$budgets){
    $budgets=[];
}

if(!$salary){
    $salary=[];
}

$data=json_decode(file_get_contents("php://input"),true);

if(!$data){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}


$email=$data["email"];
$found=false;

foreach($users as $key => $user){
    if( $user["email"]===$email){
        if($user["role"]=='admin'){
            echo json_encode([
                "status" => "error",
                "message" => "User Is Admin"
            ]);
            exit;
        }
        $found=true;
        unset($users[$key]);
    }
}
foreach($expenses as $key => $exp){
    if($exp["email"]===$email){
        $found=true;
        unset($expenses[$key]);
    }
}
foreach($budgets as $key => $b){
    if($b["email"]===$email){
        $found=true;
        unset($budgets[$key]);
    }
}
foreach($salary as $key => $s){
    if($s["email"]===$email){
        $found=true;
        unset($salary[$key]);
    }
}
if(!$found){
    echo json_encode([
        "status" => "error",
        "message" => "User not found"
    ]);
    exit;
}

file_put_contents($file,json_encode(array_values($users),JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if(file_exists($file2)){
    file_put_contents($file2,json_encode(array_values($expenses),JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
if(file_exists($file3)){
    file_put_contents($file3,json_encode(array_values($budgets),JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
if(file_exists($file4)){
    file_put_contents($file4,json_encode(array_values($salary),JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
echo json_encode([
    "status" => "success",
    "message" => "User deleted"
]);
?>