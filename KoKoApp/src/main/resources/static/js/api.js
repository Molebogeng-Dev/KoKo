// === KOKO API SERVICE ===
const BASE_URL = "http://localhost:8080/api";

function getToken() {
  return localStorage.getItem("koko_token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`
  };
}

async function apiLogin(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

async function apiRegister(name, email, phone, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password })
  });
  return res.json();
}

async function getBusinesses(lat, lng) {
  const res = await fetch(`${BASE_URL}/businesses?lat=${lat}&lng=${lng}`, {
    headers: authHeaders()
  });
  return res.json();
}

async function getProducts(businessId) {
  const res = await fetch(`${BASE_URL}/businesses/${businessId}/products`, {
    headers: authHeaders()
  });
  return res.json();
}

async function placeOrder(orderData) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(orderData)
  });
  return res.json();
}

async function getMyOrders() {
  const res = await fetch(`${BASE_URL}/orders/my`, {
    headers: authHeaders()
  });
  return res.json();
}

async function getOrderStatus(orderId) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    headers: authHeaders()
  });
  return res.json();
}
