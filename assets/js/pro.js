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
function showLogin() {
  document.getElementById("registrationForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("formTitle").innerText = "تسجيل الدخول";
  document.getElementById("message").innerText = "";

  const joinText = document.getElementById("joinNowText");
  if (joinText) joinText.style.display = "none"; // Hide on login
}

function showRegister() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registrationForm").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("formTitle").innerText = "إنشاء حساب جديد";
  document.getElementById("message").innerText = "";

  const joinText = document.getElementById("joinNowText");
  if (joinText) joinText.style.display = "block";
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
    document.getElementById("welcomeText").innerText = "مرحباً أيها المدير 👑";
  } else {
    document.getElementById("adminPanel").style.display = "none";
    document.getElementById("welcomeText").innerText = "مرحباً بك";
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


