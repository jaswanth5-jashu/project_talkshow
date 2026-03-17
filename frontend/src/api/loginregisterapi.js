import { apiClient } from "./api";

function loginUser(email, password) {
  return apiClient.post("/login/", {
    email: email,
    password: password
  })
    .then((res) => res.data);
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
  return apiClient.post("/register/", fd)
    .then((res) => res.data);
}

function googleLogin() {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/accounts/google/login/`;
}

export {
  loginUser,
  sendOtpAPI,
  verifyOtpAPI,
  registerUser,
  googleLogin
};