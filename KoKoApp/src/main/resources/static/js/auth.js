// === KOKO AUTH ===
// Depends on api.js being loaded first (getToken, apiLogin, apiRegister, etc).
// login.html and register.html are now separate pages, so on success we
// save the session and redirect to "/" instead of closing an overlay.
// Guarded against double-loading - see the note at the top of api.js.
if (typeof window.__KOKO_AUTH_LOADED__ === "undefined") {
  window.__KOKO_AUTH_LOADED__ = true;

  window.saveSession = function (token, user) {
    localStorage.setItem("koko_token", token);
    localStorage.setItem("koko_user", JSON.stringify(user || {}));
  };

  window.clearSession = function () {
    localStorage.removeItem("koko_token");
    localStorage.removeItem("koko_user");
  };

  window.handleLogin = async function (event) {
    if (event) event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorBox = document.getElementById("login-error");

    hideAuthError(errorBox);

    if (!email || !password) {
      showAuthError(errorBox, "Please enter your email and password.");
      return;
    }

    try {
      const data = await apiLogin(email, password);

      if (data.token) {
        saveSession(data.token, data.user);
        window.location.href = "/";
      } else {
        showAuthError(errorBox, data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      showAuthError(errorBox, "Cannot connect to server. Please try again.");
    }
  };

  window.handleRegister = async function (event) {
    if (event) event.preventDefault();

    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const password = document.getElementById("reg-password").value;
    const errorBox = document.getElementById("reg-error");

    hideAuthError(errorBox);

    if (!name || !email || !phone || !password) {
      showAuthError(errorBox, "Please fill in all fields.");
      return;
    }

    try {
      const data = await apiRegister(name, email, phone, password);

      if (data.token) {
        saveSession(data.token, data.user);
        window.location.href = "/";
      } else {
        showAuthError(errorBox, data.message || "Registration failed.");
      }
    } catch (err) {
      showAuthError(errorBox, "Cannot connect to server. Please try again.");
    }
  };

  window.logout = function () {
    clearSession();
    // reflectAuthState() lives in ui.js and repaints the header in place;
    // if we're not on a page that has the header triggers, this is a no-op.
    if (typeof reflectAuthState === "function") reflectAuthState();
  };

  window.requireAuth = function () {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return false;
    }
    return true;
  };

  window.showAuthError = function (box, message) {
    if (!box) return;
    box.textContent = message;
    box.style.display = "block";
  };

  window.hideAuthError = function (box) {
    if (!box) return;
    box.textContent = "";
    box.style.display = "none";
  };
}