import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiMapPin, FiPlay, FiArrowLeft, FiUserPlus, FiCheck } from "react-icons/fi";
import getTalentStories, { getTalentById, toggleSubscribe } from "../../api/talentstoriesapi";
import { useAuth } from "../../context/AuthContext";
import { getMediaBase } from "../../api/api";
import "../../css/components/Profile/TalentProfile.css";

function TalentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [talent, setTalent] = useState(null);
  const [relatedTalents, setRelatedTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch current talent
    getTalentById(id)
      .then((data) => {
        setTalent(data);
        setIsFollowing(data.is_following);
        // Fetch all talents for related stories section
        return getTalentStories();
      })
      .then((allTalents) => {
        // Filter out the current talent from related
        const related = allTalents.filter((t) => t.id !== parseInt(id));
        setRelatedTalents(related.slice(0, 4)); // Show top 4 related
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching talent details:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading talent story...</p>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="talent-profile-page">
        <h2>Talent not found</h2>
        <button onClick={() => navigate("/talentstories")}>Go Back</button>
      </div>
    );
  }

  const handleRelatedClick = (relatedId) => {
    navigate(`/talent/${relatedId}`);
    window.scrollTo(0, 0);
  };

  const handlePlayVideo = (videoIdOrUrl) => {
    navigate(`/play/${id}`); 
  };

  const handleToggleFollow = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.id === talent.user) return;

    setFollowLoading(true);
    toggleSubscribe(talent.user)
      .then((res) => {
        setIsFollowing(res.subscribed);
        setFollowLoading(false);
      })
      .catch((err) => {
        console.error("Error toggling follow:", err);
        setFollowLoading(false);
      });
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${getMediaBase()}${path}`;
  };

  return (
    <div className="talent-profile-page white-theme">
      <div className="talent-profile-top-nav">
        <button className="minimal-back-btn-light" onClick={() => navigate("/talentstories")}>
          <FiArrowLeft /> <span>EXIT PROFILE</span>
        </button>
      </div>

      <div className="talent-profile-hero-card">
        <div className="talent-hero-image-showcase">
          <div className="collage-base small-dp">
            <img src={getFullUrl(talent.thumbnail)} alt={talent.name} className="main-talent-image" />
            <div className="floating-card-mini img-1">
               <img src={getFullUrl(talent.thumbnail)} alt="detail" />
            </div>
          </div>
        </div>

        <div className="talent-hero-info">
          <div className="talent-category-tag">{talent.talent}</div>
          <h1 className="talent-name-primary">{talent.name}</h1>
          
          <div className="talent-hero-actions">
            {(!user || parseInt(user.id) !== parseInt(talent.user)) ? (
              <button 
                className={`follow-btn-classical-red ${isFollowing ? 'active' : ''}`} 
                onClick={handleToggleFollow}
                disabled={followLoading}
              >
                {isFollowing ? <FiCheck /> : <FiUserPlus />}
                <span>{isFollowing ? 'FOLLOWING' : 'FOLLOW'}</span>
              </button>
            ) : (
              <button className="follow-btn-classical-outline" onClick={() => navigate('/profile')}>
                <span>EDIT PROFILE</span>
              </button>
            )}
          </div>

          <div className="talent-stats-classical">
            <div className="stat-unit">
              <span className="stat-num">{talent.followers_count || 0}</span>
              <span className="stat-lab">FOLLOWERS</span>
            </div>
            <div className="stat-unit">
              <span className="stat-num">{talent.following_count || 0}</span>
              <span className="stat-lab">FOLLOWING</span>
            </div>
            <div className="stat-unit">
              <span className="stat-num">{talent.uploaded_count || 0}</span>
              <span className="stat-lab">UPLOADED</span>
            </div>
          </div>

          <div className="talent-meta-classical">
            <div className="meta-item">
              <FiMapPin /> <span>{talent.state}, {talent.country}</span>
            </div>
          </div>

          <div className="talent-quote-classical">
            <div className="quote-bar"></div>
            <p>"{talent.quotation}"</p>
          </div>

          {talent.user_bio && (
            <div className="talent-journey-classical">
              <h3>Professional Bio</h3>
              <p>{talent.user_bio}</p>
            </div>
          )}

          <div className="talent-journey-classical">
            <h3>About the Journey</h3>
            <p>{talent.story_about_person}</p>
            {talent.desc_of_talent && <p className="journey-extra">{talent.desc_of_talent}</p>}
          </div>
        </div>
      </div>

      <div className="talent-content-divider"></div>

      <div className="talent-video-section">
        <h2>Watch the Performance</h2>
        <div className="performance-grid-small">
          <div className="mini-video-card" onClick={() => handlePlayVideo(talent.id)}>
            <div className="mini-thumbnail-box">
              <img src={getFullUrl(talent.thumbnail)} alt="Performance" />
              <div className="mini-play-btn"><FiPlay /></div>
            </div>
            <div className="mini-video-info">
              <h4>Official Performance</h4>
              <span>{talent.talent}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="related-talents-section">
        <h2>Discover More Stories</h2>
        <div className="talentstories_grid">
          {relatedTalents.map((related) => (
            <div 
              key={related.id} 
              className="talent_card"
              onClick={() => handleRelatedClick(related.id)}
            >
              <div className="talent_image">
                <img src={getFullUrl(related.thumbnail)} alt={related.name} />
                <div className="talent_overlay">
                  <div className="play_icon_center">
                    <FiPlay />
                  </div>
                  <span className="talent_category">{related.talent}</span>
                  <h3>{related.name}</h3>
                  <div className="talent_location">
                    <FiMapPin /> {related.state}, {related.country}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TalentProfile;
