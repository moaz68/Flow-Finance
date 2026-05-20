<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
$file = __DIR__ . '/users.json';

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

$email=$_SESSION["email"] ?? "";
$found=false;
$time=time();
$otp = rand(100000, 999999);

if(empty($email)){
    echo json_encode([
        "status" => "error",
        "message" => "Session expired. Please register again."
    ]);
    exit;
}

foreach($users as &$user){
    if(isset($user["email"]) && $user["email"]===$email && $user["verified"]===false){
        $user["time"] = date('Y-m-d H:i:s');
        $found=true;
        $user["verify_code"]=$otp;
        require_once __DIR__ . "/send_verify_email.php";
        $sent = sendVerificationEmail($email, $otp);
        if($sent){
        file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            echo json_encode([
                "status" => "success",
                "message" => "Sended Otp"
            ]);
            exit;
        }else{
            echo json_encode([
                "status" => "error",
                "message" => "Failed to send verification email" 
            ]);
            exit;
        }
    }
}

if(!$found)echo json_encode(["status" => "error","message" => "Not Found " ]);
?>