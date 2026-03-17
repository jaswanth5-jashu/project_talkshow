import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiPhone, FiCamera, FiCheckCircle, FiAlertCircle, FiSettings, FiLogOut, FiShield } from "react-icons/fi";
import { updateProfileAPI, getProfileAPI } from "../api/profileapi";
import { useAuth } from "../context/AuthContext";
import { getMediaBase } from "../api/api";
import "../css/components/Profile/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  
  // Refs for performance-critical inputs (reading data on demand)
  const fullNameRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const newEmailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Still need state for values that affect UI rendering
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || ""
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  
  const [emailFlow, setEmailFlow] = useState("input");
  const [passFlow, setPassFlow] = useState("input");
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);

  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png";
    if (path.startsWith("http")) return path;
    return getMediaBase() + path;
  };

  const fetchProfileData = async () => {
    if (!user?.email) return;
    try {
      const data = await getProfileAPI(user.email);
      if (!data.error) {
        setProfileData({
          username: data.username,
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone_number
        });
        setProfilePreview(getImageUrl(data.profile));
      }
    } catch (err) {
      console.error("Failed to fetch latest profile data");
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?.email]);

  const handleLogout = () => {
    logout();
    navigate("/Login");
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpArray];
    newOtp[index] = value.slice(-1);
    setOtpArray(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      handleProfileUpdate(file);
    }
  };

  const handleProfileUpdate = async (file) => {
    const currentEmail = user?.email || profileData.email;
    if (!currentEmail) return;
    const fd = new FormData();
    fd.append("current_email", currentEmail);
    fd.append("profile", file);
    
    try {
      const res = await updateProfileAPI(fd);
      if (!res.error) {
        login({ 
          ...user, 
          profile: res.profile, 
          access: localStorage.getItem("talkshow_access"), 
          refresh: localStorage.getItem("talkshow_refresh") 
        });
        setMessage({ type: "success", text: "Visual identity synchronized." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Cloud sync failed." });
    }
  };

  const handleUpdateFullName = async () => {
    const currentEmail = user?.email || profileData.email;
    const fullName = fullNameRef.current.value;
    if (!fullName) return;

    setLoading(true);
    const fd = new FormData();
    fd.append("current_email", currentEmail);
    fd.append("full_name", fullName);

    try {
      const res = await updateProfileAPI(fd);
      if (!res.error) {
        setProfileData(prev => ({ ...prev, full_name: res.full_name }));
        login({ ...user, full_name: res.full_name, access: localStorage.getItem("talkshow_access"), refresh: localStorage.getItem("talkshow_refresh") });
        setMessage({ type: "success", text: "Full name updated successfully." });
      } else {
        setMessage({ type: "error", text: res.error });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Update failed." });
    }
    setLoading(false);
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    const currentEmail = user?.email || profileData.email;
    if (!currentEmail) {
      setMessage({ type: "error", text: "Identity context missing. Please try logging in again." });
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("current_email", currentEmail);
    
    if (emailFlow === "input") {
      fd.append("new_email", newEmailRef.current.value);
    } else {
      fd.append("new_email", newEmailRef.current.value);
      fd.append("otp", otpArray.join(""));
    }

    try {
      const res = await updateProfileAPI(fd);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else if (res.message === "OTP sent") {
        setEmailFlow("otp");
        setOtpArray(["", "", "", "", "", ""]);
        setMessage({ type: "success", text: "Security key sent to your NEW email address." });
      } else if (res.message === "Email updated") {
        login({ ...user, email: res.new_email, access: localStorage.getItem("talkshow_access"), refresh: localStorage.getItem("talkshow_refresh") });
        setProfileData(prev => ({ ...prev, email: res.new_email }));
        setEmailFlow("input");
        setMessage({ type: "success", text: "Identity synchronized across all nodes." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Synchronization failure." });
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const currentEmail = user?.email || profileData.email;
    
    if (passFlow === "input" && passwordRef.current.value !== confirmPasswordRef.current.value) {
      setMessage({ type: "error", text: "Password mismatch. Verify both fields match." });
      return;
    }

    if (!currentEmail) {
      setMessage({ type: "error", text: "Identity context missing. Please try logging in again." });
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("current_email", currentEmail);
    fd.append("password", passwordRef.current.value);
    if (passFlow === "otp") fd.append("otp", otpArray.join(""));

    try {
      const res = await updateProfileAPI(fd);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else if (res.message === "OTP sent") {
        setPassFlow("otp");
        setOtpArray(["", "", "", "", "", ""]);
        setMessage({ type: "success", text: "Security key sent to your CURRENT email address." });
      } else if (res.message === "Password updated") {
        passwordRef.current.value = "";
        confirmPasswordRef.current.value = "";
        setPassFlow("input");
        setMessage({ type: "success", text: "Access credentials hardened successfully." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Security disruption." });
    }
    setLoading(false);
  };

  return (
    <div className="profile-page-cinematic">
      <div className="profile-vignette"></div>
      
      <div className="profile-dashboard-container">
        <div className="profile-hero-card">
          <div className="profile-img-showcase">
            <img src={profilePreview || "/default-avatar.png"} alt="Member" className="main-profile-img" />
            <label className="cinematic-camera-trigger">
              <FiCamera />
              <input type="file" onChange={handleFileChange} hidden />
            </label>
          </div>
          
          <div className="hero-text">
            <h1 className="hero-name">{profileData.full_name || profileData.username || "MEMBER"}</h1>
            <div className="hero-metadata-strip">
              <div className="meta-pill">
                <FiMail />
                <span>{profileData.email}</span>
              </div>
              <div className="meta-pill">
                <FiPhone />
                <span>{profileData.phone_number || "NO CONTACT SET"}</span>
              </div>
            </div>
            <div className="hero-actions">
               <button className="logout-btn-cinematic" onClick={handleLogout}>
                  <FiLogOut />
                  <span>TERMINATE SESSION</span>
               </button>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`cinematic-status-banner ${message.type}`}>
            {message.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="settings-grid-cinematic">
          
          {/* FULL NAME UPDATE */}
          <div className="settings-card glass-panel">
            <div className="card-header">
               <FiUser className="header-icon" />
               <div className="header-text">
                  <h3>ACCOUNT IDENTITY</h3>
                  <p>FULL NAME DISCOVERY</p>
               </div>
            </div>
            <div className="cinematic-form">
                <div className="cinematic-input-box">
                  <label>FULL NAME</label>
                  <div className="inner-input">
                    <FiUser />
                    <input
                      type="text"
                      ref={fullNameRef}
                      placeholder="ENTER FULL NAME"
                      defaultValue={profileData.full_name}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleUpdateFullName} 
                  className="action-btn-cinematic primary" 
                  disabled={loading}
                >
                  SAVE IDENTITY
                </button>
            </div>
          </div>

          <div className="settings-card glass-panel">
            <div className="card-header">
               <FiMail className="header-icon" />
               <div className="header-text">
                  <h3>IDENTITY CONTROL</h3>
                  <p>EMAIL SYNCHRONIZATION</p>
               </div>
            </div>

            <form onSubmit={handleEmailChange} className="cinematic-form">
              {emailFlow === "input" ? (
                <>
                  <div className="cinematic-input-box read-only">
                    <label>CURRENT IDENTITY</label>
                    <div className="inner-input">
                      <FiMail />
                      <input type="text" value={user?.email || ""} readOnly />
                    </div>
                  </div>

                  <div className="cinematic-input-box">
                    <label>NEW IDENTITY</label>
                    <div className="inner-input">
                      <FiMail />
                      <input
                        type="email"
                        ref={newEmailRef}
                        placeholder="ENTER NEW ADDRESS"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="action-btn-cinematic primary" disabled={loading}>
                    INITIATE CHANGE
                  </button>
                </>
              ) : (
                <div className="otp-step">
                  <label className="cinematic-label">ENTER 6-DIGIT VERIFICATION KEY</label>
                  <div className="otp-six-box">
                    {otpArray.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                  <button type="submit" className="action-btn-cinematic primary" disabled={loading || otpArray.includes("")}>
                    VERIFY & SYNC
                  </button>
                  <button type="button" className="text-btn-cinematic" onClick={() => setEmailFlow("input")}>BACK TO INPUT</button>
                </div>
              )}
            </form>
          </div>

          <div className="settings-card glass-panel highlight">
            <div className="card-header">
               <FiShield className="header-icon" />
               <div className="header-text">
                  <h3>SECURITY VAULT</h3>
                  <p>MANAGED ACCESS CREDENTIALS</p>
               </div>
            </div>
            
            <form onSubmit={handlePasswordChange} className="cinematic-form">
              {passFlow === "input" ? (
                <>
                  <div className="cinematic-input-box">
                    <label>NEW ACCESS KEY</label>
                    <div className="inner-input">
                      <FiLock />
                      <input
                        type="password"
                        ref={passwordRef}
                        placeholder="ENTER SECURE KEY"
                        required
                      />
                    </div>
                  </div>
                  <div className="cinematic-input-box">
                    <label>CONFIRM ACCESS KEY</label>
                    <div className="inner-input">
                      <FiLock />
                      <input
                        type="password"
                        ref={confirmPasswordRef}
                        placeholder="REPEAT SECURE KEY"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="action-btn-cinematic primary" disabled={loading}>
                    INITIATE HARDENING
                  </button>
                </>
              ) : (
                <div className="otp-step">
                  <label className="cinematic-label">ENTER 6-DIGIT AUTHORIZATION KEY</label>
                  <div className="otp-six-box">
                    {otpArray.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                  <button type="submit" className="action-btn-cinematic primary" disabled={loading || otpArray.includes("")}>
                    VERIFY & HARDEN
                  </button>
                  <button type="button" className="text-btn-cinematic" onClick={() => setPassFlow("input")}>BACK TO INPUT</button>
                </div>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
