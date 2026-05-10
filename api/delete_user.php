<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once "Middleware.php";
authMiddleware();

$file = "users.json";
$file2 = "expenses/expense.json";
$file3="expenses/budgets.json";
$file4="salary/salary.json";

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

if(!file_exists($file3)){
    echo json_encode([
        "status" => "error",
        "message" => "budgets file not found"
    ]);
    exit;
}

if(!file_exists($file4)){
    echo json_encode([
        "status" => "error",
        "message" => "salary file not found"
    ]);
    exit;
}

$loaddata=file_get_contents($file);
$users =json_decode($loaddata,true);

$loaddata2=file_get_contents($file2);
$Expenses =json_decode($loaddata2,true);

$loaddata3=file_get_contents($file3);
$budgets =json_decode($loaddata3,true);

$loaddata4=file_get_contents($file4);
$salary =json_decode($loaddata4,true);

if(!$users){
    $users=[];
}

if(!$Expenses){
    $Expenses=[];
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

$filt3=array_filter($budgets,function($b)use($currentEmail){
    if($b["email"]===$currentEmail){
        return false;
    }else{
        return true;
    }
});

$filt4=array_filter($salary,function($s)use($currentEmail){
    if($s["email"]===$currentEmail){
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
file_put_contents($file3,json_encode(array_values($filt3),JSON_PRETTY_PRINT));
file_put_contents($file4,json_encode(array_values($filt4),JSON_PRETTY_PRINT));

session_unset();
session_destroy();

echo json_encode([
    "status" => "success",
    "message" => "User deleted"
]);
?>
