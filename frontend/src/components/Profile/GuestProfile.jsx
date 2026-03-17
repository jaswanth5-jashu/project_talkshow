import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiPlay, FiMapPin, FiCalendar, FiActivity, FiArrowLeft } from "react-icons/fi";
import { getGuestById, getEpisodes } from "../../api/guestapi";
import { getMediaBase } from "../../api/api";
import "../../css/components/Profile/GuestProfile.css";

function GuestProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guest, setGuest] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getGuestById(id),
      getEpisodes()
    ]).then(([guestData, allEpisodes]) => {
      setGuest(guestData);
      
      // Filter episodes by guest ID
      // Backend uses 'guest' field as FK
      const guestEpisodes = allEpisodes.filter(ep => ep.guest === parseInt(id));
      setEpisodes(guestEpisodes);
      
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching guest details and episodes:", err);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading guest profile...</p>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="profile-page">
        <h2>Guest not found</h2>
        <button className="back-btn" onClick={() => navigate("/guests")}>Go Back</button>
      </div>
    );
  }

  const handleVideoClick = (episodeId) => {
    // Navigate to Play page with episode ID
    // We'll prefix with 'ep_' to help Play.jsx distinguish
    navigate(`/play/ep_${episodeId}`);
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${getMediaBase()}${path}`;
  };

  return (
    <div className="profile-page">
      <button className="global-back-btn" onClick={() => navigate("/guests")}>
        <FiArrowLeft /> Back to Guests
      </button>
      <div className="profile-container">
        
        <div className="profile-left">
          <img src={getFullUrl(guest.profile)} alt={guest.name} />
          <div className="id-badge">TS-{guest.id}X-2026</div>
        </div>

        <div className="profile-right">
          <div className="header-meta">
            <span className="tag-premium">Featured Legend</span>
            <div className="status-indicator">
              <span className="dot"></span> Verified
            </div>
          </div>

          <h1>{guest.name}</h1>
          <p className="designation">{guest.designation}</p>
          
          <div className="guest-meta-grid">
            <div className="meta-item">
              <FiActivity /> <span><strong>Reason:</strong> {guest.reason}</span>
            </div>
          </div>

          <div className="guest-bio-section">
            <h3>Biography</h3>
            <p className="guest-bio">
              {guest.bio}
            </p>
          </div>

          <div className="server-check-dashboard">
            <div className="dashboard-item">
              <FiCalendar />
              <div>
                <p className="label">Last Appearance</p>
                <p className="val">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="dashboard-item">
              <FiActivity />
              <div>
                <p className="label">Connectivity</p>
                <p className="val">Stable</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="guest-video">
        <div className="section-header">
          <h2>Episode Highlights</h2>
          <p>Watch full performances and exclusive sessions</p>
        </div>

        <div className="video-grid">
          {episodes.map((episode) => (
            <div key={episode.id} className="video-card" onClick={() => handleVideoClick(episode.id)}>
              <div className="video-thumbnail">
                <img src={getFullUrl(episode.thumbnail)} alt={episode.name} />
                <div className="play-overlay-icon">
                  <FiPlay />
                </div>
              </div>
              <div className="video-metadata">
                <h3>{episode.name}</h3>
                <p className="ep-desc">{episode.bio.substring(0, 100)}...</p>
                <div className="meta-bottom">
                   <span className="duration">Episode #{episode.id}</span>
                </div>
              </div>
            </div>
          ))}
          {episodes.length === 0 && (
            <div className="no-videos-box">
              <p>No highlights available yet for this legend.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GuestProfile;