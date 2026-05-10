<?php
function clean_input($data){
    $data = trim($data);
    $data = preg_replace('/[\x00-\x1F\x7F\x{200E}\x{200F}\x{202A}-\x{202E}]/u', '', $data);
    return $data;
}

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
    if(strlen($password)<8){
        return  "weak";
    }else if($haslower && $hasupper && $hasdigit && $hasSymbol && strlen($password)>=8){
        return  "strong";
    }else if(($haslower || $hasupper ) &&$hasdigit ){
        return  "medium";
    }else{
        return  "very weak";
    }
    
}

function check_email($email){
   return filter_var($email,FILTER_VALIDATE_EMAIL);
        
}


header('Content-Type: application/json; charset=utf-8');
//------
if($_SERVER["REQUEST_METHOD"] === "POST"){

    include __DIR__ . "/delete_not_verified.php";

    $name=trim($_POST["name"]);
    $email = clean_input($_POST["email"]);
    $email = strtolower($email);
    $password=trim($_POST["password"]);
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $currency = $_POST["currency"] ?? "USD";
    $result=[];
    if(empty($name)){
        echo json_encode([
            "status"=>"error",
            "message"=>"Name are required"
        ]);
        exit;
    }
    if(empty($email)){
        echo json_encode([
            "status"=>"error",
            "message"=>"Email are required"
        ]);
        exit;
    }
    if(empty($password)){
        echo json_encode([
            "status"=>"error",
            "message"=>"Password are required"
        ]);
        exit;
    }

    if(strlen($password)<8){
        echo json_encode([
            "status"=>"error",
            "message"=>"please use at least 8 characters for your password "
        ]);
        exit;
    }
    if(strlen($name)<3){
        echo json_encode([
            "status"=>"error",
            "message"=>"please use at least 3 characters for your name"
        ]);
        exit;
    }

    if(!preg_match('/^[\p{L}\p{N}\s.@]+$/u',$name)){
        echo json_encode([
            "status"=>"error",
            "message"=>"Sorry, the name can only contain letters, numbers and symbols (. @) "
        ]);
        exit;

    }
    $result["name"]= $name;
    $result["email_valid"]=check_email($email) ? "valid" : "invalid";
    $result["password"]=password_strength($password);

    $file = __DIR__ . "/users.json";

    if(!file_exists($file)){
        file_put_contents($file, "[]");
    }

    $oldData = file_get_contents($file);
    $users = json_decode($oldData, true);
    foreach($users as &$user){
        if($user["email"]===$email){
            if($user["verified"]===false){
                $otp = rand(100000, 999999);
                $user["verify_code"]=$otp;
                $user["time"]=date("Y-m-d H:i:s");
                require_once __DIR__ . "/send_verify_email.php";
                $sent = sendVerificationEmail($email, $otp);
                if($sent){
                    file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT));
                    echo json_encode([
                        "status" => "success", 
                        "redirect" => "check_email.html"
                ]);
                    exit;
                } else {
                    echo json_encode(["status" => "error", "message" => "Failed to send verification email"]);
                    exit;
                }
            }else{
                echo json_encode([
                "status"=>"error",
                "message"=>"Email already exists"
            ]);
            exit;
            }
        }
        
    }

    $verified = false;
    $otp = rand(100000, 999999);

    $index=count($users);
    $newUser = [
        "id"=>$index++,
        "name" => $result["name"],
        "email" => $email,
        "password_strength" => $result["password"],
        "password"=>$hashed,
        "currency" => $currency,
        "role"=>"user",
        "time"=>date("Y-m-d H:i:s"),
        "verified"=>$verified,
        "verify_code"=>$otp
    ];
    

    $users[] = $newUser;
    require_once __DIR__ . "/send_verify_email.php";
    $sent = sendVerificationEmail($email, $otp);
    if($sent){
        file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT));
        echo json_encode([
            "status" => "success",
            "redirect" => "check_email.html"
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


?>
