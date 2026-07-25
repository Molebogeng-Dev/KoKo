// === KOKO API SERVICE ===
// Guarded against double-loading: index.html includes this file via two
// <script> tags (one relative path, one absolute) so it works both when
// opened directly as a file AND when served by Spring Boot on :8080 -
// see the matching note in index.html. This guard makes the second load
// a no-op instead of redefining everything twice.
if (typeof window.__KOKO_API_LOADED__ === "undefined") {
  window.__KOKO_API_LOADED__ = true;

  // Relative BASE_URL because the frontend is served by the same Spring
  // Boot app as the backend (both on :8080) - avoids needing CORS config
  // for this to work locally. If you split frontend/backend onto
  // different origins later, switch this to an absolute URL and add
  // CorsConfig.java (see README).
  window.BASE_URL = "/api";

  window.getToken = function () {
    return localStorage.getItem("koko_token");
  };

  window.getUser = function () {
    const raw = localStorage.getItem("koko_user");
    return raw ? JSON.parse(raw) : null;
  };

  window.isLoggedIn = function () {
    return !!getToken();
  };

  window.authHeaders = function () {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  window.apiLogin = async function (email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  };

  window.apiRegister = async function (name, email, phone, password) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password })
    });
    return res.json();
  };

  window.getBusinesses = async function (lat, lng) {
    const res = await fetch(`${BASE_URL}/businesses?lat=${lat}&lng=${lng}`, {
      headers: authHeaders()
    });
    return res.json();
  };

  window.getProducts = async function (businessId) {
    const res = await fetch(`${BASE_URL}/businesses/${businessId}/products`, {
      headers: authHeaders()
    });
    return res.json();
  };

  window.placeOrder = async function (orderData) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(orderData)
    });
    return res.json();
  };

  window.getMyOrders = async function () {
    const res = await fetch(`${BASE_URL}/orders/my`, {
      headers: authHeaders()
    });
    return res.json();
  };

  window.getOrderStatus = async function (orderId) {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      headers: authHeaders()
    });
    return res.json();
  };
}