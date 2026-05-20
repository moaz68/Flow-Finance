<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once "../Middleware.php";
adminMiddleware();
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

$data=json_decode(file_get_contents("php://input"),true);

if(!$data || !isset($data["id"])){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}

$id=$data["id"];
$found=false;

foreach($users as &$user){
    if($user["id"]==$id){
        $found=true;
        if($user["role"]==="admin"){
            echo json_encode([
                "status" => "error",
                "message" => "Cannot edit admin"
            ]);
            exit;
        }
        if(isset($data["name"])){
        $user["name"]=$data["name"];
        }
        if(isset($data["role"])){
            $user["role"]=$data["role"];
        }
        if(isset($data["Block"])){
            $user["Block"]=$data["Block"];
        }
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
    "message" => "User updated"
]);
?>