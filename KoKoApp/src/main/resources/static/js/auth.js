// === KOKO AUTH ===

async function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorBox = document.getElementById("login-error");

  try {
    const data = await apiLogin(email, password);
    if (data.token) {
      localStorage.setItem("koko_token", data.token);
      localStorage.setItem("koko_user", JSON.stringify(data.user));
      window.location.href = "home.html";
    } else {
      errorBox.style.display = "block";
      errorBox.textContent = data.message || "Login failed. Please try again.";
    }
  } catch (err) {
    errorBox.style.display = "block";
    errorBox.textContent = "Cannot connect to server. Please try again.";
  }
}

async function handleRegister() {
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const phone = document.getElementById("reg-phone").value;
  const password = document.getElementById("reg-password").value;
  const errorBox = document.getElementById("reg-error");

  try {
    const data = await apiRegister(name, email, phone, password);
    if (data.token) {
      localStorage.setItem("koko_token", data.token);
      localStorage.setItem("koko_user", JSON.stringify(data.user));
      window.location.href = "home.html";
    } else {
      errorBox.style.display = "block";
      errorBox.textContent = data.message || "Registration failed.";
    }
  } catch (err) {
    errorBox.style.display = "block";
    errorBox.textContent = "Cannot connect to server. Please try again.";
  }
}

function logout() {
  localStorage.removeItem("koko_token");
  localStorage.removeItem("koko_user");
  window.location.href = "index.html";
}

function requireAuth() {
  if (!localStorage.getItem("koko_token")) {
    window.location.href = "index.html";
  }
}
