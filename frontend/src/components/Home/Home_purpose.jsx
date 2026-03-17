import "../../css/components/Home/Home_purpose.css";
import { FaStar, FaPlay, FaArrowUpRightFromSquare } from "react-icons/fa6";

function PurposeSection() {
  return (
    <section className="purpose-section">

      <div className="purpose-header">
        <p className="purpose-tag">OUR PURPOSE</p>

        <h1 className="purpose-title">
          VOICES THAT DESERVE <br/>
          TO BE <span>HEARD</span>
        </h1>

        <p className="purpose-sub">
          We bridge the gap between grassroots talent and mainstream recognition.
        </p>
      </div>

      <div className="purpose-cards">

        <div className="purpose-card">
          <h2 className="number">01</h2>
          <div className="icon"><FaStar/></div>

          <h3>DISCOVER</h3>

          <p>
            Finding hidden gems from the remotest corners of India
            through community networks and local partnerships.
          </p>
        </div>

        <div className="purpose-card">
          <h2 className="number">02</h2>
          <div className="icon"><FaPlay/></div>

          <h3>SHOWCASE</h3>

          <p>
            Giving talents a professional platform to present their
            skills through high-quality talk show episodes.
          </p>
        </div>

        <div className="purpose-card">
          <h2 className="number">03</h2>
          <div className="icon"><FaArrowUpRightFromSquare/></div>

          <h3>AMPLIFY</h3>

          <p>
            Connecting talented individuals with wider audiences,
            opportunities, and collaborations nationwide.
          </p>
        </div>

      </div>

    </section>
  );
}

export default PurposeSection;








