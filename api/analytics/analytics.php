<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../api/Middleware.php';
authMiddleware();
$file=__DIR__ . '/../../api/expenses/expense.json';


if(!file_exists($file)){
     echo json_encode([
        "status" => "error",
        "message" => "Expenses file not found"
    ]);
    exit;
}
$loaddata = file_get_contents($file);
$expenses = json_decode($loaddata, true);

if(!$expenses){
    $expenses = [];
}

$currentEmail=$_SESSION["email"];
$currentMonth = date("Y-m");
$lastMonth =date("Y-m",strtotime("-1 month"));

$filt=array_filter($expenses,function($ex) use($currentEmail){
    return isset($ex["email"]) && $ex["email"]===$currentEmail;
});

foreach($filt as $file){
    $date =$file["date"];
    $category=$file["category"];
    $amount=$file["amount"];
}

$thisMonthTotal = 0;
$lastMonthTotal = 0;
$categoryTotals =[];

if(str_starts_with($date,$currentMonth)){
    $thisMonthTotal+=$amount;
    if(!isset($categoryTotals[$category])){
        $categoryTotals[$category]=0;
    }
    $categoryTotals[$category]+=$amount;

}

if(str_starts_with($date,$lastMonth)){
    $lastMonthTotal+=$amount;
}

$difference =$thisMonthTotal-$lastMonthTotal;
$saved =$difference > 0 ?$difference : 0;
$spentMore =$difference < 0 ? $difference :0;

$topCategory ="-";
$topCategoryAmount =0;

foreach($categoryTotals as $cat => $total){
    if($total > $topCategoryAmount){
        $topCategoryAmount=$total;
        $topCategory=$cat;
    }
}
$percentage = 0;

if($lastMonthTotal > 0){

    $percentage = round(
        (($thisMonthTotal - $lastMonthTotal) / $lastMonthTotal) * 100
    );
}

echo json_encode([

    "status" => "success",

    "analytics" => [

        "current_month" => $currentMonth,

        "this_month_total" => $thisMonthTotal,

        "last_month_total" => $lastMonthTotal,

        "saved_amount" => $saved,

        "spent_more" => $spentMore,

        "percentage_change" => $percentage,

        "top_category" => $topCategory,

        "top_category_amount" => $topCategoryAmount,

        "category_totals" => $categoryTotals
    ]
]);


?>