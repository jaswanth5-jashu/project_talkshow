import "../../css/components/Talent_Stories/Talentstorieshead.css";
import { FiSearch } from "react-icons/fi";

function Talentstorieshead({ search, setSearch }) {
  return (
    <section className="talentstories_head">
      <div className="talentstories_container">
        <span className="talentstories_tag">DISCOVER</span>
        <h1 className="talentstories_title">
          EXPLORE <span>TALENTS</span>
        </h1>
        <p className="talentstories_desc">
          Browse through the incredible stories of individuals making a difference.
        </p>

        <div className="talentstories_search">
          <FiSearch className="search_icon" />

          <input
            type="text"
            placeholder="Search talents by name, category, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}

export default Talentstorieshead;
