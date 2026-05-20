<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../api/Middleware.php';
authMiddleware();
$file = __DIR__ . '/../users.json';

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
    $users=[];
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
$name=trim($data["name"] ?? null);
// $email=trim($data["email"] ?? null);
$found=false;

if(empty($name) || mb_strlen($name, 'UTF-8') < 3){
    echo json_encode([
        "status"=>"error", 
        "message"=>"Name must be at least 3 characters"
    ]);
    exit;
}

if(!preg_match('/^[\p{L}\p{N}\s.@]+$/u',$name)){
            echo json_encode([
                    "status" => "error",
                    "message" => "Sorry, the name can only contain letters, numbers and symbols (. @) "
                    ]);
                exit;
        }



foreach($users as &$user){
    if($user["email"]==$currentEmail){
        $found=true;
        $user["name"]=$name;
        $_SESSION["name"]=$name;
        
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




file_put_contents($file,json_encode($users,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    "status" => "success",
    "message" => "User updated"
]);

?>