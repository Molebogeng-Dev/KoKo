// === KOKO UI (site-wide header auth state) ===
// Depends on api.js (getUser, isLoggedIn) and auth.js (logout).
// Sign In / Sign Up are now real pages (login.html / register.html), so
// this file no longer manages an overlay or tabs - it just repaints the
// two header slots to reflect whether someone is logged in, and (on
// login.html / register.html) wires up the form submit handlers.
// Guarded against double-loading - see the note at the top of api.js.
if (typeof window.__KOKO_UI_LOADED__ === "undefined") {
  window.__KOKO_UI_LOADED__ = true;

  const signinTrigger = document.getElementById("signin-trigger");
  const signupTrigger = document.getElementById("signup-trigger");
  const signinForm = document.getElementById("signin-form");
  const signupForm = document.getElementById("signup-form");

  // Repaints the header's Sign In / Sign Up links depending on auth state.
  // Logged out: plain links to /login and /register (default href, untouched).
  // Logged in: first slot shows the user's name (inert), second becomes "Logout".
  window.reflectAuthState = function () {
    if (!signinTrigger || !signupTrigger) return;

    const user = getUser();

    if (user && isLoggedIn()) {
      signinTrigger.querySelector("span").textContent = user.name || "Account";
      signinTrigger.querySelector("i").className = "bi bi-person-check auth-icon";
      signinTrigger.dataset.tooltip = user.name || "Account";
      signinTrigger.setAttribute("href", "#");
      signinTrigger.onclick = function (event) {
        event.preventDefault();
      };

      signupTrigger.querySelector("span").textContent = "Logout";
      signupTrigger.querySelector("i").className = "bi bi-box-arrow-right auth-icon";
      signupTrigger.dataset.tooltip = "Logout";
      signupTrigger.setAttribute("href", "#");
      signupTrigger.onclick = function (event) {
        event.preventDefault();
        logout();
      };
    } else {
      signinTrigger.querySelector("span").textContent = "Sign In";
      signinTrigger.querySelector("i").className = "bi bi-box-arrow-in-right auth-icon";
      signinTrigger.dataset.tooltip = "Sign In";
      signinTrigger.setAttribute("href", "/login");
      signinTrigger.onclick = null;

      signupTrigger.querySelector("span").textContent = "Sign Up";
      signupTrigger.querySelector("i").className = "bi bi-person-plus auth-icon";
      signupTrigger.dataset.tooltip = "Sign Up";
      signupTrigger.setAttribute("href", "/register");
      signupTrigger.onclick = null;
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    reflectAuthState();

    // Only present on login.html
    if (signinForm) signinForm.addEventListener("submit", handleLogin);

    // Only present on register.html
    if (signupForm) signupForm.addEventListener("submit", handleRegister);
  });
}