import { useState, useEffect } from "react";
import { getFeedbacks } from "../../api/feedbackapi";
import "../../css/components/Home/Home_review.css";

function Home_review() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    getFeedbacks().then(data => setFeedbacks(data));
  }, []);

  return (
    <section className="testimonial">
      <div className="testimonial-heading">
        <span>VOICES</span>
        <h1>WHAT PEOPLE SAY</h1>
      </div>

      <div className="testimonial-container">
        {feedbacks.map((item) => (
          <div key={item.id} className="testimonial-card">
            <div className="testimonial-quote">“</div>
            <p className="testimonial-text">{item.feedback}</p>
            <div className="testimonial-user">
              <div className="testimonial-icon">{item.name[0]}</div>
              <div>
                <h4>{item.name}</h4>
                <span>Verified Viewer</span>
              </div>
            </div>
          </div>
        ))}
        {feedbacks.length === 0 && (
          <p className="empty-feedback-msg">No feedback yet. Be the first!</p>
        )}
      </div>
    </section>
  );
}

export default Home_review;