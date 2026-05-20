<?php 
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../api/Middleware.php';
authMiddleware();

//******************** 
function password_strength($password){
    $haslower=false;
    $hasupper=false;
    $hasdigit=false;
    $hasSymbol=false;
    for($i=0;$i<strlen($password);$i++){
        if(ctype_lower($password[$i])){
            $haslower=true;
        }else if(ctype_upper($password[$i])){
            $hasupper=true;
        }else if(ctype_digit($password[$i])){
            $hasdigit =true;
        }else{
            $hasSymbol=true;
        }
    }
    if(strlen($password)<6){
        return  "weak";
    }else if($haslower && $hasupper && $hasdigit && $hasSymbol && strlen($password)>=8){
        return  "strong";
    }else if(($haslower || $hasupper ) &&$hasdigit ){
        return  "medium";
    }else{
        return  "very weak";
    }
    
}
///********************

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

if(!$data || !isset($data["password"]) || !isset($data["new_password"]) || !isset($data["Confirm_Password"])){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}

$old_password=$data["password"];
$new_password=$data["new_password"];
$Confirm_Password=$data["Confirm_Password"];
$email=$_SESSION["email"];
$id=$data["id"];
$found=false;

foreach($users as &$user){
    if($user["email"]===$email ){
        if(!password_verify($old_password,$user["password"])){
            echo json_encode([
                "status" => "error",
                "message" => "Wrong old password"
            ]);
            exit;
        }
        if($new_password!==$Confirm_Password){
           echo json_encode([
                "status" => "error",
                "message" => "Passwords do not match"
            ]);
            exit;
        }
        if(strlen($new_password)<8){
            echo json_encode([
                "status"=>"error",
                "message"=>"please use at least 8 characters for your password "
            ]);
            exit;
        }
        $user["password"]=password_hash($new_password,PASSWORD_DEFAULT);
        $user["password_strength"]=password_strength($new_password);
        $found=true;
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
    "message" => "password updated"
]);

?>