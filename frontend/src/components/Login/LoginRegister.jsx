import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/components/Login/LoginRegister.css";

import {
  loginUser,
  sendOtpAPI,
  verifyOtpAPI,
  registerUser,
  googleLogin,
} from "../../api/loginregisterapi";
import { useAuth } from "../../context/AuthContext";

function LoginRegister() {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  const [isLogin, setIsLogin] = useState(true);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

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
  });

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);

      return () => clearTimeout(t);
    }
  }, [timer]);

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
      document.querySelectorAll(".otpBoxes input")[index + 1].focus();
    }
  }

  function sendOtp() {
    sendOtpAPI(form.email).then(function (data) {
      if (data.message) {
        setOtpSent(true);
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

    if (!otpVerified) {
      setMessage("Verify OTP first");
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
        });

        setOtp(["", "", "", "", "", ""]);

        setOtpSent(false);
        setOtpVerified(false);
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

    loginUser(form.email, form.password).then(function (data) {
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

  return (
    <div className="auth">
      <div className="card">
        {message && <div className={`msg-box ${msgType}`}>{message}</div>}

        <div className="box">
          {/* LOGIN */}

          <div className={`form ${!isLogin ? "hide" : ""}`}>
            <h1>Welcome Back</h1>

            <p className="subtitle">Login to your account</p>

            <form onSubmit={login}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
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
                onClick={googleLogin}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="google"
                />
                Login with Google
              </button>
            </form>
          </div>

          {/* REGISTER */}

          <div className={`form ${isLogin ? "hide" : ""}`}>
            <h1>{otpVerified ? "Create Password" : "Create Account"}</h1>

            <p className="subtitle">
              {otpVerified
                ? "Set password to finish registration"
                : "Verify email with OTP"}
            </p>

            <form onSubmit={register}>
              {!otpVerified && (
                <>
                  <div className="row">
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Full Name"
                      onChange={change}
                      required
                    />

                    <input
                      type="tel"
                      name="phone_number"
                      placeholder="Phone Number"
                      onChange={change}
                    />
                  </div>

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    onChange={change}
                    disabled={otpSent}
                    required
                  />

                  {!otpSent && (
                    <button type="button" className="otpBtn" onClick={sendOtp}>
                      Send OTP
                    </button>
                  )}

                  {otpSent && (
                    <div className="otpSection">
                      <div className="otpBoxes">
                        {otp.map((v, i) => (
                          <input
                            key={i}
                            maxLength="1"
                            value={v}
                            onChange={(e) => changeOtp(e.target.value, i)}
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
                  )}
                </>
              )}

              {otpVerified && (
                <div className="step-2">
                  <div className="row">
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
