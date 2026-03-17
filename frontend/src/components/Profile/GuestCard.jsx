import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/components/Profile/GuestCard.css";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../Common/AuthGuard";

function GuestCard({ guest, index }) {

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showGuard, setShowGuard] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowGuard(true);
      return;
    }
    navigate(`/guest/${guest.id}`);
  };

  return (
    <div 
      className="guest-card animate-neat-in" 
      onClick={handleClick}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      
      <img src={guest.profile} alt={guest.name} />

      <div className="card-overlay">

        <span className="category">
          {guest.category}
        </span>

        <h3>{guest.name}</h3>

        <p className="location">
          {guest.location}
        </p>

      </div>

      {showGuard && (
        <AuthGuard 
          onClose={() => setShowGuard(false)} 
          message="Experience the full guest journey! Please login or register to view exclusive guest profiles and stories." 
        />
      )}
    </div>
  );
}

export default GuestCard;