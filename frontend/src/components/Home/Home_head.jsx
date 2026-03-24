import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../../css/components/Home/Home_head.css";
import { FaBolt, FaPlay, FaArrowRight } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useRef } from "react";

import getHomeStats from "../../api/headhomeapi";
import { searchUsers } from "../../api/talentstoriesapi";
import { getMediaBase } from "../../api/api";
import { getNewEpisodes } from "../../api/guestapi";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../Common/AuthGuard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

function Home_head() {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    talents: "0",
    episodes: "0",
    views: "0",
  });


  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showGuard, setShowGuard] = useState(false);
  const [newEpisodes, setNewEpisodes] = useState([]);
  const { isAuthenticated } = useAuth();
  const searchRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const data = await searchUsers(searchQuery);
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
  
  const handleResultClick = (userId) => {
    if (!isAuthenticated) {
      setShowGuard(true);
      return;
    }
    setShowSearchResults(false);
    setSearchQuery("");
    navigate(`/user/${userId}`);
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

  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png";
    if (path.startsWith("http")) return path;
    return getMediaBase() + path;
  };

  useEffect(function () {
    getHomeStats().then(function (data) {
      if (data && data.length > 0) {
        setStats({
          talents: data[0].no_of_talents,
          episodes: data[0].no_of_episodes,
          views: data[0].no_of_views,
        });
      }
    });

    getNewEpisodes().then(data => {
      setNewEpisodes(data);
    }).catch(err => console.error("Error fetching new episodes:", err));
  }, []);

  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      
      <div className="hero-container">
        <div className="hero-top-section">
          <span className="live-tag">
            <FaBolt /> LIVE PLATFORM
          </span>
          <h1 className="hero-title-inline">
            WHERE <span>TALENT</span> SHINES
          </h1>
          <p className="hero-desc">
            Discovering extraordinary skills from grassroots communities.
            Every voice matters, every story inspires.
          </p>
        </div>

        {newEpisodes.length > 0 ? (
          <div className="hero-carousel-container">
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              loop={true}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 2.5,
                slideShadows: true,
              }}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[Autoplay, EffectCoverflow, Pagination, Navigation]}
              className="mySwiper"
            >
              {newEpisodes.map((episode) => (
                <SwiperSlide key={episode.id} className="episode-slide">
                  <div className="slide-card" onClick={() => navigate(`/episodes`)}>
                    <img src={getImageUrl(episode.thumbnail)} alt={episode.name} />
                    <div className="slide-info">
                      <div className="slide-tags">
                        <span className="new-badge">NEW</span>
                        <span className="podcast-tag">PODCAST</span>
                      </div>
                      <h3>{episode.name}</h3>
                      <p>By {episode.guest_name || episode.guest?.name}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="carousel-placeholder">
            <div className="placeholder-content">
              <FaPlay className="placeholder-icon" />
              <p>More episodes coming soon, please wait...</p>
            </div>
          </div>
        )}

        <div className="hero-bottom-actions">
          <div className="hero-buttons-inline">
            <button
              className="btn-primary"
              onClick={() => navigate("/Talentstories")}
            >
              EXPLORE TALENTS <FaArrowRight />
            </button>

            <button
              className="btn-outline"
              onClick={() => navigate("/episodes")}
            >
              <FaPlay /> WATCH EPISODES
            </button>
          </div>

          <div className="hero-search-wrapper" ref={searchRef}>
             <div className="hero-search-bar">
                <FiSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search talents, episodes, guests..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                />
                {isSearching && <div className="search-loader"></div>}
              </div>

              {showSearchResults && (
                <div className="hero-search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map(result => (
                      <div 
                        key={result.id} 
                        className="search-result-item"
                        onClick={() => handleResultClick(result.id)}
                      >
                        <div className="result-avatar">
                          <img src={getImageUrl(result.profile)} alt={result.username} />
                        </div>
                        <div className="result-info">
                          <div className="result-top">
                            <span className="result-name">{result.full_name || result.username}</span>
                            <span className="result-role">{result.role}</span>
                          </div>
                          <div className="result-mid">
                            <p className="result-bio-preview">
                              {result.bio && !result.bio.includes(':') ? result.bio.substring(0, 120) : "Passionate about sharing talent and inspiring the community."}
                            </p>
                          </div>
                          <div className="result-bottom">
                            <span className="result-videos">{result.video_count} Videos</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : searchQuery.length >= 2 && !isSearching ? (
                    <div className="search-no-results">
                       <FiSearch />
                       <div className="no-res-content">
                          <h4>No members found for "{searchQuery}"</h4>
                          <p>Try searching for another name, username or talent.</p>
                       </div>
                    </div>
                  ) : null}
                </div>
              )}
          </div>

          <div className="hero-stats-row">
            <div className="stat-item">
              <h2>{stats.talents}+</h2>
              <p>TALENTS</p>
            </div>
            <div className="stat-item">
              <h2>{stats.episodes}+</h2>
              <p>EPISODES</p>
            </div>
            <div className="stat-item">
              <h2>{stats.views}+</h2>
              <p>VIEWERS</p>
            </div>
          </div>
        </div>
      </div>

      {showGuard && (
        <AuthGuard 
          onClose={() => setShowGuard(false)} 
          message="Join the inner circle of talent! Please login or register to view full profiles and exclusive content." 
        />
      )}
    </section>
  );
}

export default Home_head;