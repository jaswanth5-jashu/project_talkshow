import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FiPlay, FiMapPin, FiCalendar, FiActivity, FiArrowLeft, FiSearch } from "react-icons/fi";
import { getGuestById, getEpisodes } from "../../api/guestapi";
import { searchGuests } from "../../api/talentstoriesapi";
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
  
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getGuestById(id),
      getEpisodes()
    ]).then(([guestData, allEpisodes]) => {
      setGuest(guestData);
      
      // Filter episodes by guest ID

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
    navigate(`/play/ep_${episodeId}`);
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${getMediaBase()}${path}`;
  };

  return (
    <div className="profile-page">
      <div className="profile-header-actions">
        <button className="global-back-btn" onClick={() => navigate("/guests")}>
          <FiArrowLeft /> Back to Guests
        </button>

        <div className="profile-search-container" ref={searchRef}>
          <div className="profile-search-bar">
             <FiSearch className="search_icon" />
             <input 
               type="text" 
               placeholder="Search other legends..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
             />
             {isSearching && <div className="search-loader"></div>}
          </div>

          {showSearchResults && (
            <div className="profile-search-results">
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <div 
                    key={result.id} 
                    className="guest-result-item"
                    onClick={() => handleResultClick(result.id)}
                  >
                    <div className="result-avatar">
                      <img src={getFullUrl(result.profile)} alt={result.name} />
                    </div>
                    <div className="result-info">
                      <div className="result-top">
                        <span className="result-name">{result.name}</span>
                        {result.is_new && <span className="result-id">NEW</span>}
                      </div>
                      <div className="result-meta">
                        <span className="result-designation">{result.designation}</span>
                      </div>
                      {result.bio && (
                        <p className="result-bio-preview">{result.bio.substring(0, 80)}...</p>
                      )}
                    </div>
                  </div>
                ))
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="search-no-results">
                   <FiSearch />
                   <div className="no-res-content">
                      <h4>No legends found for "{searchQuery}"</h4>
                      <p>Try searching for other featured guests.</p>
                   </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <div className="profile-container">
        
        <div className="profile-left">
          <img src={getFullUrl(guest.profile)} alt={guest.name} />
          {guest.is_new && <div className="id-badge">NEW</div>}
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

      {showGuard && (
        <AuthGuard 
          onClose={() => setShowGuard(false)} 
          message="Unlock the full legendary experience! Please login or register to explore complete profiles and exclusive highlights." 
        />
      )}
    </div>
  );
}

export default GuestProfile;