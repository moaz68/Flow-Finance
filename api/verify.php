<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
$file = "users.json";

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

file_put_contents($file,json_encode($users,JSON_PRETTY_PRINT));


echo json_encode([
    "status" => "success",
    "message" => "Account verified"
]);
exit;

?>
