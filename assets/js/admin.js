let allUsers = [];
let currentEditId = null;
let currentEditBlockStatus = false;

// =====================
// LOAD USERS
// =====================
function loadUsers(){
  fetch("../api/users.json?nocache=" + new Date().getTime())
  .then(res => res.json())
  .then(users => {
    allUsers = users;
    renderUsers(users);
  })
  .catch(() => {
    // Fallback demo data if JSON doesn't exist
    let demoUsers = [
      { id: 1, name: "Moaz Qassem", email: "moaz@example.com", role: "admin", time: "2026-05-01 10:00" },
      { id: 2, name: "Sarah Connor", email: "sarah@example.com", role: "user", time: "2026-05-02 08:30" },
      { id: 3, name: "John Doe", email: "john@example.com", role: "user", time: "2026-05-02 11:15" }
    ];
    allUsers = demoUsers;
    renderUsers(demoUsers);
  });
}

// =====================
// RENDER TABLE
// =====================
function renderUsers(users){
  
  // Update Stats
  document.getElementById("totalUsersCount").innerText = users.length;

  if (users.length === 0) {
    document.getElementById("usersList").innerHTML = "<p style='color:var(--text-muted); text-align:center; padding: 20px;'>No users found.</p>";
    return;
  }

  let html = `
    <table class="glass-table">
      <thead>
        <tr>
          <th>User Profile</th>
          <th>Access Role</th>
          <th>Joined Time</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  users.forEach(user => {
    let avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&rounded=true`;
    let roleBadge = user.role === 'admin' 
      ? '<span class="badge badge-admin">Admin</span>' 
      : '<span class="badge badge-user">User</span>';

    html += `
      <tr>
        <td>
          <div class="user-info">
            <img src="${avatar}" alt="Avatar">
            <div>
              <div class="user-name">${user.name}</div>
              <div class="user-email">${user.email}</div>
            </div>
          </div>
        </td>
        <td>${roleBadge}</td>
        <td><span style="color:var(--text-muted); font-size:13px;">${user.time ?? "N/A"}</span></td>
        <td>
          <div class="actions">
            ${user.role !== "admin" 
              ? `<button class="action-btn edit" onclick="editUser(${user.id})" title="Edit User"><i class="fa-solid fa-pen"></i></button>
                 <button class="action-btn delete" onclick="deleteUser('${user.email}')" title="Delete User"><i class="fa-solid fa-trash"></i></button>` 
              : `<span class="admin-badge-icon">👑</span>`
            }
          </div>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  document.getElementById("usersList").innerHTML = html;
}

// =====================
// SEARCH
// =====================
function searchUsers(){
  let value = document.getElementById("search").value.toLowerCase();
  let filtered = allUsers.filter(user =>
    user.name.toLowerCase().includes(value) ||
    user.email.toLowerCase().includes(value)
  );
  renderUsers(filtered);
}

// =====================
// DELETE
// =====================
function deleteUser(email){ 
  if(!confirm("Are you sure you want to permanently delete this user?")) return;

  fetch("../api/users/Delete.php", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email })
  })
  .then(res => res.json())
  .then(res => {
    alert(res.message);
    if(res.status === "success"){
      allUsers = allUsers.filter(user => user.email !== email);
      renderUsers(allUsers);
    }
  })
  .catch(() => {
    allUsers = allUsers.filter(user => user.email !== email);
    renderUsers(allUsers);
  });
}

// =====================
// OPEN EDIT
// =====================
function editUser(id){
  let user = allUsers.find(u => u.id === id);
  if(!user) return;

  currentEditId = id;
  currentEditBlockStatus = (user.Block === true || user.Block === "true" || user.block === true || user.block === "true" || user.block == 1 || user.Block == 1) ? true : false;

  document.getElementById("editName").value = user.name;
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editRole").value = user.role;
  updateBlockBtnUI();
  
  document.getElementById("editModal").style.display = "flex";
}

function toggleBlockStatus() {
  currentEditBlockStatus = !currentEditBlockStatus;
  updateBlockBtnUI();
}

function updateBlockBtnUI() {
  let btn = document.getElementById("blockToggleBtn");
  if(currentEditBlockStatus) {
    btn.textContent = "Unblock User";
    btn.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
    btn.style.color = "#22c55e"; // green
  } else {
    btn.textContent = "Block User";
    btn.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
    btn.style.color = "#ef4444"; // red
  }
}

// =====================
// SAVE EDIT
// =====================
function saveEdit(){
  let data = {
    id: currentEditId,
    name: document.getElementById("editName").value,
    role: document.getElementById("editRole").value,
    Block: currentEditBlockStatus
  };

  fetch("../api/users/Edit.php", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(res => {
    alert(res.message);
    if(res.status === "success"){
      closeModal();
      loadUsers();
    }
  })
  .catch(() => {
    // Demo fallback for UI preview
    let user = allUsers.find(u => u.id === currentEditId);
    if(user) {
      user.name = data.name;
      user.email = data.email;
      user.role = data.role;
    }
    closeModal();
    renderUsers(allUsers);
  });
}

// =====================
// CLOSE MODAL
// =====================
function closeModal(){
  document.getElementById("editModal").style.display = "none";
}

// =====================
// THEME
// =====================
function saveTheme(){
  let data = {
    color: document.getElementById("color").value,
    font: document.getElementById("font").value
  };

  fetch("../api/save_settings.php", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(res => {
    alert(res.message);
    applyTheme(data);
  })
  .catch(() => {
    applyTheme(data); // Apply anyway for preview
  });
}

function applyTheme(data){
  if(data.color && data.color !== "#020617") {
    // Only apply if user selects a color (to preserve our default styling fallback)
    document.body.style.backgroundColor = data.color;
  }
  if(data.font) {
    document.body.style.fontFamily = data.font;
  }
}

// load theme
fetch("../api/get_settings.php")
.then(res => res.json())
.then(data => applyTheme(data))
.catch(() => console.log("Settings load bypassed for UI preview."));

// auto load
window.onload = loadUsers;


