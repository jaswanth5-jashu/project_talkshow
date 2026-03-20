import "../../css/components/Profile/GuestsHeader.css";
import { FiSearch } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { searchGuests } from "../../api/talentstoriesapi";
import { getMediaBase } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../Common/AuthGuard";
import { useNavigate } from "react-router-dom";

function GuestsHeader({ search, setSearch, guests }) {
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

  const handleResultClick = (result) => {
    if (!isAuthenticated) {
      setShowGuard(true);
      return;
    }
    setShowSearchResults(false);
    setSearchQuery("");
    setSearch(result.name);
    navigate(`/guest/${result.id}`);
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

  return (
    <section className="guests_head">
      <div className="guests_head_container">
        <span className="guests_tag">LEGENDS</span>
        <h1 className="guests_title">
          FEATURED <span>GUESTS</span>
        </h1>
        <p className="guests_desc">
          Meet the extraordinary minds and personalities who have graced our platform.
        </p>

        <div className="guests_search" ref={searchRef}>
          <FiSearch className="search_icon" />

          <input
            type="text"
            placeholder="Search guests by name, designation, or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
          />
          {isSearching && <div className="search-loader"></div>}

          {showSearchResults && (
            <div className="guests-search-results">
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <div 
                    key={result.id} 
                    className="guest-result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="result-avatar">
                      <img src={getImageUrl(result.profile)} alt={result.name} />
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
                        <p className="result-bio-preview">{result.bio.substring(0, 100)}...</p>
                      )}
                    </div>
                  </div>
                ))
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="search-no-results">
                   <FiSearch />
                   <div className="no-res-content">
                      <h4>No legends found for "{searchQuery}"</h4>
                      <p>Try searching for names, designations or areas of expertise.</p>
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
          message="Unlock the wisdom of legends! Please login or register to explore full guest profiles." 
        />
      )}
    </section>
  );
}

export default GuestsHeader;
