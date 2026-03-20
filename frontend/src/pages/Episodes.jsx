import EpisodesHeader from "../components/Episodes/EpisodesHeader";
import EpisodesGrid from "../components/Episodes/EpisodesGrid";
import { useState, useEffect } from "react";
import { getEpisodes } from "../api/guestapi";

function Episodes() {
  const [search, setSearch] = useState("");
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    getEpisodes().then((data) => setEpisodes(data));
  }, []);

  return (
    <div className="episodes">
      <EpisodesHeader search={search} setSearch={setSearch} episodes={episodes} />
      <EpisodesGrid search={search} episodes={episodes} />
    </div>
  );
}

export default Episodes;