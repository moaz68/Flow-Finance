<?php
$file = __DIR__ . "/users.json";
if (!file_exists($file)) {
    file_put_contents($file, json_encode([]));
}
$loaddata = file_get_contents($file);
$users = json_decode($loaddata, true);

if(!$users){
    $users=[];
}

$time=time();
$filt=array_filter($users,function($user) use($time){
    if($user["verified"]===false){
        if(($time-strtotime($user["time"]))>86400){
            return false;
        }else{
            return true;
        } 
    }else{
        return true;
    }
});

file_put_contents($file,json_encode(array_values($filt),JSON_PRETTY_PRINT));

?>