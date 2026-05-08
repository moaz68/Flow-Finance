<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../vendor/autoload.php';

function sendVerificationEmail($email, $otp){

    $mail = new PHPMailer(true);

    try {

        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'mohamedmoaz832@gmail.com';
        $mail->Password = 'jpwj dkmn vxtg odiz';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->setFrom('mohamedmoaz832@gmail.com', 'Expense App');
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->Subject = "Your verification code";

        $mail->Body = "
            <h2>Your OTP Code 🔐</h2>
            <p style='font-size:20px'><b>$otp</b></p>
            <p>Enter this code to verify your account.</p>
        ";

        $mail->send();
        return true;

    } catch (Exception $e) {
        error_log("Mail error: ".$mail->ErrorInfo);
        return false;
    }
}
?>