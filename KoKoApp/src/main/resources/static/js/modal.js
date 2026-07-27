// === KOKO AUTH MODAL (prototype) ===
// This file only handles the modal's UI mechanics: opening/closing it,
// switching between the Sign In / Sign Up panels, and stepping through
// the Sign In OTP step + the Sign Up 3-step wizard.
//
// It deliberately does NOT call any API, send a real OTP, validate
// credentials, or handle the photo capture camera - all of that is
// separate future work (auth.js + a dedicated camera-capture file).
// Where a "real" action would normally happen (sending an OTP, creating
// the account), this just advances the UI to the next step/panel so the
// prototype can be clicked through end-to-end.
//
// Guarded against double-loading, same pattern as api.js/auth.js/Ui.js.
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

    // Register wizard: Next / Back buttons
    document.querySelectorAll("[data-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showRegisterStep(Number(btn.dataset.next));
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

    // PROTOTYPE ONLY - Sign Up final step swaps the form for the
    // confirmation panel. Real behaviour (upload photo, create the
    // account, actually send the email/WhatsApp verification) belongs
    // in auth.js later.
    if (signupForm) {
      signupForm.addEventListener("submit", function (event) {
        event.preventDefault();
        signupForm.style.display = "none";
        registerStepIndicator.style.display = "none";
        registerConfirmation.classList.add("active");
      });
    }

    const confirmationCloseBtn = document.getElementById("confirmation-close-btn");
    if (confirmationCloseBtn) {
      confirmationCloseBtn.addEventListener("click", closeModal);
    }

  });
}