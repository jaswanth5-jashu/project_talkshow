import { NavLink } from "react-router-dom";
import { FaYoutube, FaInstagram, FaFacebookF } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";    
import "../../css/components/common/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <NavLink to="/" className="footer-logo">
            TALKSHOW
          </NavLink>

          <p className="footer-desc">
            Platform Dynamic Talk Show — Where talent shines from the root
            level. Giving a digital stage to grassroots communities.
          </p>
        </div>

        <div className="footer-links">
          <h3>NAVIGATE</h3>

            <NavLink to="/">Home</NavLink>
            <NavLink to="/Talentstories">Talent Stories</NavLink>
            <NavLink to="/guests">Guest Profile</NavLink>
            <NavLink to="/Episodes">Episodes</NavLink>
            <NavLink to="/Feedback">Feedback</NavLink>
        </div>

        <div className="footer-contact">
          <h3>REACH US</h3>

          <div className="contact-item">
            <MdEmail />
            <span>hello@dynamictalkshow.com</span>
          </div>

          <div className="contact-item">
            <MdPhone />
            <span>+91 98765 43210</span>
          </div>

          <div className="contact-item">
            <MdLocationOn />
            <span>Mumbai, India</span>
          </div>
        </div>

        <div className="footer-social">
          <h3>SUPPORT</h3>
          <div className="footer-support-links">
            <NavLink to="/Feedback">Help Center</NavLink>
            <button className="footer-assist-trigger" onClick={() => window.dispatchEvent(new CustomEvent('open-assistant'))}>
              AI Assistant
            </button>
          </div>
        </div>

        <div className="footer-social">
          <h3>CONNECT</h3>

          <div className="social-icons">
            <NavLink to="/login">
              <FaYoutube />
            </NavLink>

            <NavLink to="/login">
              <FaInstagram />
            </NavLink>

            <NavLink to="/login">
              <FaFacebookF />
            </NavLink>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Platform Dynamic Talk Show</p>

        <p>
          Made with <span className="heart">❤</span> for grassroots talent
        </p>
      </div>
    </footer>
  );
}

export default Footer;
