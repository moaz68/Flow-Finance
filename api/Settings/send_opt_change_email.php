<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../send_verify_email.php';

$file = __DIR__ . '/../users.json';

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
$email= $data["email"];
$currentemail=$_SESSION["email"];

if($email===$currentemail){
    echo json_encode([
            "status" => "error",
            "message" => "This is already your current email address"
        ]);
        exit;
}

foreach($users as $u){
    if($u["email"]===$email){
        echo json_encode([
        "status" => "error",
        "message" => "Email already exists"
    ]);
    exit;
    }
}

foreach($users as &$user){
if( !empty($email)&& $user["email"]===$currentemail){
        $otp = rand(100000, 999999);
        $user["pending_email"]=$email;
        $user["email_verify_code"]=$otp;
        $user["email_verify_time"] = date('Y-m-d H:i:s');
        $sent = sendVerificationEmail($email, $otp);
        if($sent){
            file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $found=true;              
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
    }
}
if(!$found) {
echo json_encode([
    "status" => "error", 
    "message" => "User session not found"
]);
}

?>