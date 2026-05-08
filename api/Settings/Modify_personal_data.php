<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../api/Middleware.php';
authMiddleware();
$file = __DIR__ . '/../../api/users.json';
$file2=__DIR__ . '/../../api/expenses/expense.json';
$file3=__DIR__ . '/../../api/expenses/budgets.json';
$file4=__DIR__ . '/../../api/salary/salary.json';
if(!file_exists($file)){
    echo json_encode([
        "status" => "error",
        "message" => "Users file not found"
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
$expenses =json_decode($loaddata2,true);

$loaddata3=file_get_contents($file3);
$budgets =json_decode($loaddata3,true);

$loaddata4=file_get_contents($file4);
$salary =json_decode($loaddata4,true);


if(!$users){
    $users=[];
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

if(!$data ){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}

$currentEmail = $_SESSION["email"];
$name=$data["name"] ?? null;
$email=$data["email"] ?? null;
$found=false;

foreach($users as &$user){
    if($user["email"]==$_SESSION["email"]){
        $found=true;
        if(!empty($email)){
        foreach($users as $user2){
            if($user2["email"]===$email &&  $email !== $currentEmail){
                echo json_encode([
                        "status" => "error",
                        "message" => "Email already exists"
                    ]);
                    exit;
            }
        }
        $user["email"]=$email;
        $_SESSION["email"]=$email;
        }
        if(!empty($name)){
            $user["name"]=$name;
            $_SESSION["name"]=$name;
        }
        break;
    }

}
if(!$found){
    echo json_encode([
        "status" => "error",
        "message" => "not found"
    ]);
    exit;
}

if(!empty($email)){
    foreach($expenses  as &$ex){
        if($ex["email"]===$currentEmail){
            $ex["email"]=$email;
        }
    }
    foreach($budgets as &$b){
        if($b["email"]===$currentEmail){
            $b["email"]=$email;
        }
    }
    foreach($salary as &$s){
        if($s["email"]===$currentEmail){
            $s["email"]=$email;
        }
    }
}


file_put_contents($file,json_encode($users,JSON_PRETTY_PRINT));
file_put_contents($file2,json_encode($expenses,JSON_PRETTY_PRINT));
file_put_contents($file3,json_encode($budgets,JSON_PRETTY_PRINT));
file_put_contents($file4,json_encode($salary,JSON_PRETTY_PRINT));

echo json_encode([
    "status" => "success",
    "message" => "User updated"
]);

?>