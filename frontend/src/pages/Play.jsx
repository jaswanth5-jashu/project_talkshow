import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { FiArrowLeft, FiPlay, FiPause, FiRotateCcw, FiRotateCw, FiMaximize } from "react-icons/fi";
import { getTalentById } from "../api/talentstoriesapi";
import { getEpisodeById } from "../api/guestapi";
import { getMediaBase } from "../api/api";
import "../css/components/Play/Play.css";

function Play() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [videoData, setVideoData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current && !isNaN(time)) {
      videoRef.current.currentTime = time;
    }
  };

  const onTimeUpdate = () => {
    if (!isSeeking && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
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
        if (data && data.full_video) {
          setVideoData({
            title: data.name,
            desc: data.bio,
            videoUrl: data.full_video
          });
          setIsYouTube(false);
        } else {
          setIsYouTube(true);
        }
      });
    } else if (videoId && !isNaN(videoId)) {
      getTalentById(videoId).then((data) => {
        if (data && data.talentvideo) {
          setVideoData({
            title: data.name,
            desc: data.desc_of_talent,
            videoUrl: data.talentvideo,
            subtitle: `${data.talent} - Performance`
          });
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

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return getMediaBase() + path;
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
          <div className="nav-metadata">
             <span className="live-pill">WATCHING NOW</span>
             <span className="nav-title">{videoData?.title || "Loading..."}</span>
          </div>
        </div>

        <div className="theater-main">
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
                    src={videoData ? getFullUrl(videoData.videoUrl) : ""}
                    className="cinematic-video-element"
                    onClick={togglePlay}
                    onTimeUpdate={onTimeUpdate}
                    onLoadedMetadata={() => setDuration(videoRef.current.duration)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  <div className="cinematic-hud">
                     <div className="hud-top">
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          onMouseDown={() => setIsSeeking(true)}
                          onMouseUp={() => setIsSeeking(false)}
                          className="hud-slider"
                        />
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
                           <button className="hud-skip-btn" onClick={skipBackward}>
                              <FiRotateCcw />
                              <span>10</span>
                           </button>
                           <button className="hud-skip-btn" onClick={skipForward}>
                              <FiRotateCw />
                              <span>10</span>
                           </button>
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

          <div className="theater-sidebar">
             <div className="info-glass-panel">
                <span className="info-category">
                  {videoData?.subtitle || "TALKSHOW EXCLUSIVE"}
                </span>
                <h1 className="info-title">{videoData?.title}</h1>
                <div className="info-separator"></div>
                <p className="info-description">
                  {videoData?.desc || "Experience the depth of talent and story in this exclusive feature."}
                </p>
                
                <div className="interactive-badges">
                   <div className="badge">4K ULTRA HD</div>
                   <div className="badge">EXCLUSIVE</div>
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