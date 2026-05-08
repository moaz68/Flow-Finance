<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once "../Middleware.php";
adminMiddleware();
$file = "../users.json";

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
        if(isset($data["email"])){
            foreach($users as $user2){
                if($user2["email"]===$data["email"] && $user2["id"] !=$id ){
                    echo json_encode([
                        "status" => "error",
                        "message" => "Email already exists"
                    ]);
                    exit;
                }
            
                }
            $user["email"] = $data["email"];
        }
        if(isset($data["role"])){
            $user["role"]=$data["role"];
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

file_put_contents($file,json_encode($users,JSON_PRETTY_PRINT));

echo json_encode([
    "status" => "success",
    "message" => "User updated"
]);
?>