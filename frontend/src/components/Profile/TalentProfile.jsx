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
    <div className="talent-profile-page">
      <button className="global-back-btn" onClick={() => navigate("/talentstories")}>
        <FiArrowLeft /> Back to Stories
      </button>
      <div className="talent-profile-container">
        <div className="talent-profile-left">
          <img src={getFullUrl(talent.thumbnail)} alt={talent.name} />
        </div>

        <div className="talent-profile-right">
          <div className="talent-header-row">
            <div>
              <h4>{talent.talent}</h4>
              <h1>{talent.name}</h1>
            </div>
            {(!user || user.id !== talent.user) && (
              <button 
                className={`follow-btn-premium ${isFollowing ? 'following' : 'not-following'}`} 
                onClick={handleToggleFollow}
                disabled={followLoading}
              >
                {isFollowing ? <><FiCheck /> Following</> : <><FiUserPlus /> Follow</>}
              </button>
            )}
          </div>
          
          <div className="talent-stats-row">
            <div className="stat-pill">
              <span className="stat-value">{talent.followers_count || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-pill">
              <span className="stat-value">{talent.following_count || 0}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-pill">
              <span className="stat-value">{talent.uploaded_count || 0}</span>
              <span className="stat-label">Uploaded</span>
            </div>
          </div>

          <div className="talent-location">
            <FiMapPin /> {talent.state}, {talent.country}
          </div>

          <div className="talent-quotation">
            "{talent.quotation}"
          </div>

          {talent.user_bio && (
            <div className="talent-bio-short">
              <h3>Professional Bio</h3>
              <p>{talent.user_bio}</p>
            </div>
          )}

          <div className="talent-story">
            <h3>About the Journey</h3>
            <p>{talent.story_about_person}</p>
            <p>{talent.desc_of_talent}</p>
          </div>
        </div>
      </div>

      <div className="talent-video-section">
        <h2>Watch the Performance</h2>
        <div className="main-video-preview" onClick={() => handlePlayVideo(talent.id)}>
          <div className="video-thumbnail-container">
            <img 
              src={getFullUrl(talent.thumbnail)} 
              className="talent-main-video-poster" 
              alt="Video Poster"
            />
            <div className="play-overlay">
              <FiPlay className="play-btn-large" />
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
