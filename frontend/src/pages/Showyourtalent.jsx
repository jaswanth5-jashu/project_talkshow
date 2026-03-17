import { useState, useEffect } from "react";
import { FiUser, FiMapPin, FiStar, FiVideo, FiImage, FiFileText, FiSend, FiMail, FiPhone } from "react-icons/fi";
import { submitTalent } from "../api/talentstoriesapi";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/Common/AuthGuard";
import "../css/components/Showyourtalent/Showyourtalent.css";

function Showyourtalent() {
  const { user, isAuthenticated } = useAuth();
  
  const [form, setForm] = useState({
    name: user?.full_name || user?.username || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    state: "",
    country: "",
    talent: "",
    story_about_person: "",
    quotation: "",
    desc_of_talent: "",
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.full_name || user.username || "",
        email: user.email,
        phone_number: user.phone_number || ""
      }));
    }
  }, [user]);

  const [thumbnail, setThumbnail] = useState(null);
  const [talentvideo, setTalentvideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setMessage({ type: "error", text: `File "${file.name}" exceeds 100MB. Performance may be impacted.` });
    } else {
      setMessage({ type: "", text: "" });
    }

    if (e.target.name === "thumbnail") setThumbnail(file);
    if (e.target.name === "talentvideo") setTalentvideo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.keys(form).forEach(key => fd.append(key, form[key]));
    if (thumbnail) fd.append("thumbnail", thumbnail);
    if (talentvideo) fd.append("talentvideo", talentvideo);

    try {
      const res = await submitTalent(fd);
      if (!res.error) {
        setMessage({ type: "success", text: "Talent application submitted successfully!" });
        setForm(prev => ({
            ...prev,
            state: "",
            country: "",
            talent: "",
            story_about_person: "",
            quotation: "",
            desc_of_talent: "",
        }));
        setThumbnail(null);
        setTalentvideo(null);
      } else {
        setMessage({ type: "error", text: res.error || "Submission rejected by server. Check fields." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Submission failed. Please check file sizes and networking." });
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
        <div className="talent-submission-page">
            <AuthGuard 
                onClose={() => window.history.back()} 
                message="The stage is set for members! Please login or register to share your talent application and join the TalkShow family." 
            />
            <div style={{ filter: 'blur(20px)', pointerEvents: 'none' }}>
                <div className="talent-hero">
                    <h1>UNLEASH YOUR <span>STORY</span></h1>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="talent-submission-page">
      <div className="talent-hero">
        <h1>UNLEASH YOUR <span>STORY</span></h1>
        <p>Your passion deserves a stage. Join the TalkShow legacy.</p>
      </div>

      <div className="talent-form-container">
        {message.text && (
          <div className={`status-msg ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="premium-talent-form">
          <div className="form-grid">
            <div className="form-column">
              <div className="input-group">
                <label><FiUser /> Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
              </div>
              <div className="row">
                  <div className="input-group">
                    <label><FiMail /> Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} readOnly required />
                  </div>
                  <div className="input-group">
                    <label><FiPhone /> Phone</label>
                    <input type="text" name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="+1234567890" required />
                  </div>
              </div>
              <div className="row">
                  <div className="input-group">
                    <label><FiMapPin /> State</label>
                    <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="State/Province" required />
                  </div>
                  <div className="input-group">
                    <label><FiMapPin /> Country</label>
                    <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="Country" required />
                  </div>
              </div>
              <div className="input-group">
                <label><FiStar /> Talent Category</label>
                <input type="text" name="talent" value={form.talent} onChange={handleChange} placeholder="Singer, Dancer, Actor, etc." required />
              </div>
            </div>

            <div className="form-column">
              <div className="input-group">
                <label><FiFileText /> About Your Talent</label>
                <textarea name="desc_of_talent" value={form.desc_of_talent} onChange={handleChange} placeholder="Describe your talent and skills..." required />
              </div>
              <div className="input-group">
                <label><FiFileText /> Your Journey / Story</label>
                <textarea name="story_about_person" value={form.story_about_person} onChange={handleChange} placeholder="Share the story behind your talent..." required />
              </div>
            </div>
          </div>

          <div className="input-group quote-group">
                <label><FiStar /> Inspirational Quote</label>
                <input type="text" name="quotation" value={form.quotation} onChange={handleChange} placeholder="A quote you live by..." required />
          </div>

          <div className="file-upload-grid">
            <div className="file-box">
              <label>
                <FiImage /> {thumbnail ? thumbnail.name : "Upload Thumbnail"}
                <input type="file" name="thumbnail" accept="image/*" onChange={handleFileChange} hidden required />
              </label>
            </div>
            <div className="file-box">
              <label>
                <FiVideo /> {talentvideo ? talentvideo.name : "Upload Talent Video"}
                <input type="file" name="talentvideo" accept="video/*" onChange={handleFileChange} hidden required />
              </label>
            </div>
          </div>

          <button type="submit" className="talent-submit-btn" disabled={loading}>
            <FiSend /> {loading ? "SUBMITTING..." : "SUBMIT APPLICATION"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Showyourtalent;