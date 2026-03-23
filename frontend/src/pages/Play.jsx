import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { FiArrowLeft, FiPlay, FiPause, FiRotateCcw, FiRotateCw, FiMaximize, FiHeart, FiMessageSquare, FiUserPlus, FiCheck } from "react-icons/fi";
import { getTalentById, toggleLike, getComments, postComment, toggleSubscribe, deleteComment } from "../api/talentstoriesapi";
import { getEpisodeById } from "../api/guestapi";
import { apiClient, getMediaBase } from "../api/api";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/components/Play/Play.css";

function Play() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [videoData, setVideoData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffInSeconds = Math.floor((now - then) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo`;
    return `${Math.floor(diffInDays / 365)}y`;
  };

  const skipForward = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      if (!isNaN(current) && !isNaN(dur)) {
        videoRef.current.currentTime = Math.min(dur, current + 10);
      } else if (!isNaN(current)) {
        videoRef.current.currentTime = current + 10;
      }
    }
  }, []);

  const skipBackward = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      if (!isNaN(current)) {
        videoRef.current.currentTime = Math.max(0, current - 10);
      }
    }
  }, []);

  const onTimeUpdate = () => {
    if (!isSeeking && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
  };

  const handleSeekCommit = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current && !isNaN(time)) {
      videoRef.current.currentTime = time;
    }
    setIsSeeking(false);
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        skipForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        skipBackward();
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [skipForward, skipBackward, togglePlay]);

  useEffect(() => {
    if (videoId && videoId.startsWith("ep_")) {
      const actualId = videoId.split("_")[1];
      getEpisodeById(actualId).then((data) => {
        if (data) {
          setVideoData({
            id: data.id,
            title: data.name,
            desc: data.bio,
            videoUrl: data.full_video,
            subtitle: "EXCLUSIVE EPISODE",
            uploaderId: data.guest_user_id || (data.guest_data?.user), // We'll need to ensure these are in the serializer
            isEpisode: true
          });
          setLikes(data.likes_count || 0);
          setIsLiked(data.is_liked || false);
          setIsSubscribed(data.is_following || false);
          setIsYouTube(!data.full_video);
        }
      });
    } else if (videoId && !isNaN(videoId)) {
      getTalentById(videoId).then((data) => {
        if (data && data.talentvideo) {
          setVideoData({
            id: data.id,
            title: data.name,
            desc: data.desc_of_talent,
            videoUrl: data.talentvideo,
            subtitle: `${data.talent} - Performance`,
            uploaderId: data.user,
            uploader_username: data.uploader_username,
            uploader_full_name: data.uploader_full_name,
            uploader_profile: data.uploader_profile,
            isEpisode: false
          });
          setLikes(data.likes_count || 0);
          setIsLiked(data.is_liked || false);
          setIsSubscribed(data.is_following || false);
          setIsYouTube(false);
        } else {
          setIsYouTube(true);
        }
      });
    } else {
      setIsYouTube(true);
    }
  }, [videoId]);

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handleLike = () => {
    if(!videoData?.id) return;
    toggleLike(videoData.id, videoData.isEpisode).then(res => {
      setIsLiked(res.liked);
      setLikes(res.count);
    }).catch(console.error);
  };

  const loadCommentsList = () => {
    if(!videoData?.id) return;
    getComments(videoData.id, videoData.isEpisode).then(res => setComments(res)).catch(console.error);
  };
  
  useEffect(() => {
    if(videoData?.id) {
        loadCommentsList();
    }
  }, [videoData?.id, videoData?.isEpisode]);
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if(!commentText.trim() || !videoData?.id) return;
    postComment(videoData.id, commentText, videoData.isEpisode).then(res => {
      setComments([res, ...comments]);
      setCommentText("");
    }).catch(console.error);
  };

  const handleDeleteComment = (commentId) => {
    if(!window.confirm("Delete this comment?")) return;
    deleteComment(commentId).then(() => {
      setComments(comments.filter(c => c.id !== commentId));
    }).catch(console.error);
  };

  const handleFollow = () => {
    if(!videoData?.uploaderId) return;
    toggleSubscribe(videoData.uploaderId).then(res => {
      setIsSubscribed(res.subscribed);
    }).catch(console.error);
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : getMediaBase() + path;
  };

  return (
    <div className="play-page-cinematic">
      <div className="theatrical-vignette"></div>
      <div className="dynamic-backdrop">
        <div className="glow-orb red"></div>
        <div className="glow-orb white"></div>
      </div>

      <div className="theater-container" ref={containerRef}>
        <div className="theater-nav">
          <button className="minimal-back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft />
            <span>EXIT THEATER</span>
          </button>
        </div>

        <div className="theater-header-cinematic">
          <div className="header-top-row">
            <span className="info-category">
              {videoData?.subtitle || (videoId?.startsWith("ep_") ? "EXCLUSIVE EPISODE" : "TALENT STORY")}
            </span>
          </div>
          
          <h1 className="cinematic-title-primary">{videoData?.title || "UNNAMED STORY"}</h1>
          
          <div className="theater-metadata-row">
            {videoData?.uploaderId && (
              <Link to={`/user/${videoData.uploaderId}`} className="uploader-identity">
                <img src={getFullUrl(videoData.uploader_profile)} alt={videoData.uploader_username} className="uploader-avatar" />
                <div className="uploader-info">
                  <span className="uploader-name">{videoData.uploader_full_name || videoData.uploader_username}</span>
                </div>
              </Link>
            )}
            
            <div className="metadata-divider-v"></div>
            
            <div className="video-stats-horizontal">
              <span className="stat-unit"><FiHeart className="stat-icon" /> {likes}</span>
              <span className="stat-unit"><FiMessageSquare className="stat-icon" /> {comments.length}</span>
            </div>

            <div className="horizontal-actions-group">
              <button className={`premium-action-btn like ${isLiked ? 'active' : ''}`} onClick={handleLike}>
                {isLiked ? <FiHeart fill="currentColor" /> : <FiHeart />}
                <span>{isLiked ? 'LIKED' : 'LIKE'}</span>
              </button>
              
              {videoData?.uploaderId && user?.id !== videoData.uploaderId && (
                <button className={`premium-action-btn follow ${isSubscribed ? 'active' : ''}`} onClick={handleFollow}>
                  {isSubscribed ? <FiCheck /> : <FiUserPlus />}
                  <span>{isSubscribed ? 'FOLLOWING' : 'FOLLOW'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="theater-main-content">
          <div className="video-stage">
             <div className="video-hero-unit">
                {isYouTube ? (
                   <div className="youtube-wrapper-cinematic">
                     <iframe
                       src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                       title="Cinematic Feed"
                       frameBorder="0"
                       allow="autoplay; encrypted-media"
                       allowFullScreen
                     />
                   </div>
                ) : (
                   <div className="native-player-box">
                     <video
                       ref={videoRef}
                       src={videoData ? getFullUrl(videoData.videoUrl) : null}
                       className="cinematic-video-element"
                       onClick={togglePlay}
                       onTimeUpdate={onTimeUpdate}
                       onLoadedMetadata={() => setDuration(videoRef.current.duration)}
                       onPlay={() => setIsPlaying(true)}
                       onPause={() => setIsPlaying(false)}
                     />

                     <div className="cinematic-hud">
                        <div className="hud-top">
                           <div className="hud-slider-wrapper">
                             <input
                               type="range"
                               min="0"
                               max={duration || 0}
                               value={currentTime}
                               onInput={handleSeek}
                               onMouseDown={() => setIsSeeking(true)}
                               onChange={handleSeekCommit}
                               className="hud-slider"
                               style={{ "--progress": `${(currentTime / (duration || 1)) * 100}%` }}
                             />
                             <div className="thumb-time-tag" style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}>
                               {formatTime(currentTime)}
                             </div>
                           </div>
                        </div>
                        <div className="hud-bottom">
                           <div className="hud-group">
                              <button className="hud-icon-btn" onClick={togglePlay}>
                                 {isPlaying ? <FiPause /> : <FiPlay />}
                              </button>
                              <div className="hud-time">
                                 <span>{formatTime(currentTime)}</span>
                                 <span className="dim">/</span>
                                 <span className="dim">{formatTime(duration)}</span>
                              </div>
                           </div>

                           <div className="hud-group center">
                              {/* Skip buttons removed as per user request */}
                           </div>

                           <div className="hud-group right">
                              <button className="hud-icon-btn" onClick={toggleFullScreen}>
                                 <FiMaximize />
                              </button>
                           </div>
                        </div>
                     </div>
                   </div>
                )}
             </div>
             
             <div className="video-description-box">
                <h3>About this story</h3>
                <p>{videoData?.desc || "Experience the depth of talent and story in this exclusive feature."}</p>
             </div>
          </div>

          <div className="theater-sidebar">
             <div className="chat-container-premium">
                  <div className="chat-header">
                    <h3>COMMUNITY REACTION</h3>
                    <span className="count-tag">{comments.length}</span>
                  </div>

                  <form onSubmit={handleCommentSubmit} className="chat-input-premium">
                    <input 
                      type="text" 
                      value={commentText} 
                      onChange={(e) => setCommentText(e.target.value)} 
                      placeholder="Share your thoughts..."
                    />
                    <button type="submit" disabled={!commentText.trim()}>SEND</button>
                  </form>

                  <div className="chat-scroll-area">
                    {comments.map(c => (
                       <div key={c.id} className="chat-item">
                         <Link to={`/user/${c.user}`} className="chat-avatar-link">
                           <img src={getFullUrl(c.user_profile)} alt={c.username} className="chat-avatar" />
                         </Link>
                         <div className="chat-content">
                           <div className="chat-meta">
                             <Link to={`/user/${c.user}`} className="chat-author">{c.full_name || c.username}</Link>
                             <span className="chat-time">{formatRelativeTime(c.created_at)}</span>
                           </div>
                           <p className="chat-text">{c.text}</p>
                         </div>
                        {user?.id === c.user && (
                          <button onClick={() => handleDeleteComment(c.id)} className="chat-delete-btn">✖</button>
                        )}
                      </div>
                    ))}
                    {comments.length === 0 && <div className="chat-empty">Be the first to join the conversation.</div>}
                  </div>
                </div>
          </div>
        </div>

        <div className="theater-footer-glow"></div>
      </div>
    </div>
  );
}

export default Play;