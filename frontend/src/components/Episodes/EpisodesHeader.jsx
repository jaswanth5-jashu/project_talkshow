import React from "react";
import { FiSearch } from "react-icons/fi";
import "../../css/components/episodes/EpisodesHeader.css";

function EpisodesHeader() {
  return (
    <div className="episodes_head">
      <div className="episodes_container">
        <span className="episodes_tag">EXCLUSIVE CONTENT</span>
        <h1 className="episodes_title">
          Talk Show <span>Episodes</span>
        </h1>
        <p className="episodes_desc">
          Watch inspiring conversations and powerful stories from our incredible guests.
        </p>

        <div className="episodes_search">
          <FiSearch className="search_icon" />
          <input type="text" placeholder="Search for episodes or guests..." />
        </div>
      </div>
    </div>
  );
}

export default EpisodesHeader;