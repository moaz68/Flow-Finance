<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../api/Middleware.php';
authMiddleware();
$file = __DIR__ . '/../../users.json';

if(!file_exists($file)){
    echo json_encode([
        "status" => "error",
        "message" => "user file not found"
    ]);
    exit;
}

$loaddata=file_get_contents($file);
$users =json_decode($loaddata,true);

if(!$users){
    $users=[];
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

foreach($users as &$user){
    if($user["email"]===$currentEmail){
        $found=true;
        $user["preferences"]=[
            "dark_mode"=>$data["dark_mode"]??false,
            "notifications"=>$data["notifications"]??false,
            "language"=>$data["language"]??"en"
        ];
        $_SESSION["preferences"]=$user["preferences"];
        break;
    }
}
if(!$found){
    echo json_encode([
        "status" => "error",
        "message" => "User not found"
    ]);
    exit;
}

file_put_contents($file,json_encode($users,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    "status" => "success",
    "message" => "Preferences saved"
]);
?>
