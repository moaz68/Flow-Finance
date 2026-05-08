<?php

function sendVerificationEmail($email, $otp) {
    $apiKey = 'YOUR_RESEND_API_KEY'; // ← ضع API Key بتاعك من resend.com هنا

    $data = [
        'from'    => 'Flow Finance <onboarding@resend.dev>', // غيره لـ domain بتاعك لو عندك
        'to'      => [$email],
        'subject' => 'Your Verification Code',
        'html'    => '
            <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:30px;">
                <h2 style="color:#10b981;">🔐 رمز التحقق</h2>
                <p style="font-size:16px;">مرحباً! استخدم الرمز التالي لتفعيل حسابك:</p>
                <div style="background:#f0fdf4;border:2px solid #10b981;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
                    <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#065f46;">' . $otp . '</span>
                </div>
                <p style="color:#6b7280;font-size:13px;">الرمز صالح لمدة 24 ساعة. لا تشارك هذا الرمز مع أحد.</p>
            </div>
        '
    ];

    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log("cURL Error: " . $curlError);
        return false;
    }

    $result = json_decode($response, true);
    // Success if HTTP 200 and has an id
    return ($httpCode === 200 && isset($result['id']));
}
?>