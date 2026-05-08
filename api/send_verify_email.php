<?php

function sendVerificationEmail($email, $otp) {
    // تم وضع الـ API Key الخاص بك هنا
    $apiKey = 're_4K71vrY7_ELUWqZLetBTyfjmevwRukdnj'; 

    $data = [
        'from'    => 'Flow Finance <onboarding@resend.dev>',
        'to'      => [$email],
        'subject' => 'رمز التحقق الخاص بك',
        'html'    => '
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; direction: rtl; text-align: right;">
                <h2 style="color: #10b981;">🔐 رمز التحقق الخاص بك</h2>
                <p style="font-size: 16px;">مرحباً، استخدم الرمز التالي لتفعيل حسابك في Flow Finance:</p>
                <div style="background: #f0fdf4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #065f46; letter-spacing: 5px;">' . $otp . '</span>
                </div>
                <p style="color: #6b7280; font-size: 14px;">هذا الرمز صالح لمدة 24 ساعة. لا تشارك هذا الرمز مع أي شخص.</p>
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
    curl_close($ch);

    return ($httpCode === 200);
}
