import { useState, useEffect } from "react";
import { forgotPassword, verifyResetOtp, resetPasswordAPI } from "../../api/loginregisterapi";
import "../../css/components/Login/ForgotPasswordmain.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [timer, setTimer] = useState(0);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");

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

  function changeOtp(value, index) {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    if (value && index < 5) {
      document.querySelectorAll(".otpBoxes input")[index + 1].focus();
    }
  }

  const sendOtp = async () => {
    try {
      const data = await forgotPassword(email);
      if (data.message) {
        setOtpSent(true);
        setTimer(40);
        setMessage("OTP sent to email");
        setMsgType("success");
      } else {
        setMessage(data.error);
        setMsgType("error");
      }
    } catch (err) {
      setMessage("Failed to send OTP. Please try again.");
      setMsgType("error");
    }
  };

  const verifyOtp = async () => {
    try {
      const data = await verifyResetOtp(email, otp.join(""));
      if (data.message) {
        setOtpVerified(true);
        setOtpSent(false);
        setMessage("OTP verified");
        setMsgType("success");
      } else {
        setMessage(data.error);
        setMsgType("error");
      }
    } catch (err) {
      setMessage("OTP verification failed.");
      setMsgType("error");
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    const new_password = e.target.new_password.value;
    const confirm_password = e.target.confirm_password.value;

    if (new_password !== confirm_password) {
      setMessage("Passwords mismatch");
      setMsgType("error");
      return;
    }

    try {
      const data = await resetPasswordAPI(email, otp.join(""), new_password);
      if (data.message) {
        setMessage("Password changed successfully");
        setMsgType("success");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setMessage(data.error);
        setMsgType("error");
      }
    } catch (err) {
      setMessage("Password reset failed.");
      setMsgType("error");
    }
  };

  return (
    <div className="forgotPage">
      <div className="container">
        {message && <div className={`msg-box ${msgType}`}>{message}</div>}

        <h2>{otpVerified ? "Create New Password" : "Forgot Password"}</h2>

        <p className="subtitle">
          {otpVerified
            ? "Enter your new password"
            : "Enter your email to receive OTP"}
        </p>

        <div className="step-content">
          {!otpVerified ? (
            <>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
              />

              {!otpSent ? (
                <button onClick={sendOtp} className="main-btn">
                  Send OTP
                </button>
              ) : (
                <div className="otpSection animate-in">
                  <div className="otpBoxes">
                    {otp.map((v, i) => (
                      <input
                        key={i}
                        maxLength="1"
                        value={v}
                        onChange={(e) => changeOtp(e.target.value, i)}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  <button onClick={verifyOtp} className="main-btn">
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
          ) : (
            <form onSubmit={resetPassword} className="animate-in password-box">
              <input
                type="password"
                name="new_password"
                placeholder="New Password"
                required
              />

              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm Password"
                required
              />

              <button className="main-btn">Update Password</button>
            </form>
          )}
        </div>
      </div>

      <div className="back-link" onClick={() => window.history.back()}>
        ← Back to Login
      </div>
    </div>
  );
}

export default ForgotPassword;
