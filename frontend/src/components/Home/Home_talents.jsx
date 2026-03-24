import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/components/Home/Home_talents.css";
import { getNewTalents } from "../../api/talentstoriesapi";
import { getMediaBase } from "../../api/api";

function Home_talents() {
  const [talents, setTalents] = useState([]);
  const navigate = useNavigate();

  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png";
    if (path.startsWith("http")) return path;
    return getMediaBase() + path;
  };

  useEffect(() => {
    getNewTalents().then((data) => {
      setTalents(data);
    });
  }, []);

  if (talents.length === 0) return null;

  return (
    <section className="talents-section">
      <div className="talents-container">
        <div className="talents-header">
          <div className="header-left">
            <span className="talents-tag">EXPLORE</span>
            <h2>New <span>Talents</span></h2>
          </div>
          <button className="view-all-btn" onClick={() => navigate("/Talentstories")}>
            View All Stories
          </button>
        </div>

        <div className="talents-grid">
          {talents.map((talent) => (
            <div
              key={talent.id}
              className="talent-card"
              onClick={() => navigate(`/Talentstories`)}
            >
              <div className="talent-thumb">
                {talent.is_new && <span className="new-badge">NEW</span>}
                <img src={getImageUrl(talent.thumbnail)} alt={talent.name} />
              </div>
              <div className="talent-info">
                <h3>{talent.talent}</h3>
                <p>By <span>{talent.uploader_full_name || talent.uploader_username}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home_talents;
