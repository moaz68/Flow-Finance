<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$file = __DIR__ . '/../../users.json';

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
//**********************
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

//******************* 
$found=false;
$email=$_SESSION["email"] ?? $data["email"];
$input_opt=$data["opt"];
$rerst_password=$data["password"];
$Confirm_Password=$data["Confirm_Password"];
$time=time();

foreach($users as &$user){
    if($user["email"]===$email){
        $found=true;
        if(isset($user["forget_otp"],$user["password_verify_time"]) && $user["forget_otp"]==$input_opt ){
            if(($time-strtotime($user["password_verify_time"])<300)){
                if(trim($rerst_password)!=""){
                    if($rerst_password ===$Confirm_Password){
                        if(strlen($rerst_password)>=8){
                            $user["password"]=password_hash($rerst_password, PASSWORD_DEFAULT);
                            $user["password_strength"]=password_strength($rerst_password);
                            unset($user['forget_otp']);
                            unset($user["password_verify_time"]);
                            file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                            echo json_encode([
                                "status" => "success",
                                "message" => "Password updated successfully"
                            ]);
                            exit;
                        }
                        else{
                            echo json_encode([
                                "status"=>"error",
                                "message"=>"please use at least 8 characters for your password "
                            ]);
                            exit;
                        }
                    }else{
                        echo json_encode([
                            "status" => "error",
                            "message" => "Passwords do not match"
                        ]);
                        exit;
                    }
                }else{
                    echo json_encode([
                        "status" => "error",
                        "message" => "New Password are required "
                    ]);
                    exit;
                }
            }else{
                unset($user["forget_otp"]);
                unset($user["password_verify_time"]);
                file_put_contents($file,json_encode($users,JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                 echo json_encode([
                    "status" => "error",
                    "message" => "OTP Expired "
                ]);
                exit;
            }
        }else{
            echo json_encode([
                "status" => "error",
                "message" => "Invalid OTP "
            ]);
            exit;
    }
            }
        }
    
if(!$found){
    echo json_encode(["status" => "error", 
    "message" => "User not found"
]);
}
?>