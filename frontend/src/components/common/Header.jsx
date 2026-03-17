import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMediaBase } from "../../api/api";
import "../../css/components/common/Header.css";

function Header() {
  const { user, isAuthenticated } = useAuth();

  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png";
    if (path.startsWith("http")) return path;
    return getMediaBase() + path;
  };

  return (
    <header className="header">

      <NavLink to="/" className="logo">
        TalkShow
      </NavLink>

      <nav className="menu">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/Talentstories">Talent Stories</NavLink>
        <NavLink to="/GuestProfile">Guest Profile</NavLink>
        <NavLink to="/Episodes">Episodes</NavLink>
        <NavLink to="/Feedback">Feedback</NavLink>
        <NavLink to="/Contacts">Contact</NavLink>
      </nav>

      <div className="right-buttons">
        <NavLink to="/showyourtalent" className="talent-btn">
          Show Your Talent
        </NavLink>

        {isAuthenticated ? (
          <NavLink to="/profile" className="header-profile-circle">
            <img src={getImageUrl(user?.profile)} alt="Profile" />
          </NavLink>
        ) : (
          <NavLink to="/Login" className="login-btn">
            Login
          </NavLink>
        )}
      </div>

    </header>
  );
}

export default Header;