import "../../css/components/Talent_Stories/Talentstoriesgrid.css";
import { FiMapPin, FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import getTalentStories from "../../api/talentstoriesapi";
import { getMediaBase } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../Common/AuthGuard";

function Talentstoriesgrid({ search = "" }) {

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [talents, setTalents] = useState([]);
  const [showGuard, setShowGuard] = useState(false);

  useEffect(function () {

    getTalentStories().then(function (data) {

      setTalents(data);

    });

  }, []);

  const term = search.toLowerCase();

  const filtered = talents.filter(function (talent) {

    const text = [
      talent.name,
      talent.talent,
      talent.state,
      talent.country
    ].join(" ").toLowerCase();

    return text.includes(term);

  });

  function handleCardClick(id) {
    if (!isAuthenticated) {
      setShowGuard(true);
      return;
    }
    navigate("/talent/" + id);
  }


  return (
    <div className="talentstories_grid">

      {filtered.map(function (talent, index) {

        // Use getMediaBase if the thumbnail is a relative path
        const imageUrl = (talent.thumbnail && talent.thumbnail.startsWith("http"))
          ? talent.thumbnail 
          : (talent.thumbnail ? `${getMediaBase()}${talent.thumbnail}` : "");

        return (

          <div
            key={talent.id}
            className="talent_card"
            onClick={() => handleCardClick(talent.id)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >

            <div className="talent_image">

              <img
                src={imageUrl}
                alt={talent.name}
              />

              <div className="talent_overlay">

                <div className="play_icon_center">
                  <FiPlay />
                </div>

                <span className="talent_category">
                  {talent.talent}
                </span>

                <h3>{talent.name}</h3>

                <div className="talent_location">
                  <FiMapPin /> {talent.state}, {talent.country}
                </div>

                <p className="talent_desc">
                  {talent.desc_of_talent}
                </p>
                
              </div>

            </div>

          </div>

        );

      })}

      {showGuard && (
        <AuthGuard 
          onClose={() => setShowGuard(false)} 
          message="Unlock these incredible talent stories! Please login or register to watch full talent profiles." 
        />
      )}
    </div>
  );
}

export default Talentstoriesgrid;