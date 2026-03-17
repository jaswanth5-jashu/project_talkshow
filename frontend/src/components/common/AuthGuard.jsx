import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import "../../css/components/Common/AuthGuard.css";

function AuthGuard({ onClose, message }) {
    const navigate = useNavigate();

    return ReactDOM.createPortal(
        <div className="auth-guard-overlay" onClick={onClose}>
            <div className="auth-guard-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-guard" onClick={onClose}>
                    <FiX />
                </button>
                <h2>ACCESS RESTRICTED</h2>
                <p>{message || "Please register or login to your account to access this exclusive section."}</p>
                <div className="auth-guard-btns">
                    <button className="auth-guard-btn primary" onClick={() => navigate("/login")}>
                        Login / Register Now
                    </button>
                    <button className="auth-guard-btn secondary" onClick={onClose}>
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default AuthGuard;
