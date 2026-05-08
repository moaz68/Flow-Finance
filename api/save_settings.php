<?php 
header('Content-Type: application/json; charset=utf-8');    
session_start();
require_once "Middleware.php";
adminMiddleware();
$file="settings.json";
$data=json_decode(file_get_contents("php://input"),true);
if(!$data){
    echo json_encode([
        "status" => "error",
        "message" => "No data received"
    ]);
    exit;
}
file_put_contents($file,json_encode($data, JSON_PRETTY_PRINT));
    echo json_decode([
        "status" => "success",
        "message" => "Settings saved"
])

?>