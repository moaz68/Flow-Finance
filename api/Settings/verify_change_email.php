<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../api/Middleware.php';
authMiddleware();
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


$currentEmail=$_SESSION["email"];

$Cancel=$data["Cancel"]?? null;
if(isset($Cancel) && $Cancel===True){
    foreach($users as &$u){
        if($u["email"]===$currentEmail){
            unset($u["pending_email"]);
            unset($u["email_verify_time"]);
            unset($u["email_verify_code"]);
            file_put_contents($file,json_encode($users,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            echo json_encode([
                    "status" => "success",
                    "message" => "Canceled "
                ]);
                exit;

        }
    }
}
$found=false;
$email=$data["email"] ?? "";
$input_opt=$data["opt"] ?? "";
$time=time();


foreach($users as &$user){
    if($user["email"]===$currentEmail){
        $found=true;
        if($user["email_verify_code"]==$input_opt){
            if(($time-strtotime($user["email_verify_time"]))<300){
                $user["email"]=$user["pending_email"];
                $_SESSION["email"]=$user["email"];
                unset($user["pending_email"]);
                unset($user["email_verify_time"]);
                unset($user["email_verify_code"]);

                foreach($expenses  as &$ex){
                    if($ex["email"]===$currentEmail){
                        $ex["email"]=$user["email"];
                    }
                }
                foreach($budgets as &$b){
                    if($b["email"]===$currentEmail){
                        $b["email"]=$user["email"];
                    }
                }
                foreach($salary as &$s){
                    if($s["email"]===$currentEmail){
                        $s["email"]=$user["email"];
                    }
                }
                file_put_contents($file,json_encode($users,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                file_put_contents($file2,json_encode($expenses,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                file_put_contents($file3,json_encode($budgets,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                file_put_contents($file4,json_encode($salary,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                
                echo json_encode([
                    "status" => "success",
                    "message" => " Email User updated"
                ]);
                exit;
                
            }else{
                unset($user["pending_email"]);
                unset($user["email_verify_time"]);
                unset($user["email_verify_code"]);
                file_put_contents($file,json_encode($users,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                 echo json_encode([
                    "status" => "error",
                    "message" => "OTP Expired "
                ]);
                exit;
                    
            }

        }
        else{
            echo json_encode([
            "status" => "error",
            "message" => "Invalid OTP "
        ]);
        exit;
                    
            }
    }
}

if(!$found){
    echo json_encode([
    "status" => "error", 
    "message" => "User not found"
]);
exit;
}

?>