<?php
if (session_status() === PHP_SESSION_ACTIVE) {
    session_write_close();
}

$lifetime = 30 * 24 * 60 * 60;

session_set_cookie_params([
    'lifetime' => $lifetime,
    'path' => '/',
    'domain' => $_SERVER['HTTP_HOST'],
    'secure' => true, 
    'httponly' => true,
    'samesite' => 'Lax'
]);

session_start();

setcookie(session_name(), session_id(), time() + $lifetime, '/', $_SERVER['HTTP_HOST'], true, true);

if($_SERVER["REQUEST_METHOD"] === "POST"){
    $email = strtolower(trim($_POST["email"]));
    $password=$_POST["password"];
    header('Content-Type: application/json; charset=utf-8');
    $file = __DIR__ . '/users.json';
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
            if(isset($user["Block"]) && $user["Block"]===true){
                echo json_encode([
                    "status"=>"error",
                    "message" => "Your Acount IS Blocked"
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