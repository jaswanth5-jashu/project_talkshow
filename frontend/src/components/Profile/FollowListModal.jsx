import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiUser, FiUserPlus, FiCheck } from "react-icons/fi";
import { getFollowers, getFollowing } from "../../api/profileapi";
import { toggleSubscribe } from "../../api/talentstoriesapi";
import { getMediaBase } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

function FollowListModal({ userId, type, onClose }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png";
    if (path.startsWith("http")) return path;
    return getMediaBase() + path;
  };

  useEffect(() => {
    const fetchData = type === "followers" ? getFollowers : getFollowing;
    fetchData(userId)
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId, type]);

  const handleUserClick = (targetId) => {
    onClose();
    navigate(`/user/${targetId}`);
  };

  return (
    <div className="neat-modal-overlay" onClick={onClose}>
      <div className="neat-modal-content" onClick={e => e.stopPropagation()}>
        <div className="neat-modal-header">
          <h3>{type === "followers" ? "Followers" : "Following"}</h3>
          <button className="close-modal-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="neat-modal-body">
          {loading ? (
            <div className="modal-loading">Loading users...</div>
          ) : users.length > 0 ? (
            <div className="user-list-container">
              {users.map(u => (
                <div key={u.id} className="user-list-item" onClick={() => handleUserClick(u.id)}>
                  <div className="user-list-avatar">
                    <img src={getImageUrl(u.profile)} alt={u.username} />
                  </div>
                  <div className="user-list-info">
                    <h4>{u.full_name || u.username}</h4>
                    <span className="user-list-role">{u.role_name || "Member"}</span>
                  </div>
                  <div className="user-list-action">
                     <span className="view-profile-hint">View Profile</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="modal-empty-state">
              <FiUser />
              <p>No {type} found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowListModal;
