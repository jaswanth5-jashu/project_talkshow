import { apiClient } from "./api";

function loginUser(email, password) {
  return apiClient.post("/login/", {
    email: email,
    password: password
  })
    .then((res) => res.data);
}

function getRoles() {
  return apiClient.get("/roles/").then(res => res.data);
}

function sendOtpAPI(email) {
  return apiClient.post("/register/", {
    email: email
  })
    .then((res) => res.data);
}

function verifyOtpAPI(email, otp) {
  return apiClient.post("/verify-otp/", {
    email: email,
    otp: otp
  })
    .then((res) => res.data);
}

function registerUser(form) {
  const fd = new FormData();
  fd.append("username", form.username);
  fd.append("full_name", form.full_name);
  fd.append("email", form.email);
  fd.append("phone_number", form.phone_number);
  fd.append("password", form.password);
  if (form.profile) {
    fd.append("profile", form.profile);
  }
  if (form.role) {
    fd.append("role", form.role);
  }
  return apiClient.post("/register/", fd)
    .then((res) => res.data);
}

function googleLogin(token) {
  return apiClient.post("/google/login/", {
    access_token: token
  }).then((res) => res.data);
}

function forgotPassword(email) {
  return apiClient.post("/forgot-password/", { email }).then((res) => res.data);
}

function verifyResetOtp(email, otp) {
  return apiClient.post("/verify-reset-otp/", { email, otp }).then((res) => res.data);
}

function resetPasswordAPI(email, otp, password) {
  return apiClient.post("/reset-password/", { email, otp, password }).then((res) => res.data);
}

export {
  loginUser,
  sendOtpAPI,
  verifyOtpAPI,
  registerUser,
  googleLogin,
  getRoles,
  forgotPassword,
  verifyResetOtp,
  resetPasswordAPI,
};