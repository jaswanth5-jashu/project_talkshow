import "../../css/components/Profile/GuestsHeader.css";
import { FiSearch } from "react-icons/fi";

function GuestsHeader({ search, setSearch }) {
  return (
    <section className="guests_head">
      <div className="guests_head_container">
        <span className="guests_tag">LEGENDS</span>
        <h1 className="guests_title">
          FEATURED <span>GUESTS</span>
        </h1>
        <p className="guests_desc">
          Meet the extraordinary minds and personalities who have graced our platform.
        </p>

        <div className="guests_search">
          <FiSearch className="search_icon" />

          <input
            type="text"
            placeholder="Search guests by name, designation, or bio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}

export default GuestsHeader;
