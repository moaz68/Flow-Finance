<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../api/Middleware.php';
authMiddleware();

$file = __DIR__ . '/../../api/expenses/budgets.json';

if(!file_exists($file)){
    echo json_encode([
        "status" => "error",
        "message" => "budgets file not found"
    ]);
    exit;
}

$loaddata=file_get_contents($file);
$budgets =json_decode($loaddata,true);

if(!$budgets){
    $budgets=[];
}

$data=json_decode(file_get_contents("php://input"),true);

if(!$data){
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request"
    ]);
    exit;
}

$currentEmail=$_SESSION["email"];
$Food=(int)$data["Food"];
$Bills=(int)$data["Bills"];
$Transport=(int)$data["Transport"];
$Shopping=(int)$data["Shopping"];
$Entertainment=(int)$data["Entertainment"];
$Health=(int)$data["Health"];
$Other=(int)$data["Other"];

if(empty($Food) || empty($Bills) || empty($Transport) || empty($Shopping) || empty($Entertainment) || empty($Health) || empty($Other)){
    echo json_encode([
            "status"=>"error",
            "message"=>"All fields are required"
        ]);
        exit;
}

$result["Food"]=$Food;
$result["Bills"]=$Bills;
$result["Transport"]=$Transport;
$result["Shopping"]=$Shopping;
$result["Entertainment"]=$Entertainment;
$result["Health"]=$Health;
$result["Other"]=$Other;

$found=false;

foreach($budgets as &$b){
    if($b["email"]===$currentEmail){
        $found=true;
        $b["Food"]=$Food;
        $b["Bills"]=$Bills;
        $b["Transport"]=$Transport;
        $b["Shopping"]=$Shopping;
        $b["Entertainment"]=$Entertainment;
        $b["Health"]=$Health;
        $b["Other"]=$Other;
        break;
    }
}

if(!$found){
    $budgets[]=[
        "email" => $currentEmail,
        "Food"=>$result["Food"],
        "Bills"=>$result["Bills"],
        "Transport"=>$result["Transport"],
        "Shopping"=>$result["Shopping"],
        "Entertainment"=>$result["Entertainment"],
        "Health"=>$result["Health"],
        "Other"=>$result["Other"],
    ];

}

file_put_contents($file, json_encode($budgets , JSON_PRETTY_PRINT));
echo json_encode([
        "status" => "success",
        "message" => "budgets added successfully",
        "data" => $budgets,
        ]);

?>
