<?php 
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once "../Middleware.php";
authMiddleware();

$file = "salary.json";

if(!file_exists($file)){
    echo json_encode([
        "status" => "error",
        "message" => "salary file not found"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$loaddata = file_get_contents($file);
$all  = json_decode($loaddata, true);

if(!$all){
    $all = [];
}

if($_SERVER["REQUEST_METHOD"] === "POST"){
    if(!$data || !isset($data["salary"])){
        echo json_encode([
            "status" => "error",
            "message" => "Invalid request"
        ]);
        exit;
        }

$user_id = $_SESSION["email"];
$salary = $data["salary"];
$found=false;
$result=[];
$result["email"]=$user_id;
$result["salary"]=$salary;

foreach($all as &$item){
    if(isset($item["email"]) && $item["email"]===$user_id){
        $item["salary"]=$salary;
        $found=true;
        break;
    }
}

if(!$found){
    $all[]=[
        "email"=>$result["email"],
        "salary"=>$result["salary"],
    ];
};

file_put_contents($file, json_encode($all , JSON_PRETTY_PRINT));
echo json_encode([
        "status" => "success",
        "message" => "salary added successfully",
        "salary" => $salary,
        ]);

}
?>