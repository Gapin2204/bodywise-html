const form = document.getElementById("loginForm");
const password = document.getElementById("password");
const toggle = document.getElementById("togglePassword");

function setFieldError(input, message) {
  const error = document.getElementById(`${input.id}Error`);
  error.textContent = message;
  input.setAttribute("aria-invalid", String(Boolean(message)));
}

toggle.addEventListener("click", () => {
  const isPassword = password.type === "password";
  password.type = isPassword ? "text" : "password";
  toggle.textContent = isPassword ? "Sembunyikan" : "Lihat";
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const emailInput = document.getElementById("email");
  const email = emailInput.value.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  setFieldError(emailInput, validEmail ? "" : "Masukkan alamat email yang valid.");
  setFieldError(password, password.value.length >= 8 ? "" : "Password harus terdiri dari minimal 8 karakter.");
  if (!validEmail || password.value.length < 8) return;
  localStorage.setItem("bodywiseUser", email);
  window.location.href = "dashboard.html";
});

[document.getElementById("email"), password].forEach(input => {
  input.addEventListener("input", () => setFieldError(input, ""));
});

document.getElementById("demoLogin").addEventListener("click", () => {
  localStorage.setItem("bodywiseUser", "demo@bodywise.id");
  window.location.href = "dashboard.html";
});

