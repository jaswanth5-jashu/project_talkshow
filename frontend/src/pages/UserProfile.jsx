import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { FiUser, FiPlay, FiHeart, FiMessageSquare, FiMapPin, FiCalendar, FiUserPlus, FiCheck } from "react-icons/fi";
import { apiClient, getMediaBase } from "../api/api";
import { toggleSubscribe, markNotificationRead } from "../api/talentstoriesapi";
import { useAuth } from "../context/AuthContext";
import FollowListModal from "../components/Profile/FollowListModal";
import "../css/components/Profile/Profile.css";

function UserProfile() {
    const { userId } = useParams();
    const location = useLocation();
    const { user: currentUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [showFollowModal, setShowFollowModal] = useState(null); 

    useEffect(() => {
        // Auto-mark notification as read if we came from one
        if (location.state?.notifId) {
            markNotificationRead(location.state.notifId).catch(console.error);
        }
    }, [location.state, userId]);
    useEffect(() => {
        setLoading(true);
        apiClient.get(`/user/${userId}/`)
            .then(res => {
                setProfileData(res.data);
                setIsFollowing(res.data.is_following);
                setFollowersCount(res.data.followers_count || 0);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
            });
    }, [userId]);

    const handleFollow = () => {
        if (!currentUser) {
            alert("Please login to follow users.");
            return;
        }
        toggleSubscribe(userId).then(res => {
            setIsFollowing(res.subscribed);
            setFollowersCount(prev => res.subscribed ? prev + 1 : prev - 1);
        }).catch(console.error);
    };

    const getImageUrl = (path) => {
        if (!path) return "/default-avatar.png";
        if (path.startsWith("http")) return path;
        return getMediaBase() + path;
    };

    if (loading) return <div className="profile-page-cinematic"><div className="loading-vault">SHIELDING PROFILE...</div></div>;
    if (!profileData) return <div className="profile-page-cinematic"><div className="error-vault">PROFILE NOT FOUND</div></div>;

    return (
        <div className="profile-page-cinematic">
            <main className="profile-dashboard-container">
                <section className="profile-hero-section">
                    <div className="profile-hero-card">
                        <div className="profile-img-showcase">
                            <img 
                                src={getImageUrl(profileData.profile)} 
                                alt={profileData.username} 
                                className="main-profile-img" 
                            />
                        </div>

                        <div className="hero-info-cinematic">
                            <div className="hero-badge-row">
                                <span className="identity-badge premium-guest-badge">GUEST PROFILE</span>
                                <span className="verified-status-tag">
                                    <span className="v-dot"></span> VERIFIED
                                </span>
                            </div>

                            <div className="hero-name-row-premium">
                                <h1 className="hero-name-primary profile-title-large">{profileData.full_name || "MEMBER"}</h1>
                                
                                {currentUser && currentUser.id !== parseInt(userId) && (
                                    <button 
                                        className={`follow-btn-premium ${isFollowing ? 'following' : ''}`}
                                        onClick={handleFollow}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <FiCheck />
                                                <span>FOLLOWING</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiUserPlus />
                                                <span>FOLLOW</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            
                            {profileData.bio && (
                                <p className="hero-bio-prominent">{profileData.bio}</p>
                            )}

                            <div className="hero-stats-strip">
                                <div className="stat-item clickable" onClick={() => setShowFollowModal('followers')}>
                                    <span className="stat-count">{followersCount}</span>
                                    <span className="stat-label">FOLLOWERS</span>
                                </div>
                                <div className="stat-item clickable" onClick={() => setShowFollowModal('following')}>
                                    <span className="stat-count">{profileData.following_count}</span>
                                    <span className="stat-label">FOLLOWING</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-count">{profileData.uploaded_count}</span>
                                    <span className="stat-label">UPLOADED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="user-videos-section">
                    <div className="section-header-neat">
                        <h2 className="section-title-premium">
                            UPLOADED <span>STORIES</span>
                        </h2>
                    </div>

                    <div className="videos-grid-cinematic">
                        {profileData.videos && profileData.videos.length > 0 ? (
                            profileData.videos.map(video => (
                                <Link to={`/play/${video.id}`} key={video.id} className="video-card-cinematic">
                                    <div className="video-card-header">
                                        <img src={getImageUrl(video.thumbnail)} alt={video.name} />
                                        <div className="status-badge-approved">LIVE</div>
                                    </div>
                                    <div className="video-card-body">
                                        <h4>{video.name}</h4>
                                        <div className="video-meta-info">
                                            <p className="talent-tag">{video.talent}</p>
                                            <p className="uploaded-by-tag">Uploaded by <span>{video.uploader_full_name || video.uploader_username}</span></p>
                                        </div>
                                        <div className="video-card-footer">
                                            <div className="video-stats-row">
                                                <span><FiHeart className="icon-heart" /> {video.likes_count}</span>
                                                <span><FiMessageSquare className="icon-msg" /> {video.comments_count}</span>
                                            </div>
                                            <div className="view-action-pill">
                                                <FiPlay />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="no-videos-message">This user hasn't uploaded any stories yet.</div>
                        )}
                    </div>
                </section>
            </main>

            {showFollowModal && (
                <FollowListModal 
                    userId={userId} 
                    type={showFollowModal} 
                    onClose={() => setShowFollowModal(null)} 
                />
            )}
        </div>
    );
}

export default UserProfile;
