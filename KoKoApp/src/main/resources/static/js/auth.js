// === KOKO AUTH (Sign Up) ===
// Owns real validation and the actual POST /api/auth/register call for
// the sign-up wizard. modal.js only handles opening/closing/switching
// steps - this file decides whether a step is actually valid, and what
// happens on submit.
//
// Two hooks connect back into modal.js:
//   - window.validateRegisterStep(step) is defined here and called by
//     modal.js's Next button before it advances.
//   - window.showRegisterStep / window.showRegisterConfirmation are
//     defined in modal.js and called here after the server responds.
//
// Sign In isn't wired up here - the OTP backend doesn't exist yet, so
// login stays prototype-only in modal.js for now.
//
// Guarded against double-loading, same pattern as modal.js.
if (typeof window.__KOKO_AUTH_LOADED__ === "undefined") {
  window.__KOKO_AUTH_LOADED__ = true;

  /**
   * Mirrors the exact patterns enforced server-side in AuthController.
   * Client-side validation here is purely for immediate feedback - the
   * server re-checks everything regardless, since client-side checks
   * can always be bypassed by calling the API directly.
   **/
  const EMAIL_PATTERN = /^(?=.{1,254}$)(?=.{1,64}@)(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/;
  const SA_PHONE_PATTERN = /^[1-9]\d{8}$/;
  const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,128}$/;

  // Not one of the three you provided, but the postal code field is
  // already constrained to 4 numeric digits via its own HTML attributes
  // (inputmode="numeric" maxlength="4") - this just backs that up.
  const POSTAL_CODE_PATTERN = /^\d{4}$/;

  function setHint(id, message, stateClass) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message || "";
    el.classList.remove("field-hint-error", "field-hint-valid");
    if (stateClass) el.classList.add(stateClass);
  }

  function isBlank(value) {
    return !value || value.trim().length === 0;
  }

  // ============================= //
  // PASSWORD STRENGTH METER
  // ============================= //

  // Score 0-5: length >= 8, plus one point each for lowercase, uppercase,
  // digit, special character - i.e. the same 5 conditions the regex above
  // requires all of at once for a password to actually be valid.
  function calculatePasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) score++;
    return score;
  }

  function updatePasswordStrength(password) {
    const bars = document.querySelectorAll("#password-strength .strength-bar");
    const label = document.getElementById("password-strength-label");
    if (!bars.length || !label) return;

    let filledCount = 0;
    let fillClass = "";
    let labelText = "";

    if (password) {
      const score = calculatePasswordStrength(password);

      if (score <= 1) {
        filledCount = 1; fillClass = "filled-weak"; labelText = "Weak";
      } else if (score === 2) {
        filledCount = 2; fillClass = "filled-fair"; labelText = "Fair";
      } else if (score === 3) {
        filledCount = 3; fillClass = "filled-good"; labelText = "Good";
      } else {
        filledCount = 4; fillClass = "filled-strong"; labelText = "Strong";
      }
    }

    bars.forEach(function (bar, index) {
      bar.classList.remove("filled-weak", "filled-fair", "filled-good", "filled-strong");
      if (index < filledCount) bar.classList.add(fillClass);
    });

    label.textContent = labelText;
  }

  // ============================= //
  // CONFIRM PASSWORD - live match check
  // ============================= //

  function checkPasswordsMatch() {
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm-password").value;

    if (!confirm) {
      setHint("reg-confirm-password-hint", "");
      return true; // don't nag before they've typed anything here yet
    }

    if (password === confirm) {
      setHint("reg-confirm-password-hint", "Passwords match", "field-hint-valid");
      return true;
    }

    setHint("reg-confirm-password-hint", "Passwords do not match", "field-hint-error");
    return false;
  }

  // ============================= //
  // FIELD-LEVEL VALIDATORS
  // ============================= //

  function validateEmailField() {
    const value = document.getElementById("reg-email").value.trim();

    if (isBlank(value)) {
      setHint("reg-email-hint", "Email is required.", "field-hint-error");
      return false;
    }
    if (!EMAIL_PATTERN.test(value)) {
      setHint("reg-email-hint", "Enter a valid email address.", "field-hint-error");
      return false;
    }
    setHint("reg-email-hint", "");
    return true;
  }

  function validatePhoneField() {
    const value = document.getElementById("reg-phone").value.trim();

    if (isBlank(value)) {
      setHint("reg-phone-hint", "Phone number is required.", "field-hint-error");
      return false;
    }
    if (!SA_PHONE_PATTERN.test(value)) {
      setHint("reg-phone-hint", "Enter a valid number, e.g. 82 123 4567 (no leading 0).", "field-hint-error");
      return false;
    }
    setHint("reg-phone-hint", "");
    return true;
  }

  function validatePasswordField() {
    const value = document.getElementById("reg-password").value;
    return PASSWORD_PATTERN.test(value);
  }

  function validatePostalCodeField() {
    const value = document.getElementById("reg-postal-code").value.trim();

    if (isBlank(value)) {
      setHint("reg-postal-code-hint", "Postal code is required.", "field-hint-error");
      return false;
    }
    if (!POSTAL_CODE_PATTERN.test(value)) {
      setHint("reg-postal-code-hint", "Enter a valid 4-digit postal code.", "field-hint-error");
      return false;
    }
    setHint("reg-postal-code-hint", "");
    return true;
  }

  // ============================= //
  // STEP-LEVEL VALIDATORS
  // ============================= //

  function validateStep1() {
    const nameOk = !isBlank(document.getElementById("reg-name").value);
    const surnameOk = !isBlank(document.getElementById("reg-surname").value);
    const phoneOk = validatePhoneField();
    const emailOk = validateEmailField();
    const passwordOk = validatePasswordField();
    const confirmOk = checkPasswordsMatch();

    const allOk = nameOk && surnameOk && phoneOk && emailOk && passwordOk && confirmOk;

    const errorBox = document.getElementById("reg-error");
    if (errorBox) {
      errorBox.textContent = allOk ? "" : "Please fix the highlighted fields before continuing.";
      errorBox.style.display = allOk ? "none" : "block";
    }

    return allOk;
  }

  function validateStep2() {
    const addressOk = !isBlank(document.getElementById("reg-address").value);
    const suburbOk = !isBlank(document.getElementById("reg-suburb").value);
    const provinceOk = !isBlank(document.getElementById("reg-province").value);
    const postalOk = validatePostalCodeField();

    const allOk = addressOk && suburbOk && provinceOk && postalOk;

    const errorBox = document.getElementById("reg-error-2");
    if (errorBox) {
      errorBox.textContent = allOk ? "" : "Please fix the highlighted fields before continuing.";
      errorBox.style.display = allOk ? "none" : "block";
    }

    return allOk;
  }

  // Called by modal.js's Next button before it advances to the given step
  window.validateRegisterStep = function (currentStep) {
    if (currentStep === 1) return validateStep1();
    if (currentStep === 2) return validateStep2();
    return true;
  };

  // ============================= //
  // FINAL SUBMIT
  // ============================= //

  async function handleRegisterSubmit(event) {
    event.preventDefault();

    // The Next button already gates steps 1 and 2, but step 3's submit
    // button doesn't go through that gate - re-check everything here too.
    if (!validateStep1()) {
      window.showRegisterStep(1);
      return;
    }
    if (!validateStep2()) {
      window.showRegisterStep(2);
      return;
    }

    const phoneCode = document.getElementById("reg-phone-code").value;
    const phoneNumber = document.getElementById("reg-phone").value.trim();

    const payload = {
      name: document.getElementById("reg-name").value.trim(),
      surname: document.getElementById("reg-surname").value.trim(),
      phone: phoneCode + phoneNumber,
      email: document.getElementById("reg-email").value.trim(),
      password: document.getElementById("reg-password").value,
      confirmPassword: document.getElementById("reg-confirm-password").value,
      address: document.getElementById("reg-address").value.trim(),
      suburb: document.getElementById("reg-suburb").value.trim(),
      province: document.getElementById("reg-province").value,
      postalCode: document.getElementById("reg-postal-code").value.trim()
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        window.showRegisterConfirmation();
        return;
      }

      // Server rejected it (duplicate email/phone, or a check that
      // somehow only failed server-side) - jump back to step 1 and show
      // it there, since that's the step most of these fields live on.
      showServerError(data.message);

    } catch (err) {
      showServerError("Cannot connect to server. Please try again.");
    }
  }

  function showServerError(message) {
    window.showRegisterStep(1);
    const errorBox = document.getElementById("reg-error");
    if (errorBox) {
      errorBox.textContent = message || "Registration failed. Please try again.";
      errorBox.style.display = "block";
    }
  }

  // ============================= //
  // WIRE UP LIVE LISTENERS
  // ============================= //

  document.addEventListener("DOMContentLoaded", function () {

    const passwordInput = document.getElementById("reg-password");
    const confirmInput = document.getElementById("reg-confirm-password");
    const emailInput = document.getElementById("reg-email");
    const phoneInput = document.getElementById("reg-phone");
    const postalInput = document.getElementById("reg-postal-code");
    const signupForm = document.getElementById("signup-form");

    if (passwordInput) {
      passwordInput.addEventListener("input", function () {
        updatePasswordStrength(passwordInput.value);
        if (confirmInput && confirmInput.value) checkPasswordsMatch();
      });
    }

    if (confirmInput) {
      confirmInput.addEventListener("input", checkPasswordsMatch);
    }

    if (emailInput) {
      emailInput.addEventListener("blur", validateEmailField);
    }

    if (phoneInput) {
      phoneInput.addEventListener("blur", validatePhoneField);
    }

    if (postalInput) {
      postalInput.addEventListener("blur", validatePostalCodeField);
    }

    if (signupForm) {
      signupForm.addEventListener("submit", handleRegisterSubmit);
    }

  });
}