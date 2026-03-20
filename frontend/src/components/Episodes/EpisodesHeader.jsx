import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import { searchEpisodes } from "../../api/talentstoriesapi";
import { getMediaBase } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../Common/AuthGuard";
import { useNavigate } from "react-router-dom";
import "../../css/components/episodes/EpisodesHeader.css";

function EpisodesHeader({ search, setSearch, episodes }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState(search || "");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showGuard, setShowGuard] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const data = await searchEpisodes(searchQuery);
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

  const handleResultClick = (result) => {
    if (!isAuthenticated) {
      setShowGuard(true);
      return;
    }
    setShowSearchResults(false);
    setSearchQuery("");
    setSearch(result.name);
    navigate(`/play/ep_${result.id}`);
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
    if (!path) return "/default-thumbnail.png";
    if (path.startsWith("http")) return path;
    return getMediaBase() + path;
  };

  return (
    <div className="episodes_head">
      <div className="episodes_container">
        <span className="episodes_tag">EXCLUSIVE CONTENT</span>
        <h1 className="episodes_title">
          Talk Show <span>Episodes</span>
        </h1>
        <p className="episodes_desc">
          Watch inspiring conversations and powerful stories from our incredible guests.
        </p>

        <div className="episodes_search" ref={searchRef}>
          <FiSearch className="search_icon" />
          <input 
            type="text" 
            placeholder="Search for episodes or guests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
          />
          {isSearching && <div className="search-loader"></div>}

          {showSearchResults && (
            <div className="episodes-search-results">
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <div 
                    key={result.id} 
                    className="episode-result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="result-thumb">
                      <img src={getImageUrl(result.thumbnail)} alt={result.name} />
                    </div>
                    <div className="result-info">
                      <div className="result-top">
                        <span className="result-name">{result.name}</span>
                        {result.is_new && <span className="result-id">NEW</span>}
                      </div>
                      <div className="result-meta">
                        <span className="result-guest">with {result.guest_name}</span>
                      </div>
                      {result.bio && (
                        <p className="result-bio-preview">{result.bio.substring(0, 100)}...</p>
                      )}
                    </div>
                  </div>
                ))
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="search-no-results">
                   <FiSearch />
                   <div className="no-res-content">
                      <h4>No episodes found for "{searchQuery}"</h4>
                      <p>Try searching for guest names or different keywords.</p>
                   </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {showGuard && (
        <AuthGuard 
          onClose={() => setShowGuard(false)} 
          message="Experience the full performance! Please login or register to watch complete episodes and exclusive uncut footage." 
        />
      )}
    </div>
  );
}

export default EpisodesHeader;