import { useState, useEffect } from "react";
import "../../css/components/Home/Home_about.css";
import aboutImg from "../../assets/images/images.png";
import { FaGlobe, FaAward, FaHeart, FaLightbulb } from "react-icons/fa";

import getHomeaboutStats from "../../api/abouthomeapi";

function Home_about() {
  const [stats, setStats] = useState({
    talents: "0",
    impact: "0",
  });

  useEffect(function () {
    getHomeaboutStats().then(function (data) {
      if (data.length > 0) {
        setStats({
          talents: data[0].no_of_talents,
          impact: data[0].year_of_impact,
        });
      }
    });
  }, []);

  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-left">
          <span className="about-tag">ABOUT US</span>

          <h1 className="about-title">
            THE STAGE FOR <br />
            <span>UNSEEN</span> BRILLIANCE
          </h1>

          <p className="about-desc">
            Platform Dynamic Talk Show is a one-of-a-kind digital platform
            dedicated to discovering, celebrating, and promoting talented
            individuals from rural and grassroots communities across India.
          </p>

          <p className="about-desc">
            We believe that talent knows no boundaries — it exists in every
            village, every small town, and every corner of the country. Our
            mission is to find those extraordinary individuals and give them the
            recognition they deserve.
          </p>

          <div className="about-cards">
            <div className="about-card">
              <FaGlobe />
              <span>Pan-India Reach</span>
            </div>

            <div className="about-card">
              <FaAward />
              <span>{stats.talents}+ Talents</span>
            </div>

            <div className="about-card">
              <FaHeart />
              <span>Community First</span>
            </div>

            <div className="about-card">
              <FaLightbulb />
              <span>Digital Stage</span>
            </div>
          </div>
        </div>

        <div className="about-right">
          <img src={aboutImg} alt="festival" />

          <div className="impact-box">
            <h2>{stats.impact}+</h2>

            <p>YEARS OF IMPACT</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home_about;
