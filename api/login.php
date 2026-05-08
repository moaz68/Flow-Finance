<?php
session_start();

if($_SERVER["REQUEST_METHOD"] === "POST"){
    $email = strtolower(trim($_POST["email"]));
    $password=$_POST["password"];
    header('Content-Type: application/json; charset=utf-8');
    $file = "users.json";
    $oldData = file_get_contents($file);
    $users = json_decode($oldData, true);
    if(!$users){
    $users = [];
    }
    foreach($users as $user){
        if($user["email"]===$email){
            if(!password_verify($password, $user["password"])){
                echo json_encode([
                    "status" => "error",
                    "message" => "Invalid  password"
                ]);
                exit;
            }
            if(!$user["verified"]){
                echo json_encode([
                    "status" => "error",
                    "message" => "Please verify your email first"
                ]);
                exit;
            }
            $_SESSION["name"]=$user["name"];
            $_SESSION["email"] = $user["email"];
            $_SESSION["role"]=$user["role"];
            echo json_encode([
                "status"=>"success",
                "message"=>"Login successful",
                "role"=>$user["role"]
            ]);
            exit;
        }
        
    }
    echo json_encode([
        "status"=>"error",
        "message" => "Invalid email or password"
        ]);

}
?>