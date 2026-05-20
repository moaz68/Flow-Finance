<?php

function sendOTP($userEmail, $otp) {
    $url = "https://script.google.com/macros/s/AKfycbw40XutFqMwixLo6b4MRVB6adE5PR0czZToz13r0QuTy0SMlQhx8zmLwFY_dxjuTLqGTw/exec";
    
    $data = [
        "email" => $userEmail,
        "otp" => $otp
    ];
    
    $payload = json_encode($data);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); 
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    if ($curl_error) {
        error_log("Google Apps Script cURL Error: " . $curl_error);
        return false;
    }

    if ($httpCode !== 200 || trim($response) !== "Success") {
        error_log("Google Apps Script Failed. HTTP: $httpCode, Response: $response");
    }
    
    return (trim($response) === "Success");
}

function sendVerificationEmail($email, $otp) {
    return sendOTP($email, $otp);
}

?>
