import "../../css/components/Talent_Stories/Talentstorieshead.css";
import { FiSearch } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { searchTalents } from "../../api/talentstoriesapi";
import { getMediaBase } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../Common/AuthGuard";
import { useNavigate } from "react-router-dom";

function Talentstorieshead({ search, setSearch }) {
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
          const data = await searchTalents(searchQuery);
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
    setSearch(result.talent_name);
    navigate(`/play/talent_${result.id}`);
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
    <section className="talentstories_head">
      <div className="talentstories_container">
        <span className="talentstories_tag">DISCOVER</span>
        <h1 className="talentstories_title">
          EXPLORE <span>TALENTS</span>
        </h1>
        <p className="talentstories_desc">
          Browse through the incredible stories of individuals making a difference.
        </p>

        <div className="talentstories_search" ref={searchRef}>
          <FiSearch className="search_icon" />

          <input
            type="text"
            placeholder="Search talents by name, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
          />
          {isSearching && <div className="search-loader"></div>}

          {showSearchResults && (
            <div className="talent-search-results">
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <div 
                    key={result.id} 
                    className="talent-result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="result-thumb">
                      <img src={getImageUrl(result.thumbnail)} alt={result.talent_name} />
                    </div>
                    <div className="result-info">
                      <div className="result-top">
                        <span className="result-name">{result.talent_name}</span>
                        {result.is_new && <span className="result-id">NEW</span>}
                      </div>
                      <div className="result-meta">
                        <span className="result-creator">by {result.creator}</span>
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
                      <h4>No talent stories found for "{searchQuery}"</h4>
                      <p>Try searching for categories, creators or keywords.</p>
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
          message="Witness the dawn of new legends! Please login or register to watch the full talent journey." 
        />
      )}
    </section>
  );
}

export default Talentstorieshead;
