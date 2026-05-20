<?php
session_start();
require_once "Middleware.php";
$file = __DIR__ . '/settings.json';
if(!file_exists($file)){
    echo json_encode([
        "color" => "#667eea",
        "font" => "Arial"
    ]);
    exit;
}
echo file_get_contents($file);

?>