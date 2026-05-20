<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../send_verify_email.php';

$file = __DIR__ . '/../../users.json';

if(!file_exists($file)){
    echo json_encode([
        "status" => "error",
        "message" => "Users file not found"
    ]);
    exit;
}
$loaddata=file_get_contents($file);
$users=json_decode($loaddata,true);

if(!$users){
    $users=[];
}

$data = json_decode(file_get_contents("php://input"), true);

if(!$data){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}

$found=false;
$email=$_SESSION["email"] ?? $data["email"];

foreach($users as &$user){
    if($user["email"]===$email){
        $found=true;
        $otp = rand(100000, 999999);
        $user["forget_otp"]=$otp;
        $user["password_verify_time"] = date('Y-m-d H:i:s');
        $sent = sendVerificationEmail($email, $otp);
    if($sent){
        file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode([
            "status" => "success",
            "message" => "OTP Sent"
        ]);
        exit;
    }else{
        echo json_encode([ 
            "status" => "error",
             "message" => "Failed to send email" 
        ]); 
        exit;
    }
    break;
    }
    
}

if(!$found){
    echo json_encode([
    "status" => "error", 
    "message" => "Email not found"
    ]);
    exit;
}

?>