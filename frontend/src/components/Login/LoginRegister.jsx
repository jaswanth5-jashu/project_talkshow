import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "../../css/components/Login/LoginRegister.css";

import {
  loginUser,
  sendOtpAPI,
  verifyOtpAPI,
  registerUser,
  googleLogin,
  getRoles,
} from "../../api/loginregisterapi";
import { useAuth } from "../../context/AuthContext";

function LoginRegister() {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  const [isLogin, setIsLogin] = useState(true);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [regStep, setRegStep] = useState(1);

  const [timer, setTimer] = useState(0);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");

  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    profile: null,
    role: "",
    gender: "",
    bio: "",
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    capital: false,
    number: false,
    special: false,
  });

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    getRoles().then(data => setRoles(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);

      return () => clearTimeout(t);
    }
  }, [timer]);

  useEffect(() => {
    if (isLogin) {
      setRegStep(1);
      setOtpSent(false);
      setOtpVerified(false);
      setOtp(["", "", "", "", "", ""]);
    }
  }, [isLogin]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => {
        setMessage("");
      }, 4000);

      return () => clearTimeout(t);
    }
  }, [message]);

  function change(e) {
    if (e.target.name === "profile") {
      setForm({ ...form, profile: e.target.files[0] });
    } else if (e.target.name === "email" && !isLogin) {
      const email = e.target.value;
      const username = form.username || email.split("@")[0] || "";
      setForm({ ...form, email, username });
    } else if (e.target.name === "password") {
       const pass = e.target.value;
       setForm({ ...form, password: pass });
       setPasswordCriteria({
         length: pass.length >= 6,
         capital: /[A-Z]/.test(pass),
         number: /[0-9]/.test(pass),
         special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
       });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  }

  function changeOtp(value, index) {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.querySelectorAll(".otpBoxes input")[index + 1];
      if (nextInput) nextInput.focus();
    }
  }

  function handleOtpKeyDown(e, index) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.querySelectorAll(".otpBoxes input")[index - 1];
      if (prevInput) prevInput.focus();
    }
  }

  function sendOtp() {
    sendOtpAPI(form.email).then(function (data) {
      if (data.message) {
        setOtpSent(true);
        setRegStep(2);
        setTimer(40);
        setMessage("OTP sent to email");
        setMsgType("success");
      } else {
        setMessage(data.error);
        setMsgType("error");
      }
    });
  }

  function verifyOtp() {
    verifyOtpAPI(form.email, otp.join("")).then(function (data) {
      if (data.message) {
        setOtpVerified(true);
        setOtpSent(false);
        setRegStep(3);
        setMessage("OTP verified");
        setMsgType("success");
      } else {
        setMessage(data.error);
        setMsgType("error");
      }
    });
  }

  function register(e) {
    e.preventDefault();

    if (form.email && !otpVerified) {
      setMessage("Verify OTP first");
      setMsgType("error");
      return;
    }

    if (!Object.values(passwordCriteria).every(Boolean)) {
      setMessage("Password must meet all security requirements");
      setMsgType("error");
      return;
    }

    if (form.password !== form.confirm_password) {
      setMessage("Passwords not matching");
      setMsgType("error");

      return;
    }

    registerUser(form).then(function (data) {
      if (data.message) {
        setMessage("Account created successfully");
        setMsgType("success");

        setForm({
          username: "",
          full_name: "",
          email: "",
          phone_number: "",
          password: "",
          confirm_password: "",
          profile: null,
          role: "",
          gender: "",
          bio: "",
        });

        setOtp(["", "", "", "", "", ""]);

        setOtpSent(false);
        setOtpVerified(false);
        setRegStep(1);
        setTimer(0);

        setIsLogin(true);
      } else {
        setMessage(data.error);
        setMsgType("error");
      }
    });
  }

  function login(e) {
    e.preventDefault();

    const identifier = form.username || form.email;

    loginUser(identifier, form.password).then(function (data) {
      if (data.message) {
        setMessage("Login successful");
        setMsgType("success");
        contextLogin(data);
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMessage(data.error);
        setMsgType("error");
      }
    });
  }
 
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const data = await googleLogin(tokenResponse.access_token);
        if (data.message) {
          setMessage("Google login successful");
          setMsgType("success");
          contextLogin(data);
          setTimeout(() => navigate("/"), 1500);
        } else {
          setMessage(data.error || "Google login failed");
          setMsgType("error");
        }
      } catch (err) {
        console.error("Google login error:", err);
        setMessage("Connection failed. Check backend.");
        setMsgType("error");
      }
    },
    onError: () => {
      setMessage("Google login failed");
      setMsgType("error");
    }
  });

  return (
    <div className="auth">
      <div className="card">
        {message && <div className={`msg-box ${msgType}`}>{message}</div>}

        <div className="box">

          <div className={`form ${!isLogin ? "hide" : ""}`}>
            <h1>Welcome Back</h1>

            <p className="subtitle">Login to your account</p>

            <form onSubmit={login}>
              <input
                type="text"
                name="email"
                placeholder="Email or Username"
                onChange={change}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={change}
                required
              />

              <span
                className="forgot"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </span>

              <button className="main-btn">Login</button>

              <div className="divider">
                <span>or</span>
              </div>

              <button
                type="button"
                className="google-btn"
                onClick={() => handleGoogleLogin()}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="google"
                />
                Login with Google
              </button>
            </form>
          </div>

          <div className={`form ${isLogin ? "hide" : ""}`}>
            <h1>
              {regStep === 1 ? "Create Account" : regStep === 2 ? "Verify Email" : "Final Details"}
            </h1>

            <p className="subtitle">
              {regStep === 1 
                ? "Join the TalkShow family" 
                : regStep === 2 
                  ? "Enter OTP to continue" 
                  : "Finish setting up your profile"}
            </p>

            <form onSubmit={register}>
              {regStep === 1 && (
                <div className="step-1 animate-in">
                  <div className="row">
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Full Name"
                      onChange={change}
                      value={form.full_name}
                      required
                    />
                  </div>
                  <div className="row">
                    <select 
                      name="gender" 
                      onChange={change} 
                      value={form.gender} 
                      className="auth-select gender-select"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    onChange={change}
                    value={form.email}
                    required
                  />
                  <button type="button" className="main-btn" onClick={sendOtp}>
                    Send OTP
                  </button>
                </div>
              )}

              {regStep === 2 && (
                <div className="step-2 animate-in">
                  <p className="subtitle">Enter the 6-digit code sent to {form.email}</p>
                  <div className="otpSection">
                    <div className="otpBoxes">
                      {otp.map((v, i) => (
                        <input
                          key={i}
                          maxLength="1"
                          value={v}
                          onChange={(e) => changeOtp(e.target.value, i)}
                          onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      className="main-btn"
                      onClick={verifyOtp}
                    >
                      Verify OTP
                    </button>

                    <div className="timer-section">
                      {timer > 0 ? (
                        <span>Resend OTP in {timer}s</span>
                      ) : (
                        <span className="resend" onClick={sendOtp}>
                          Resend Code
                        </span>
                      )}
                    </div>
                  </div>
                  <button type="button" className="forgot back-btn" onClick={() => setRegStep(1)}>
                    Back to Edit Info
                  </button>
                </div>
              )}

              {regStep === 3 && (
                <div className="step-3 animate-in">
                  <div className="row">
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      onChange={change}
                      value={form.username}
                      required
                    />
                    <select 
                      name="role" 
                      onChange={change} 
                      value={form.role} 
                      className="auth-select role-select"
                    >
                      <option value="">Talent/Role (Optional)</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <input
                    type="text"
                    name="bio"
                    placeholder="Short Bio"
                    onChange={change}
                    value={form.bio}
                  />

                  <div className="row pass-row">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      onChange={change}
                      required
                    />
                    <input
                      type="password"
                      name="confirm_password"
                      placeholder="Confirm Password"
                      onChange={change}
                      required
                    />
                  </div>
                  <div className="password-checklist">
                      <p className={passwordCriteria.length ? "met" : "unmet"}>• 6+ Characters</p>
                      <p className={passwordCriteria.capital ? "met" : "unmet"}>• 1 Capital Letter</p>
                      <p className={passwordCriteria.number ? "met" : "unmet"}>• 1 Digit</p>
                      <p className={passwordCriteria.special ? "met" : "unmet"}>• 1 Special Character</p>
                  </div>

                  <div className="file-input-wrapper">
                    <label>Profile Picture</label>
                    <input type="file" name="profile" onChange={change} />
                  </div>

                  <button className="main-btn">Complete Registration</button>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="switch">
          {isLogin ? (
            <p>
              New here?
              <span onClick={() => setIsLogin(false)}>Create Account</span>
            </p>
          ) : (
            <p>
              Already have account?
              <span onClick={() => setIsLogin(true)}>Sign In</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
