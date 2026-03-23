import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FiPlay, FiMapPin, FiCalendar, FiActivity, FiArrowLeft, FiSearch, FiUserPlus, FiCheck, FiHeart } from "react-icons/fi";
import { getGuestById, getEpisodes } from "../../api/guestapi";
import { searchGuests, toggleSubscribe, toggleLike } from "../../api/talentstoriesapi";
import { getMediaBase } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../Common/AuthGuard";
import "../../css/components/Profile/GuestProfile.css";

function GuestProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guest, setGuest] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showGuard, setShowGuard] = useState(false);
  const { isAuthenticated } = useAuth();
  const searchRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const data = await searchGuests(searchQuery);
          setSearchResults(data);
          setShowSearchResults(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (resultId) => {
    if (!isAuthenticated) {
      setShowGuard(true);
      return;
    }
    setShowSearchResults(false);
    setSearchQuery("");
    navigate(`/guest/${resultId}`);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getGuestById(id),
      getEpisodes()
    ]).then(([guestData, allEpisodes]) => {
      setGuest(guestData);
      setIsFollowing(guestData.is_following || false);
      
      const guestEpisodes = allEpisodes.filter(ep => ep.guest === parseInt(id));
      setEpisodes(guestEpisodes);
      
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching guest details and episodes:", err);
      setLoading(false);
    });
  }, [id]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      setShowGuard(true);
      return;
    }
    if (!guest?.user) return; // Need a linked user to follow
    setFollowLoading(true);
    try {
      const res = await toggleSubscribe(guest.user);
      setIsFollowing(res.subscribed);
      // Update local guest object count if needed, or just let it be
      setGuest(prev => ({
        ...prev,
        followers_count: res.subscribed ? (prev.followers_count + 1) : Math.max(0, prev.followers_count - 1)
      }));
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const [selectedPromo, setSelectedPromo] = useState(null);

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

  const handleVideoClick = (episode) => {
    setSelectedPromo(episode);
  };

  const handleWatchFull = (episodeId) => {
    navigate(`/play/ep_${episodeId}`);
    setSelectedPromo(null);
  };

  const handleToggleLike = async (episode) => {
    if (!isAuthenticated) {
      setShowGuard(true);
      return;
    }
    try {
      const res = await toggleLike(episode.id, true);
      setEpisodes(prev => prev.map(ep => 
        ep.id === episode.id ? { ...ep, is_liked: res.liked, likes_count: res.count } : ep
      ));
      if (selectedPromo?.id === episode.id) {
        setSelectedPromo(prev => ({ ...prev, is_liked: res.liked, likes_count: res.count }));
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${getMediaBase()}${path}`;
  };

  return (
    <div className="talent-profile-page white-theme">
      <div className="talent-profile-top-nav">
        <button className="minimal-back-btn-light" onClick={() => navigate("/guests")}>
           <FiArrowLeft /> BACK TO LEGENDS
        </button>
      </div>

      <div className="talent-profile-hero-card">
        <div className="talent-hero-image-showcase">
          <div className="collage-base small-dp">
             <img src={getFullUrl(guest.profile)} alt={guest.name} className="main-talent-image" />
             {guest.is_new && (
               <div className="floating-card-mini img-2">NEW</div>
             )}
          </div>
        </div>

        <div className="talent-hero-info">
          <span className="talent-category-tag">FEATURED LEGEND</span>
          <h1 className="talent-name-primary">{guest.name}</h1>
          
          <div className="talent-hero-actions">
            <button 
              className={`follow-btn-classical-red ${isFollowing ? 'active' : ''}`} 
              onClick={handleToggleFollow}
              disabled={followLoading || !guest.user}
            >
              {isFollowing ? <FiCheck /> : <FiUserPlus />}
              <span>{isFollowing ? 'FOLLOWING' : 'FOLLOW'}</span>
            </button>
          </div>

          <div className="talent-stats-classical">
            <div className="stat-unit">
              <span className="stat-num">{guest.followers_count || 0}</span>
              <span className="stat-lab">FOLLOWERS</span>
            </div>
            <div className="stat-unit">
              <span className="stat-num">{guest.uploaded_count || 0}</span>
              <span className="stat-lab">EPISODES</span>
            </div>
          </div>

          <div className="talent-meta-classical">
            <div className="meta-item">
              <FiActivity /> <span>{guest.designation}</span>
            </div>
          </div>

          <div className="talent-quote-classical">
            <div className="quote-bar"></div>
            <p>"{guest.reason}"</p>
          </div>
        </div>
      </div>

      <div className="talent-journey-classical">
        <h3>Biography</h3>
        <p>{guest.bio}</p>
      </div>

      <div className="talent-content-divider"></div>

      <div className="talent-video-section">
        <h2>Episode Highlights</h2>
        <div className="performance-grid-small">
          {episodes.map((episode) => (
            <div key={episode.id} className="mini-video-card" onClick={() => handleVideoClick(episode)}>
              <div className="mini-thumbnail-box">
                <img src={getFullUrl(episode.thumbnail)} alt={episode.name} />
                <div className="mini-play-btn">
                  <FiPlay />
                </div>
              </div>
              <div className="mini-video-info">
                <h4>{episode.name}</h4>
                <span>EPISODE #{episode.id}</span>
              </div>
            </div>
          ))}
        </div>
        {episodes.length === 0 && (
          <div className="no-videos-box">
            <p>No highlights available yet.</p>
          </div>
        )}
      </div>

      {showGuard && (
        <AuthGuard 
          onClose={() => setShowGuard(false)} 
          message="Unlock the full experience! Please login or register to follow legends." 
        />
      )}

      {selectedPromo && (
        <div className="promo-overlay-modal" onClick={() => setSelectedPromo(null)}>
          <div className="promo-modal-content" onClick={(e) => e.stopPropagation()}>
             <button className="promo-close-btn" onClick={() => setSelectedPromo(null)}>×</button>
             
             <div className="promo-video-container">
                <video 
                  src={getFullUrl(selectedPromo.promo_video)} 
                  controls 
                  autoPlay 
                  className="promo-video-player"
                />
             </div>

             <div className="promo-details">
                <div className="promo-title-row">
                   <h3>{selectedPromo.name}</h3>
                   <div className="promo-like-section">
                      <button 
                        className={`promo-like-btn ${selectedPromo.is_liked ? 'liked' : ''}`}
                        onClick={() => handleToggleLike(selectedPromo)}
                      >
                        <FiHeart />
                      </button>
                      <span className="promo-likes-count">{selectedPromo.likes_count || 0} LIKES</span>
                   </div>
                </div>
                <p>Previewing official promo of the highlight.</p>
                
                <div className="promo-modal-actions">
                   <button className="watch-full-btn-premium" onClick={() => handleWatchFull(selectedPromo.id)}>
                      <FiPlay /> WATCH FULL EPISODE
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuestProfile;