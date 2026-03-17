import "../../css/components/Home/Home_V&M.css";
import { FaBullseye, FaEye } from "react-icons/fa";

function Home_VM() {
  return (
    <section className="missionVision">
      
      <p className="tag">MISSION & VISION</p>

      <h1 className="title">
        WHAT DRIVES US <span>FORWARD</span>
      </h1>

      <div className="cards">

        <div className="card">
          <div className="icon">
            <FaBullseye />
          </div>

          <h2>OUR MISSION</h2>

          <p className="desc">
            To discover, nurture, and promote exceptional talents from
            grassroots communities by providing them a professional digital
            stage through engaging talk show content.
          </p>

          <ul>
            <li>Empower rural artists and performers</li>
            <li>Create high-quality showcase content</li>
            <li>Build bridges between communities</li>
          </ul>
        </div>


        <div className="card">
          <div className="icon">
            <FaEye />
          </div>

          <h2>OUR VISION</h2>

          <p className="desc">
            To become India's leading platform for grassroots talent discovery,
            where every skilled individual gets recognized and celebrated.
          </p>

          <ul>
            <li>A talent-first nation with equal opportunity</li>
            <li>1000+ talents showcased by 2030</li>
            <li>Pan-India grassroots network</li>
          </ul>
        </div>

      </div>
    </section>
  );
}

export default Home_VM;