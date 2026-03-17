import { useState } from "react";
import TalentStoriesHead from "../components/Talent_Stories/Talentstorieshead";
import TalentStoriesGrid from "../components/Talent_Stories/Talentstoriesgrid";

function Talentstories() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <Talentstorieshead search={search} setSearch={setSearch} />

      <Talentstoriesgrid search={search} />
    </div>
  );
}

export default Talentstories;
