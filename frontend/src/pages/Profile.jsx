import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiPhone, FiCamera, FiCheckCircle, FiAlertCircle, FiSettings, FiLogOut, FiShield, FiHeart, FiMessageSquare, FiPlay, FiTrash2 } from "react-icons/fi";
import { updateProfileAPI, getProfileAPI } from "../api/profileapi";
import { getUserVideos, getMySubmissions, dismissSubmission, deleteTalent, deleteSubmission } from "../api/talentstoriesapi";
import { useAuth } from "../context/AuthContext";
import { getMediaBase } from "../api/api";
import FollowListModal from "../components/Profile/FollowListModal";
import "../css/components/Profile/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { user, login, logout, updateUser } = useAuth();

  const fullNameRef = useRef(null);
  const bioRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const newEmailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);


  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    full_name: user?.full_name || "",
    bio: user?.bio || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    followers_count: 0,
    following_count: 0,
    uploaded_count: 0,
    last_name_change: user?.last_name_change || null,
    last_bio_change: user?.last_bio_change || null,
    created_at: user?.created_at || null
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [userVideos, setUserVideos] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);

  const [emailFlow, setEmailFlow] = useState("input");
  const [passFlow, setPassFlow] = useState("input");
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);

  const [isEditing, setIsEditing] = useState(false);
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [showPassSection, setShowPassSection] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png";
    if (path.startsWith("http")) return path;
    return getMediaBase() + path;
  };

  const fetchProfileData = async () => {
    try {
      const data = await getProfileAPI();
      if (!data.error) {
        setProfileData({
          username: data.username,
          full_name: data.full_name,
          bio: data.bio,
          email: data.email,
          phone_number: data.phone_number,
          followers_count: data.followers_count || 0,
          following_count: data.following_count || 0,
          uploaded_count: data.uploaded_count || 0,
          last_name_change: data.last_name_change,
          last_bio_change: data.last_bio_change,
          created_at: data.created_at
        });
        setProfilePreview(getImageUrl(data.profile));
        if (data.role && data.role !== user?.role) {
            updateUser({ role: data.role });
        }
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfileData();
      getUserVideos().then(data => setUserVideos(data)).catch(() => { });
      getMySubmissions().then(data => setMySubmissions(data)).catch(() => { });
    }
  }, [user?.id, user?.username]);

  const handleDeleteVideo = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this approved talent story?")) {
      try {
        await deleteTalent(id);
        setUserVideos(prev => prev.filter(v => v.id !== id));
        const subData = await getMySubmissions();
        setMySubmissions(subData);
      } catch (err) { }
    }
  };

  const handleDeleteSubmission = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this submission? This will also remove any approved story linked to it.")) {
      try {
        await deleteSubmission(id);
        setMySubmissions(prev => prev.filter(s => s.id !== id));
        const videoData = await getUserVideos();
        setUserVideos(videoData);
      } catch (err) { }
    }
  };

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
    const fullName = fullNameRef.current.value;
    if (!fullName || fullName === profileData.full_name) return;

    setLoading(true);
    const fd = new FormData();
    fd.append("full_name", fullName);

    try {
      const res = await updateProfileAPI(fd);
      if (!res.error) {
        setProfileData(prev => ({ 
          ...prev, 
          full_name: res.full_name, 
          last_name_change: res.last_name_change 
        }));
        login({ 
          ...user, 
          full_name: res.full_name, 
          last_name_change: res.last_name_change,
          access: localStorage.getItem("talkshow_access"), 
          refresh: localStorage.getItem("talkshow_refresh") 
        });
        setMessage({ type: "success", text: "Full name updated successfully." });
      } else {
        setMessage({ type: "error", text: res.error });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Update failed." });
    }
    setLoading(false);
  };

  const handleUpdateBio = async () => {
    const bio = bioRef.current.value;
    if (bio === profileData.bio) return;

    setLoading(true);
    const fd = new FormData();
    fd.append("bio", bio);

    try {
      const res = await updateProfileAPI(fd);
      if (!res.error) {
        setProfileData(prev => ({ 
          ...prev, 
          bio: res.bio, 
          last_bio_change: res.last_bio_change 
        }));
        login({ 
          ...user, 
          bio: res.bio, 
          last_bio_change: res.last_bio_change,
          access: localStorage.getItem("talkshow_access"), 
          refresh: localStorage.getItem("talkshow_refresh") 
        });
        setMessage({ type: "success", text: "Bio synchronized." });
      } else {
        setMessage({ type: "error", text: res.error });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Bio update failed." });
    }
    setLoading(false);
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();

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

    if (passFlow === "input" && passwordRef.current.value !== confirmPasswordRef.current.value) {
      setMessage({ type: "error", text: "Password mismatch. Verify both fields match." });
      return;
    }

    setLoading(true);
    const fd = new FormData();
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
        <section className="profile-hero-section">
          <div className="profile-hero-card">
            <div className="profile-img-showcase">
              <img src={profilePreview || "/default-avatar.png"} alt="Member" className="main-profile-img" />
              <label className="cinematic-camera-trigger">
                <FiCamera />
                <input type="file" onChange={handleFileChange} hidden />
              </label>
            </div>

            <div className="hero-text">
              <h1 className="hero-name">{profileData.full_name || "MEMBER"}</h1>
              
              {profileData.bio && (
                <p className="hero-bio-prominent">{profileData.bio}</p>
              )}

              <div className="hero-stats-strip">
                <div className="stat-item clickable" onClick={() => setShowFollowModal('followers')}>
                  <span className="stat-count">{profileData.followers_count}</span>
                  <span className="stat-label">FOLLOWERS</span>
                </div>
                <div className="stat-item clickable" onClick={() => setShowFollowModal('following')}>
                  <span className="stat-count">{profileData.following_count}</span>
                  <span className="stat-label">FOLLOWING</span>
                </div>
                <div className="stat-item">
                  <span className="stat-count">{profileData.uploaded_count}</span>
                  <span className="stat-label">UPLOADED</span>
                </div>
              </div>

              <div className="hero-actions">
                <button 
                  className={`edit-toggle-btn ${isEditing ? 'active' : ''}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <FiSettings />
                  <span>{isEditing ? 'VIEW PROFILE' : 'EDIT PROFILE'}</span>
                </button>
                <button className="logout-btn-cinematic" onClick={handleLogout}>
                  <FiLogOut />
                  <span>TERMINATE</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {message.text && (
          <div className={`cinematic-status-banner ${message.type}`}>
            {message.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{message.text}</span>
          </div>
        )}

        {isEditing && (
          <div className="settings-grid-cinematic">

            <div className="settings-card glass-panel">
              <div className="card-header">
                <FiUser className="header-icon" />
                <div className="header-text">
                  <h3>ACCOUNT SETTINGS</h3>
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
                {profileData.last_name_change && (
                  <p className="restriction-notice">
                    <FiAlertCircle /> 30-day cooldown active. Name was last changed on {new Date(profileData.last_name_change).toLocaleDateString()}.
                  </p>
                )}
              </div>
            </div>

            <div className="settings-card glass-panel">
              <div className="card-header">
                <FiMessageSquare className="header-icon" />
                <div className="header-text">
                  <h3>BIO & STORY</h3>
                </div>
              </div>
              <div className="cinematic-form">
                <div className="cinematic-input-box">
                  <label>MY BIO</label>
                  <div className="inner-input textarea-box">
                    <textarea
                      ref={bioRef}
                      placeholder="DESCRIBE YOUR TALENT OR ROLE"
                      defaultValue={profileData.bio}
                      rows="3"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdateBio}
                  className="action-btn-cinematic primary"
                  disabled={loading}
                >
                  SAVE BIO
                </button>
                {profileData.last_bio_change && (
                  <p className="restriction-notice">
                    <FiAlertCircle /> 30-day cooldown active. Bio was last changed on {new Date(profileData.last_bio_change).toLocaleDateString()}.
                  </p>
                )}
              </div>
            </div>

            <div className="settings-card glass-panel wide">
               <div className="security-controls-row">
                  <button 
                    className={`security-nav-btn ${showEmailSection ? 'active' : ''}`}
                    onClick={() => {setShowEmailSection(!showEmailSection); setShowPassSection(false);}}
                  >
                    <FiMail /> CHANGE EMAIL
                  </button>
                  <button 
                    className={`security-nav-btn ${showPassSection ? 'active' : ''}`}
                    onClick={() => {setShowPassSection(!showPassSection); setShowEmailSection(false);}}
                  >
                    <FiShield /> CHANGE PASSWORD
                  </button>
               </div>
            </div>

            {showEmailSection && (
              <div className="settings-card glass-panel wide animate-in">
                <div className="card-header">
                  <FiMail className="header-icon" />
                  <div className="header-text">
                    <h3>EMAIL SETTINGS</h3>
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
            )}

            {showPassSection && (
              <div className="settings-card glass-panel wide animate-in">
                <div className="card-header">
                  <FiShield className="header-icon" />
                  <div className="header-text">
                    <h3>PASSWORD SETTINGS</h3>
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
            )}

          </div>
        )}

        {userVideos.length > 0 ? (
          <div className="user-videos-section">
            <h2 className="section-title-premium">
              <span>YOUR</span> UPLOADED VIDEOS
            </h2>
            <div className="videos-grid-cinematic">
              {userVideos.map(video => (
                <div
                  key={video.id}
                  className="video-card-cinematic"
                  onClick={() => navigate(`/talent/${video.id}`)}
                >
                  <div className="video-card-header">
                    <img src={getImageUrl(video.thumbnail)} alt={video.name} />
                    <div className="status-badge-approved">
                      APPROVED
                    </div>
                  </div>
                  <div className="video-card-body">
                    <h4>{video.name}</h4>
                    <p className="talent-tag">{video.talent}</p>
                     <div className="video-card-footer">
                      <div className="video-stats-row">
                        <span><FiHeart className="icon-heart" />{video.likes_count || 0}</span>
                        <span><FiMessageSquare className="icon-msg" />{video.comments_count || 0}</span>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteVideo(video.id, e)}
                        className="delete-video-btn"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="user-videos-section">
             <h2 className="section-title-premium">
                <span>YOUR</span> UPLOADED VIDEOS
             </h2>
             <div className="empty-videos-vault">
               <FiPlay />
               <p>You haven't uploaded any talent videos yet.</p>
               <button 
                 onClick={() => navigate('/Showyourtalent')}
                 className="upload-prompt-btn"
               >
                 UPLOAD YOUR FIRST TALENT
               </button>
             </div>
          </div>
        )}
        {mySubmissions.length > 0 && (
          <div className="user-videos-section">
            <h2 className="section-title-premium">
              <span>MY</span> SUBMISSIONS
            </h2>
            <div className="videos-grid-cinematic">
              {mySubmissions.map(sub => {
                const isPending = sub.status === 'pending';
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';
                const badgeColor = isPending ? '#f59e0b' : isApproved ? '#22c55e' : '#ef4444';
                const badgeLabel = isPending ? '⏳ PENDING REVIEW' : isApproved ? '✔ APPROVED' : '✖ REJECTED';

                const handleDismiss = async (e) => {
                  e.stopPropagation();
                  try {
                    await dismissSubmission(sub.id);
                    setMySubmissions(prev => prev.filter(s => s.id !== sub.id));
                  } catch { }
                };

                return (
                  <div
                    key={sub.id}
                    className={`submission-card ${isApproved ? 'clickable' : ''} border-${sub.status}`}
                    onClick={() => isApproved && (sub.talent_story_id ? navigate(`/talent/${sub.talent_story_id}`) : navigate('/Talentstories'))}
                  >
                    <div className="video-card-header">
                      {sub.thumbnail ? (
                        <img 
                          src={getImageUrl(sub.thumbnail)} 
                          alt={sub.name} 
                          className={isRejected ? "rejected-thumbnail" : ""} 
                        />
                      ) : (
                        <div className="no-thumbnail-placeholder">NO THUMBNAIL</div>
                      )}


                      <div className={`status-badge-pill status-${sub.status}-bg`}>
                        {badgeLabel}
                      </div>
                      <button 
                        onClick={(e) => handleDeleteSubmission(sub.id, e)}
                        className="delete-submission-btn-mini"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <div className="submission-body">
                      <h4>{sub.name}</h4>
                      <p className="talent-tag">{sub.talent}</p>
                      <p className="date-label">
                        Submitted: {new Date(sub.submission_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>

                      {isPending && (
                        <p className="status-text-info status-pending-color">⏳ Awaiting admin review...</p>
                      )}

                      {isApproved && (
                        <p className="status-text-info status-approved-color">✔ Live on Talent Stories — click to view</p>
                      )}

                      {isRejected && (
                        <div className="rejection-vault">
                          <h5>✖ Not Approved</h5>
                          {sub.rejection_reason ? (
                            <p>
                              <b>Reason:</b> {sub.rejection_reason}
                            </p>
                          ) : (
                            <p className="no-reason">No specific reason provided.</p>
                          )}
                          <button
                            onClick={handleDismiss}
                            className="dismiss-btn-red"
                          >
                            OK, GOT IT — REMOVE
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


      </div>
      
      {showFollowModal && (
        <FollowListModal 
          userId={user?.id} 
          type={showFollowModal} 
          onClose={() => setShowFollowModal(null)} 
        />
      )}
    </div>
  );
}

export default Profile;
