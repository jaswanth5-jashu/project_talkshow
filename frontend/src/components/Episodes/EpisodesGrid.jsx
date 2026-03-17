import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { FiX, FiPlay } from "react-icons/fi";
import { getEpisodes } from "../../api/guestapi";
import { getMediaBase } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../Common/AuthGuard";
import "../../css/components/episodes/EpisodesGrid.css";
import "../../css/components/episodes/EpisodeOverlay.css";

function EpisodesGrid() {
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showGuard, setShowGuard] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const videoRef = useRef(null);

  useEffect(() => {
    getEpisodes().then((data) => setEpisodes(data));
  }, []);

  const handleEpisodeClick = (episode) => {
    setSelectedEpisode(episode);
    setShowOverlay(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setSelectedEpisode(null);
  };

  const navigateToFull = () => {
    if (!isAuthenticated) {
        setShowGuard(true);
        return;
    }
    navigate(`/play/ep_${selectedEpisode.id}`);
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return getMediaBase() + path;
  };

  return (
    <div className="episodes-grid">
      {episodes.map((episode, index) => (
        <div 
          key={episode.id} 
          className="episode-card animate-card-in" 
          onClick={() => handleEpisodeClick(episode)}
          style={{ cursor: 'pointer', animationDelay: `${index * 0.16}s` }}
        >
          <div className="episode-image">
            <img src={episode.thumbnail || episode.guest_image} alt={episode.name} />
            <div className="episode-poster-overlay">
               <div className="episode-content">
                  <span className="episode-date">
                    {new Date(episode.upload_datetime).toDateString()}
                  </span>
                  <h3 className="episode-name">{episode.name}</h3>
                  <div className="card-spacer"></div>
                  <p className="episode-bio">{episode.bio?.substring(0, 80)}...</p>
               </div>
               <div className="poster-play-btn">
                  <FiPlay />
               </div>
            </div>
          </div>
        </div>
      ))}

      {showOverlay && selectedEpisode && ReactDOM.createPortal(
        <div className="episode-overlay" onClick={closeOverlay}>
          <div className="overlay-vignette"></div>
          
          <div className="cinematic-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-overlay-cinematic" onClick={closeOverlay}>
              <FiX />
            </button>

            <div className="main-stage">
              <div className="promo-player-wrapper">
                <video 
                  ref={videoRef}
                  src={getFullUrl(selectedEpisode.promo_video)} 
                  autoPlay 
                  controls 
                  className="promo-video-main"
                />
              </div>

              <div className="side-metadata">
                <div className="meta-glass-card">
                  <span className="meta-label">EXCLUSIVE PROMO</span>
                  <h2 className="meta-title">{selectedEpisode.name}</h2>
                  <div className="meta-divider"></div>
                  
                  <div className="meta-details">
                    <div className="detail-item">
                      <label>PREMIERED</label>
                      <span>{new Date(selectedEpisode.upload_datetime).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="detail-item">
                      <label>EPISODE</label>
                      <span>VOL. 0{selectedEpisode.id}</span>
                    </div>
                  </div>

                  <p className="meta-desc">
                    {selectedEpisode.bio || "No description available for this episode."}
                  </p>

                  <button className="cinematic-watch-btn" onClick={navigateToFull}>
                    <FiPlay className="btn-icon" />
                    <span>WATCH FULL VERSION</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="cinematic-bottom-bar">
               <div className="scroll-hint">
                  <div className="mouse"></div>
                  <span>CINEMATIC PREVIEW MODE</span>
               </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showGuard && (
        <AuthGuard 
          onClose={() => setShowGuard(false)} 
          message="Enjoy the premier experience! Please login or register to watch the full performance and exclusive uncut footage." 
        />
      )}
    </div>
  );
}

export default EpisodesGrid;