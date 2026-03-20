import { useState, useEffect } from "react";
import getApiBase from "../../api/api";
import { getFeedbacks, submitFeedback } from "../../api/feedbackapi";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../Common/AuthGuard";
import "../../css/components/Feedback/Feedback.css";

function Feedback_main() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGuard, setShowGuard] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (user) {
      setName(user.full_name || user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone_number || "");
    }
  }, [user]);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const data = await getFeedbacks();
      setFeedbackList(data);
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
        setShowGuard(true);
        return;
    }
    setLoading(true);
    try {
      const res = await submitFeedback({
        name,
        email,
        phone_number: phone,
        feedback
      });
      if (!res.error) {
        setFeedback("");
        fetchFeedbacks();
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 5000); // Hide after 5 seconds
      }
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
    setLoading(false);
  };

  return (
    <div className="feedback-page">
      <div className="feedback-hero">
        <h1>Your Voice Matters</h1>
        <p>Help us improve by sharing your thoughts</p>
      </div>

      <div className="feedback-container">
        {/* FORM */}
        <div className="feedback-form-card">
          <h2>Share Your Feedback</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-row">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={isAuthenticated}
                required
              />
            </div>
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <textarea
              placeholder="Your Message..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Send Feedback"}
            </button>
            {submitSuccess && (
              <p className="feedback-success-msg">
                Feedback submitted! An admin needs to approve it before it is visible.
              </p>
            )}
          </form>
        </div>

        {/* LIST */}
        <div className="feedback-showcase">
          <h2>Recent Feedbacks</h2>
          <div className="feedback-grid">
            {feedbackList.map((item) => (
              <div key={item.id} className="modern-feedback-card">
                <div className="user-info">
                  <div className="avatar">{item.name[0]}</div>
                  <h3>{item.name}</h3>
                </div>
                <p>{item.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showGuard && (
        <AuthGuard 
          onClose={() => setShowGuard(false)} 
          message="Your voice matters to the community! Please login or register to share your feedback with us." 
        />
      )}
    </div>
  );
}

export default Feedback_main;