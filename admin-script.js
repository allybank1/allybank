// admin-script.js – EXPERT BANK SYSTEM
const DEFAULT_ADMIN = { username: "admin", password: "admin123" };

document.addEventListener("DOMContentLoaded", () => {
  initAdmin();
  setupEventListeners();
});

function initAdmin() {
  if (!localStorage.getItem("admin")) {
    localStorage.setItem("admin", JSON.stringify(DEFAULT_ADMIN));
  }
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
  }
}

function setupEventListeners() {
  const loginForm = document.getElementById("adminLoginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const tab = document.getElementById(btn.dataset.tab);
      if (tab) tab.classList.add("active");
      if (btn.dataset.tab === "stats") loadStats();
    });
  });

  const createForm = document.getElementById("createUserForm");
  if (createForm) createForm.addEventListener("submit", createUser);

  const closeBtn = document.querySelector(".close");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", e => {
    const modal = document.getElementById("userModal");
    if (e.target === modal) closeModal();
  });

  // === EDIT USER SAVE BUTTON ===
  const saveUserBtn = document.getElementById("saveUserBtn");
  if (saveUserBtn) {
    saveUserBtn.addEventListener("click", () => {
      const name = document.getElementById("editName").value.trim();
      const username = document.getElementById("editUsername").value.trim();
      const email = document.getElementById("editEmail").value.trim().toLowerCase();
      const phone = document.getElementById("editPhone").value.trim();
      const address = document.getElementById("editAddress").value.trim();
      const dob = document.getElementById("editDOB").value;
      const password = document.getElementById("editPassword").value;

      if (!name || !username || !email) {
        alert("Name, Username, and Email are required");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find(u => u.id === document.getElementById("userModal").dataset.userId);

      if (users.some(u => u.id !== user.id && (u.email === email || u.username === username))) {
        alert("Email or Username already taken");
        return;
      }

      user.name = name;
      user.username = username;
      user.email = email;
      user.phone = phone;
      user.address = address;
      user.dob = dob;
      if (password) user.password = password;

      localStorage.setItem("users", JSON.stringify(users));

      // === REFRESH MODAL VIEW ===
      document.getElementById("modalName").textContent = name;
      document.getElementById("modalUsername").textContent = username; // FIXED: Update username
      document.getElementById("modalEmail").textContent = email;
      document.getElementById("modalPhone").textContent = phone || "—";
      document.getElementById("modalAddress").textContent = address || "Not set";
      document.getElementById("modalDOB").textContent = dob ? new Date(dob).toLocaleDateString() : "Not set";

      document.getElementById("editMode").style.display = "none";
      document.getElementById("viewMode").style.display = "block";

      loadUsers();
      loadStats();
      alert("User updated successfully");
    });
  }

  // === CANCEL EDIT BUTTON ===
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
      document.getElementById("editMode").style.display = "none";
      document.getElementById("viewMode").style.display = "block";
    });
  }

  //Image
  // === EDIT USER BUTTON (TOGGLE EDIT MODE) ===
  const editUserBtn = document.getElementById("editUserBtn");
  if (editUserBtn) {
    editUserBtn.addEventListener("click", () => {
      const modal = document.getElementById("userModal");
      const userId = modal.dataset.userId;
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find(u => u.id === userId);

      // Populate edit fields
      document.getElementById("editName").value = user.name;
      document.getElementById("editUsername").value = user.username;
      document.getElementById("editEmail").value = user.email;
      document.getElementById("editPhone").value = user.phone || "";
      document.getElementById("editAddress").value = user.address || "";
      document.getElementById("editDOB").value = user.dob || "";

      document.getElementById("viewMode").style.display = "none";
      document.getElementById("editMode").style.display = "block";
    });
  }
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value;
  const admin = JSON.parse(localStorage.getItem("admin"));

  if (username === admin.username && password === admin.password) {
    document.getElementById("loginScreen").classList.remove("active");
    document.getElementById("dashboard").classList.add("active");
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    const usersBtn = document.querySelector('.nav-btn[data-tab="users"]');
    const usersTab = document.getElementById("users");
    if (usersBtn && usersTab) {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab").forEach(c => c.classList.remove("active"));
      usersBtn.classList.add("active");
      usersTab.classList.add("active");
    }

    loadUsers();
    loadAllTransactions();
  } else {
    alert("Invalid credentials");
  }
}

function handleLogout() {
  document.getElementById("loginScreen").classList.add("active");
  document.getElementById("dashboard").classList.remove("active");
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("adminLoginForm").reset();
}

function createUser(e) {
  e.preventDefault();
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  const accountNumber = '1' + Math.floor(100000000 + Math.random() * 900000000).toString();
  document.getElementById("generatedAccNum").textContent = accountNumber;

  const newUser = {
    id: Date.now().toString(),
    name: document.getElementById("newName").value.trim(),
    username: document.getElementById("newUsername").value.trim().toLowerCase(),
    email: document.getElementById("newEmail").value.trim().toLowerCase(),
    phone: document.getElementById("newPhone").value.trim(),
    balance: parseFloat(document.getElementById("newBalance").value),
    password: document.getElementById("newPassword").value,
    accountNumber: accountNumber,
    pin: "",
    status: "active",
    createdAt: new Date().toISOString(),
    transactions: []
  };

  if (!newUser.name || !newUser.username || !newUser.email || isNaN(newUser.balance) || !newUser.password) {
    alert("Please fill all required fields");
    return;
  }

  if (users.some(u => u.username === newUser.username || u.email === newUser.email)) {
    alert("Username or email already exists");
    return;
  }

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  alert(`Account created!\nName: ${newUser.name}\nAccount #: ${accountNumber}`);
  e.target.reset();
  document.getElementById("generatedAccNum").textContent = "Auto-generated";

  const usersBtn = document.querySelector('.nav-btn[data-tab="users"]');
  const createBtn = document.querySelector('.nav-btn[data-tab="create"]');
  const usersTab = document.getElementById("users");

  if (usersBtn && createBtn && usersTab) {
    createBtn.classList.remove("active");
    usersBtn.classList.add("active");
    document.querySelectorAll(".tab").forEach(c => c.classList.remove("active"));
    usersTab.classList.add("active");
    loadUsers();
  }
}

function loadUsers() {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const list = document.getElementById("usersList");
  if (!list) return;

  list.innerHTML = users.length > 0
    ? users.map(u => `
      <div class="user-card" onclick="openUserModal('${u.id}')">
        <div class="user-info">
          <strong>${u.name}</strong>
          <small>@${u.username}</small>
          <small class="acc-num">${u.accountNumber}</small>
        </div>
        <div class="user-balance">$${u.balance.toFixed(2)}</div>
      </div>
    `).join("")
    : "<p class='no-data'>No users yet. Create one!</p>";
}

function openUserModal(id) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.id === id);
  if (!user) return;

  // Store user ID in modal for edit/save
  const modal = document.getElementById("userModal");
  modal.dataset.userId = id;

  document.getElementById("modalName").textContent = user.name;
  document.getElementById("modalUsername").textContent = user.username;
  document.getElementById("modalEmail").textContent = user.email;
  document.getElementById("modalAccNum").textContent = user.accountNumber;
  document.getElementById("modalPhone").textContent = user.phone || "—";
  document.getElementById("modalBalance").textContent = user.balance.toFixed(2);
  document.getElementById("modalStatus").textContent = user.status;

  document.getElementById("changePinBtn").onclick = () => {
    const pin = prompt("Enter new 4-digit PIN:");
    if (pin && /^\d{4}$/.test(pin)) {
      user.pin = pin;
      localStorage.setItem("users", JSON.stringify(users));
      alert("PIN updated!");
    }
  };

  const form = document.getElementById("addTransactionForm");
  form.onsubmit = e => {
    e.preventDefault();
    const type = document.getElementById("transType").value;
    const amount = parseFloat(document.getElementById("transAmount").value);
    const date = document.getElementById("transDate").value;
    const desc = document.getElementById("transDesc").value || (type === "deposit" ? "Admin Deposit" : "Admin Withdrawal");

    if (amount <= 0) { alert("Amount must be positive"); return; }

    const tx = { type, amount, date, desc, timestamp: Date.now() };
    user.transactions.unshift(tx);
    if (type === "deposit") user.balance += amount;
    else if (user.balance >= amount) user.balance -= amount;
    else { alert("Insufficient funds"); return; }

    localStorage.setItem("users", JSON.stringify(users));
    document.getElementById("modalBalance").textContent = user.balance.toFixed(2);
    loadUserTransactions(id);
    loadAllTransactions();
    form.reset();
    document.getElementById("transDate").value = new Date().toISOString().split('T')[0];
  };

  loadUserTransactions(id);
  document.getElementById("userModal").classList.add("active");
  document.getElementById("userModal").style.display = "flex";
}

function loadUserTransactions(id) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.id === id);
  const list = document.getElementById("userTransactions");
  if (!list) return;

  list.innerHTML = user.transactions.length > 0
    ? user.transactions.map(t => `
      <div class="transaction-item ${t.type}">
        <div class="transaction-info">
          <strong>${t.type === "deposit" ? "+" : "-"}$${t.amount.toFixed(2)}</strong>
          <p>${t.desc}</p>
        </div>
        <small>${new Date(t.date).toLocaleDateString()}</small>
        <button class="btn-small" onclick="deleteTransaction('${id}', ${t.timestamp})">Delete</button>
      </div>
    `).join("")
    : "<p class='no-data'>No transactions.</p>";
}

function deleteTransaction(id, ts) {
  if (!confirm("Delete this transaction?")) return;
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.id === id);
  const idx = user.transactions.findIndex(t => t.timestamp === ts);
  if (idx === -1) return;
  const t = user.transactions[idx];
  if (t.type === "deposit") user.balance -= t.amount;
  else user.balance += t.amount;
  user.transactions.splice(idx, 1);
  localStorage.setItem("users", JSON.stringify(users));
  loadUserTransactions(id);
  loadAllTransactions();
  document.getElementById("modalBalance").textContent = user.balance.toFixed(2);
}

function loadAllTransactions() {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  let all = [];
  const filter = document.getElementById("filterType").value;

  users.forEach(u => u.transactions.forEach(t => {
    if (!filter || t.type === filter) {
      all.push({ ...t, userName: u.name, accountNumber: u.accountNumber });
    }
  }));

  all.sort((a, b) => b.timestamp - a.timestamp);
  const list = document.getElementById("allTransactions");
  if (!list) return;

  list.innerHTML = all.length > 0
    ? all.map(t => `
      <div class="transaction-item ${t.type}">
        <div class="transaction-info">
          <strong>${t.userName}</strong> (${t.accountNumber})
          <p>${t.type === "deposit" ? "+" : "-"}$${t.amount.toFixed(2)} • ${t.desc}</p>
        </div>
        <small>${new Date(t.date).toLocaleDateString()}</small>
      </div>
    `).join("")
    : "<p class='no-data'>No transactions match filter.</p>";
}

function loadStats() {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const today = new Date().toISOString().split('T')[0];

  const totalUsers = users.length;
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const todayTx = users.reduce((sum, u) => 
    sum + u.transactions.filter(t => t.date === today).length, 0
  );
  const activeAccounts = users.filter(u => u.status === "active").length;

  document.getElementById("totalUsers").textContent = totalUsers;
  document.getElementById("totalBalance").textContent = `$${totalBalance.toFixed(2)}`;
  document.getElementById("todayTx").textContent = todayTx;
  document.getElementById("activeAccounts").textContent = activeAccounts;
}

function exportUsers() {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const csv = [
    "Name,Username,Email,Account Number,Balance,Status,Created",
    ...users.map(u => `${u.name},${u.username},${u.email},${u.accountNumber},$${u.balance.toFixed(2)},${u.status},${u.createdAt}`)
  ].join("\n");

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `allybank_users_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

function closeModal() {
  const modal = document.getElementById("userModal");
  modal.classList.remove("active");
  modal.style.display = "none";
  delete modal.dataset.userId;
  loadUsers();
}