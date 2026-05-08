<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once "Middleware.php";
authMiddleware();

$file = "users.json";
$file2 = "expenses/expense.json";

if(!file_exists($file)){
    echo json_encode([
        "status" => "error",
        "message" => "user file not found"
    ]);
    exit;
}

if(!file_exists($file2)){
    echo json_encode([
        "status" => "error",
        "message" => "Expenses file not found"
    ]);
    exit;
}

$loaddata=file_get_contents($file);
$users =json_decode($loaddata,true);

$loaddata2=file_get_contents($file2);
$Expenses =json_decode($loaddata2,true);


if(!$users){
    $users=[];
}

if(!$Expenses){
    $Expenses=[];
}

$data=json_decode(file_get_contents("php://input"),true);

if(!$data){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}

$currentEmail=$_SESSION["email"];
$found=false;

$filt=array_filter($users,function($user) use($currentEmail,&$found) {
    if($user["email"]===$currentEmail){
        $found=true;
        return false;// remove user<--------
    }else{
        return true;
    }
});

if(!$found){
    echo json_encode([
        "status" => "error",
        "message" => "User not found"
    ]);
    exit;
}

$filt2=array_filter($Expenses,function($ex)use($currentEmail){
    if($ex["email"]===$currentEmail){
        return false;
    }else{
        return true;
    }
});

/*
foreach($expenses as $i => $ex){
    if(isset($ex["email"]) && $ex["email"] === $currentEmail){
        unset($expenses[$i]);
    }
}*/

file_put_contents($file,json_encode(array_values($filt),JSON_PRETTY_PRINT));
file_put_contents($file2,json_encode(array_values($filt2),JSON_PRETTY_PRINT));

session_unset();
session_destroy();

echo json_encode([
    "status" => "success",
    "message" => "User deleted"
]);
?>