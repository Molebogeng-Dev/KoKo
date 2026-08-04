// === KOKO AUTH MODAL ===
// This file handles the modal's UI mechanics: opening/closing it,
// switching between the Sign In / Sign Up panels, and stepping through
// the Sign In OTP step + the Sign Up 3-step wizard.
//
// It does NOT do the actual validation or network calls itself - that's
// auth.js's job. Two integration points connect the two files:
//   - window.validateRegisterStep(step) - auth.js defines this; the Next
//     button here calls it before advancing and stays put if it fails.
//   - window.showRegisterStep / window.showRegisterConfirmation - this
//     file defines these; auth.js calls them after a server response
//     (jump back to step 1 on error, show the confirmation panel on success).
//
// Sign In's two steps are still prototype-only (no real OTP send/verify
// yet) since that backend doesn't exist yet - see the TODO markers below.
//
// Guarded against double-loading, same pattern as auth.js.
if (typeof window.__KOKO_MODAL_LOADED__ === "undefined") {
  window.__KOKO_MODAL_LOADED__ = true;

  const overlay = document.getElementById("auth-overlay");
  const closeBtn = document.getElementById("auth-close");
  const signinTrigger = document.getElementById("signin-trigger");
  const signupTrigger = document.getElementById("signup-trigger");

  const panelLogin = document.getElementById("panel-login");
  const panelRegister = document.getElementById("panel-register");

  const signinCredentialsForm = document.getElementById("signin-credentials-form");
  const signinOtpForm = document.getElementById("signin-otp-form");

  const signupForm = document.getElementById("signup-form");
  const registerConfirmation = document.getElementById("register-confirmation");
  const registerStepIndicator = document.getElementById("register-step-indicator");

  function openModal(panel) {
    if (!overlay) return;
    showPanel(panel || "login");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Switches between the Sign In and Sign Up panels, and resets whichever
  // one is being switched INTO back to its first step - so re-opening
  // Sign Up always starts at step 1, not wherever you left it last time.
  function showPanel(panel) {
    const isLogin = panel === "login";

    panelLogin.classList.toggle("active", isLogin);
    panelRegister.classList.toggle("active", !isLogin);

    if (isLogin) {
      showSigninStep(1);
    } else {
      showRegisterStep(1);
    }
  }

  function showSigninStep(step) {
    signinCredentialsForm.classList.toggle("active", step === 1);
    signinOtpForm.classList.toggle("active", step === 2);
  }

  function showRegisterStep(step) {
    document.querySelectorAll("#panel-register .auth-step").forEach(function (el) {
      el.classList.toggle("active", Number(el.dataset.step) === step);
    });

    document.querySelectorAll("#register-step-indicator .step-dot").forEach(function (dot) {
      dot.classList.toggle("active", Number(dot.dataset.stepDot) === step);
    });

    // In case we're coming back from the confirmation screen (e.g. user
    // re-opens the modal), make sure the form + step dots are visible again.
    signupForm.style.display = "";
    registerStepIndicator.style.display = "";
    registerConfirmation.classList.remove("active");
  }
  window.showRegisterStep = showRegisterStep;

  // Swaps the wizard for the "check your inbox" panel. Called by auth.js
  // once the real POST /api/auth/register succeeds - this used to be
  // inline prototype code that ran on every submit with no real request
  // behind it; now it only runs after an actual successful save.
  function showRegisterConfirmation() {
    signupForm.style.display = "none";
    registerStepIndicator.style.display = "none";
    registerConfirmation.classList.add("active");
  }
  window.showRegisterConfirmation = showRegisterConfirmation;

  document.addEventListener("DOMContentLoaded", function () {

    if (signinTrigger) {
      signinTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        openModal("login");
      });
    }

    if (signupTrigger) {
      signupTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        openModal("register");
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) closeModal();
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && overlay && overlay.classList.contains("active")) {
        closeModal();
      }
    });

    // "Create an account" / "Sign In" switch links between the two panels
    document.querySelectorAll("[data-panel]").forEach(function (el) {
      el.addEventListener("click", function () {
        showPanel(el.dataset.panel);
      });
    });

    // Register wizard: Next / Back buttons. Next is gated through
    // auth.js's window.validateRegisterStep, if it's loaded - falls back
    // to allowing navigation so the modal never gets stuck if that
    // function is missing for some reason.
    document.querySelectorAll("[data-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const targetStep = Number(btn.dataset.next);
        const currentStep = targetStep - 1;

        if (typeof window.validateRegisterStep === "function"
            && !window.validateRegisterStep(currentStep)) {
          return;
        }

        showRegisterStep(targetStep);
      });
    });

    document.querySelectorAll("[data-back]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showRegisterStep(Number(btn.dataset.back));
      });
    });

    // PROTOTYPE ONLY - Sign In step 1 -> step 2. Real behaviour (verify
    // credentials, actually send an OTP) belongs in auth.js later.
    if (signinCredentialsForm) {
      signinCredentialsForm.addEventListener("submit", function (event) {
        event.preventDefault();
        showSigninStep(2);
      });
    }

    // PROTOTYPE ONLY - Sign In step 2 just closes the modal. Real
    // behaviour (verify the OTP, log the user in) belongs in auth.js later.
    if (signinOtpForm) {
      signinOtpForm.addEventListener("submit", function (event) {
        event.preventDefault();
        closeModal();
      });
    }

    // Sign Up final step's real submit handling (validate, POST, show
    // confirmation on success) now lives in auth.js - it calls
    // window.showRegisterConfirmation() above on a successful save.
    // Sign In's two steps are still prototype-only below since the
    // login/OTP backend isn't built yet.

    const confirmationCloseBtn = document.getElementById("confirmation-close-btn");
    if (confirmationCloseBtn) {
      confirmationCloseBtn.addEventListener("click", closeModal);
    }

  });
}