<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../api/Middleware.php';
authMiddleware();
$file = __DIR__ . '/expense.json';

if(!file_exists($file)){
    echo json_encode([
        "status" => "error",
        "message" => "Users file not found"
    ]);
    exit;
}

$loaddata=file_get_contents($file);
$expense =json_decode($loaddata,true);

if(!$expense){
    $expense = [];
}

$data=json_decode(file_get_contents("php://input"),true);

if(!$data || !isset($data["id"])){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}

$is_user=$_SESSION["email"];
$id=$data["id"];
$found=false;

$filt=array_filter($expense,function($ex) use ($is_user ,$id,&$found){
    if($ex["id"]==$id && $ex["email"]==$is_user){
        $found=true;
        return false;
    }else{
        return true;
    }
});

if(!$found){
    echo json_encode([
        "status" => "error",
        "message" => "Expense  not found"
    ]);
    exit; 
}

file_put_contents($file,json_encode(array_values($filt),JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    "status" => "success",
    "message" => "Deleted successfully"
]);
?>