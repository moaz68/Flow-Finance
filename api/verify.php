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

$data = json_decode(file_get_contents("php://input"), true);

if(!$data){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}
$code = $data["code"];
$time=time();
$found=false;
if(!isset($code) || trim($code)===""){
    echo json_encode([
            "status" => "error",
            "message" => "Sorry, the code is required."
    ]);
    exit;
}
foreach($users as &$user){
    if( $user["email"] === $data["email"] && isset($user["verify_code"]) && $user["verify_code"] == $code){
        if(($time-strtotime($user["time"]))>120){
            echo json_encode([
                "status" => "error",
                "message" => "Sorry, the code has expired."
    ]);
    exit;
        }
        $found=true;
        $user["verified"]=true;
        $user["verify_code"]=null; 
        $_SESSION["email"] = $user["email"];
        $_SESSION["name"] = $user["name"];
        $_SESSION["role"] = $user["role"];  
        break;
    }
}
if(!$found){
     echo json_encode([
        "status" => "error",
        "message" => "Invalid code"
    ]);
    exit;
}

file_put_contents($file,json_encode($users,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));


echo json_encode([
    "status" => "success",
    "message" => "Account verified"
]);
exit;

?>
