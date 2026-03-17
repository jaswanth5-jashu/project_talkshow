import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../../css/components/Home/Home_head.css";
import { FaBolt, FaPlay, FaArrowRight } from "react-icons/fa";

import getHomeStats from "../../api/headhomeapi";

function Home_head() {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    talents: "0",
    episodes: "0",
    views: "0",
  });

  useEffect(function () {

    getHomeStats().then(function (data) {

      if (data.length > 0) {

        setStats({
          talents: data[0].no_of_talents,
          episodes: data[0].no_of_episodes,
          views: data[0].no_of_views,
        });

      }

    });

  }, []);

  return (
    <section className="hero">

      <div className="floating-box box1 box-light"></div>
      <div className="floating-box box2 box-light"></div>
      <div className="floating-box box3 box-light"></div>
      <div className="floating-box box4"></div>
      <div className="floating-box box5"></div>

      <div className="hero-content">

        <span className="live-tag">
          <FaBolt /> LIVE PLATFORM
        </span>

        <h1 className="hero-title">
          WHERE <br />
          <span>TALENT</span> <br />
          SHINES
        </h1>

        <p className="hero-desc">
          Discovering extraordinary skills from grassroots communities.
          Every voice matters, every story inspires.
        </p>

        <div className="hero-stats">

          <div className="stat-box">
            <h2>{stats.talents}+</h2>
            <p>TALENTS</p>
          </div>

          <div className="stat-box">
            <h2>{stats.episodes}+</h2>
            <p>EPISODES</p>
          </div>

          <div className="stat-box">
            <h2>{stats.views}+</h2>
            <p>VIEWERS</p>
          </div>

        </div>

      </div>

      <div className="hero-buttons">

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

    </section>
  );
}

export default Home_head;