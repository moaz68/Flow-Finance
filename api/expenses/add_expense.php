    <?php 
    session_start();
    header('Content-Type: application/json; charset=utf-8');
    require_once __DIR__ . '/../../api/Middleware.php';
    authMiddleware();
    $file = __DIR__ . '/expense.json';

    if(!file_exists($file)){
        echo json_encode([
            "status" => "error",
            "message" => "Expenses file not found"
        ]);
        exit;
    }

    $loaddata=file_get_contents($file);
    $expenses =json_decode($loaddata,true);

    if(!$expenses ){
        $expenses =[];
    }

    $data=json_decode(file_get_contents("php://input"),true);
    //*** 
    if($_SERVER["REQUEST_METHOD"] === "POST"){
        if(!$data || !isset($data["title"], $data["amount"],$data["category"])){
            echo json_encode([
                "status" => "error",
                "message" => "Invalid request"
            ]);
            exit;
        }
        $Category=$data["category"];
        $Expense_name=trim(strtolower($data["title"]));
        $amount =$data["amount"];
        $user_id = $_SESSION["email"];

        $result=[];
        if(empty($Expense_name) || $amount === "" || $amount === null || $amount <= 0 || !is_numeric($amount)){
            echo json_encode([
                "status"=>"error",
                "message"=>"All fields are required"
            ]);
            exit;
    }
    $result["name"]=$Expense_name;
    $result["amount"]=$amount;
    $result["category"]=$Category;

    $index=0;
    foreach($expenses as $exp){
        if(isset($exp["id"])&& $exp["id"]>$index){
            $index=$exp["id"];
        }
    }
    $newUser=[
        "id"=>$index + 1,
        "category"=>$result["category"],
        "date"=>date("Y-m-d"),
        "title"=>$result["name"],
        "amount"=>$result["amount"],
        "email"=>$user_id
    ];
    $expenses []=$newUser;
    file_put_contents($file, json_encode($expenses , JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode([
            "status" => "success",
            "message" => "Expense added successfully",
            "data" => $expenses,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
    ?>