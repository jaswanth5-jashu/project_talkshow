import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMediaBase } from "../../api/api";
import { getNotifications, markNotificationRead } from "../../api/talentstoriesapi";
import { FiBell, FiHeart, FiMessageSquare, FiUserPlus } from "react-icons/fi";
import "../../css/components/common/Header.css";
import { useEffect, useState } from "react";

function Header() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      // Poll every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadNotifications = () => {
    getNotifications().then(data => setNotifications(data)).catch(console.error);
  };

  const handleMarkRead = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    markNotificationRead(id).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png";
    if (path.startsWith("http")) return path;
    return getMediaBase() + path;
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'like': return <FiHeart fill="#ff4d4d" color="#ff4d4d" />;
      case 'comment': return <FiMessageSquare color="#00d1ff" />;
      case 'follow': return <FiUserPlus color="#ff0000" />;
      default: return <FiBell />;
    }
  };

  return (
    <header className="header">

      <NavLink to="/" className="logo">
        TalkShow
      </NavLink>

      <nav className="menu">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/Talentstories">Talent Stories</NavLink>
        <NavLink to="/guests">Guest Profile</NavLink>
        <NavLink to="/Episodes">Episodes</NavLink>
        <NavLink to="/Feedback">Feedback</NavLink>
        <NavLink to="/Contacts">Contact</NavLink>
      </nav>

      <div className="right-buttons">
        <NavLink to="/showyourtalent" className="talent-btn">
          Show Your Talent
        </NavLink>

        {isAuthenticated ? (
          <>
            <div className="notification-wrapper">
              <button className="notif-btn" onClick={() => setShowNotifs(!showNotifs)}>
                <FiBell />
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
              </button>
              
              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <h3>Notifications</h3>
                    <span>{unreadCount} Unread</span>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 10).map(notif => (
                        <div key={notif.id} className={`notif-item ${notif.is_read ? 'read' : 'unread'}`}>
                          <Link to={`/user/${notif.sender}`} className="notif-icon" onClick={() => setShowNotifs(false)}>
                            {renderIcon(notif.notification_type)}
                          </Link>
                          <div className="notif-content">
                            <Link to={`/user/${notif.sender}`} className="notif-link" onClick={() => setShowNotifs(false)}>
                              <p>{notif.text}</p>
                            </Link>
                            <span className="notif-time">{new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          {!notif.is_read && (
                            <button className="mark-read-dot" onClick={(e) => handleMarkRead(e, notif.id)} title="Mark as read"></button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/profile" className="header-profile-circle">
              <img src={getImageUrl(user?.profile)} alt="Profile" />
            </NavLink>
          </>
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