// =====================
// PAGE LOAD (SETTINGS)
// =====================
document.addEventListener("DOMContentLoaded", function () {
  fetch("../api/get_settings.php")
    .then(res => res.json())
    .then(data => {
      // Keep professional green/white theme.
    })
    .catch(() => {
      console.log("⚠️ settings load failed");
    });
});

// =====================
// SWITCH FORMS
// =====================
function hideAllForms() {
  const forms = ["registrationForm", "loginForm", "forgotPasswordStep1Form", "forgotPasswordStep2Form", "dashboard"];
  forms.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  const msgEl = document.getElementById("message");
  if (msgEl) msgEl.innerText = "";

  const err1 = document.getElementById("forgotErrorMessage1");
  if (err1) err1.style.display = "none";
  const err2 = document.getElementById("forgotErrorMessage2");
  if (err2) err2.style.display = "none";
}

function showLogin() {
  hideAllForms();
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("formTitle").innerText = t("title_login");
  document.getElementById("formTitle").setAttribute("data-i18n", "title_login");

  const joinText = document.getElementById("joinNowText");
  if (joinText) joinText.style.display = "none"; // Hide on login
}

function showRegister() {
  hideAllForms();
  document.getElementById("registrationForm").style.display = "block";
  document.getElementById("formTitle").innerText = t("title_register");
  document.getElementById("formTitle").setAttribute("data-i18n", "title_register");

  const joinText = document.getElementById("joinNowText");
  if (joinText) joinText.style.display = "block";
}

function showForgotPasswordStep1() {
  hideAllForms();
  // Clear the input so it's empty for security
  const emailInput = document.getElementById("forgotEmail");
  if (emailInput) emailInput.value = "";

  document.getElementById("forgotPasswordStep1Form").style.display = "block";
  document.getElementById("formTitle").innerText = t("title_forgot_password_step1");
  document.getElementById("formTitle").setAttribute("data-i18n", "title_forgot_password_step1");

  const joinText = document.getElementById("joinNowText");
  if (joinText) joinText.style.display = "none";
}

function showForgotPasswordStep2() {
  hideAllForms();
  // Clear the inputs so old OTP/Password aren't there for security
  const otpInput = document.getElementById("forgotOtp");
  if (otpInput) otpInput.value = "";
  const newPassInput = document.getElementById("forgotNewPassword");
  if (newPassInput) newPassInput.value = "";
  const confirmPassInput = document.getElementById("forgotConfirmPassword");
  if (confirmPassInput) confirmPassInput.value = "";

  document.getElementById("forgotPasswordStep2Form").style.display = "block";
  document.getElementById("formTitle").innerText = t("title_forgot_password_step2");
  document.getElementById("formTitle").setAttribute("data-i18n", "title_forgot_password_step2");

  const joinText = document.getElementById("joinNowText");
  if (joinText) joinText.style.display = "none";
}

// =====================
// DASHBOARD VIEW
// =====================
function showDashboard(role) {
  document.getElementById("registrationForm").style.display = "none";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("formTitle").innerText = "لوحة التحكم";

  const joinText = document.getElementById("joinNowText");
  if (joinText) joinText.style.display = "none";

  if (role === "admin") {
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("welcomeText").innerText = t("welcome_admin");
    document.getElementById("welcomeText").setAttribute("data-i18n", "welcome_admin");
  } else {
    document.getElementById("adminPanel").style.display = "none";
    document.getElementById("welcomeText").innerText = t("welcome_user");
    document.getElementById("welcomeText").setAttribute("data-i18n", "welcome_user");
  }
}

// =====================
// LOGIN LOGIC
// =====================
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let formData = new FormData(this);
  const msgEl = document.getElementById("message");

  fetch("../api/login.php", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      msgEl.innerText = data.message;
      msgEl.className = data.status === "success" ? "success" : "error";

      if (data.status === "success") {
        if (data.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "budget.html";
        }
      }
    })
    .catch(() => {
      msgEl.innerText = "⚠️ خطأ في الخادم";
      msgEl.className = "error";
    });
});

// =====================
// LOGOUT
// =====================
function logout() {
  const msgEl = document.getElementById("message");
  fetch("../api/Logout.php")
    .then(res => res.json())
    .then(data => {
      msgEl.innerText = data.message;
      msgEl.className = "success";
      setTimeout(() => {
        showLogin();
      }, 1000);
    })
    .catch(() => {
      msgEl.innerText = "⚠️ فشل تسجيل الخروج";
      msgEl.className = "error";
    });
}

// =====================
// ADMIN FUNCTIONS (DEMO)
// =====================
function viewUsers() {
  alert("🔥 هنا تربطها بـ backend وتجيب users");
}

function deleteUser() {
  alert("⚠️ هنا تبعت request تمسح user");
}

// =====================
// REGISTRATION LOGIC
// =====================
const registrationForm = document.getElementById("registrationForm");
if (registrationForm) {
  registrationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let formData = new FormData(this);
    const errorMsgBox = document.getElementById("errorMessage");
    errorMsgBox.style.display = "none";

    const userEmail = formData.get("email");

    fetch("../api/register.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "error") {
          errorMsgBox.innerText = data.message;
          errorMsgBox.style.display = "block";
        } else if (data.status === "success") {
          localStorage.setItem("userEmail", userEmail);
          window.location.href = "check_email.html";
        }
      })
      .catch(error => {
        errorMsgBox.innerText = "⚠️ حدث خطأ أثناء الاتصال بالخادم.";
        errorMsgBox.style.display = "block";
        console.error("Registration error:", error);
      });
  });
}


// =====================
// FORGOT PASSWORD LOGIC
// =====================
const forgotStep1Form = document.getElementById("forgotPasswordStep1Form");
if (forgotStep1Form) {
  forgotStep1Form.addEventListener("submit", function (e) {
    e.preventDefault();
    const btn = document.getElementById("forgotBtn1");
    const errorMsgBox = document.getElementById("forgotErrorMessage1");
    const emailInput = document.getElementById("forgotEmail").value;

    errorMsgBox.style.display = "none";
    btn.disabled = true;
    const sendingText = (typeof t !== "undefined") ? t("btn_sending_otp") : "جاري الإرسال...";
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${sendingText}`;

    fetch("../api/Settings/user/request_otp.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "error") {
          errorMsgBox.innerText = data.message || "حدث خطأ غير معروف";
          errorMsgBox.style.display = "block";
        } else if (data.status === "success") {
          showForgotPasswordStep2();
        }
      })
      .catch(error => {
        errorMsgBox.innerText = "⚠️ حدث خطأ أثناء الاتصال بالخادم.";
        errorMsgBox.style.display = "block";
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerText = (typeof t !== "undefined") ? t("btn_send_otp") : "إرسال الرمز";
      });
  });
}

const forgotStep2Form = document.getElementById("forgotPasswordStep2Form");
if (forgotStep2Form) {
  forgotStep2Form.addEventListener("submit", function (e) {
    e.preventDefault();
    const btn = document.getElementById("forgotBtn2");
    const errorMsgBox = document.getElementById("forgotErrorMessage2");

    const emailInput = document.getElementById("forgotEmail").value;
    const otpInput = document.getElementById("forgotOtp").value;
    const newPasswordInput = document.getElementById("forgotNewPassword").value;
    const confirmPasswordInput = document.getElementById("forgotConfirmPassword").value;

    errorMsgBox.style.display = "none";
    btn.disabled = true;
    const resettingText = (typeof t !== "undefined") ? t("btn_resetting_pass") : "جاري إعادة التعيين...";
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${resettingText}`;

    fetch("../api/Settings/user/reset_password.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput,
        opt: otpInput,
        password: newPasswordInput,
        Confirm_Password: confirmPasswordInput
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "error") {
          errorMsgBox.innerText = data.message || "حدث خطأ غير معروف";
          errorMsgBox.style.color = "#ef4444";
          errorMsgBox.style.display = "block";
          btn.disabled = false;
          btn.innerText = (typeof t !== "undefined") ? t("btn_confirm_change") : "إعادة تعيين كلمة المرور";
        } else if (data.status === "success") {
          // Show exact success message from API response
          errorMsgBox.innerText = data.message;
          errorMsgBox.style.color = "#10b981"; // Green color
          errorMsgBox.style.display = "block";

          // Wait 2 seconds before switching to login
          setTimeout(() => {
            showLogin();
            errorMsgBox.style.color = "#ef4444"; // Reset to red for future
            btn.disabled = false;
            btn.innerText = (typeof t !== "undefined") ? t("btn_confirm_change") : "إعادة تعيين كلمة المرور";
          }, 2000);
        }
      })
      .catch(error => {
        errorMsgBox.innerText = "⚠️ حدث خطأ أثناء الاتصال بالخادم.";
        errorMsgBox.style.color = "#ef4444";
        errorMsgBox.style.display = "block";
        btn.disabled = false;
        btn.innerText = (typeof t !== "undefined") ? t("btn_confirm_change") : "إعادة تعيين كلمة المرور";
      });
  });
}
