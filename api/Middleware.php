<?php 
function authMiddleware(){
    if(!isset($_SESSION["email"])){
        $is_localhost = strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false;
        $path = $is_localhost ? '/moaz/progect/public/pro.html' : '/public/pro.html';
        header("Location: $path");
        exit();
    }
    $file = __DIR__ . '/users.json';
    if (file_exists($file)) {
        $users = json_decode(file_get_contents($file), true);
        $currentEmail = $_SESSION['email'];
        $changed = false;

        foreach ($users as &$user) {
            if ($user['email'] === $currentEmail) {
                if (isset($user['email_verify_time'])) {
                    if ((time() - strtotime($user['email_verify_time'])) > 600) {
                        unset($user['pending_email'], $user['email_verify_code'], $user['email_verify_time']);
                        $changed = true;
                    }
                }
                if (isset($user['password_verify_time'])) {
                    if ((time() - strtotime($user['password_verify_time'])) > 600) {
                        unset($user['forget_otp'], $user['password_verify_time']);
                        $changed = true;
                    }
                }
                break; 
            }
        }

        if ($changed) {
            file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
    }
}
function adminMiddleware(){
    authMiddleware();

    if(!isset($_SESSION["role"]) || $_SESSION["role"] !== "admin"){
        $is_localhost = strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false;
        $path = $is_localhost ? '/moaz/progect/public/pro.html' : '/public/pro.html';
        header("Location: $path");
        exit();
    }
}
?>
