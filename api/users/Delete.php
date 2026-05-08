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
$users =json_decode($loaddata,true);

if(!$users){
    $users = [];
}

$data=json_decode(file_get_contents("php://input"),true);

if(!$data || !isset($data["id"])){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}


$idToDelete=$data["id"];
$found=false;
$filt=array_filter($users,function($user) use($idToDelete,&$found){
        if($user["id"]==$idToDelete ){
        $found=true;
        if($user["role"]==="admin"){
            echo json_encode([
                "status" => "error",
                "message" => "Cannot edit admin"
            ]);
            exit;
        }
        return false;
    }else{
        return true;
    }
} );
if(!$found){
    echo json_encode([
        "status" => "error",
        "message" => "User not found"
    ]);
    exit;
}

file_put_contents($file,json_encode(array_values($filt),JSON_PRETTY_PRINT));
echo json_encode([
    "status" => "success",
    "message" => "User deleted"
]);
?>