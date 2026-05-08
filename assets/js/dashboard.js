function logout(){
  fetch("../api/Logout.php", {
    method: "POST"
  })
  .then(res => res.json())
  .then(data => {
    window.location.href = "pro.html";
  });
}

