import { useEffect, useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import GuestCard from "../../components/Profile/GuestCard";
import GuestsHeader from "./GuestsHeader";
import { getGuests } from "../../api/guestapi";
import "../../css/components/Profile/Guests.css";

function Guests() {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGuests()
      .then((data) => {
        setGuests(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filteredGuests = guests.filter((guest) => {
    const term = search.toLowerCase();
    return (
      guest.name.toLowerCase().includes(term) ||
      guest.designation.toLowerCase().includes(term) ||
      (guest.bio && guest.bio.toLowerCase().includes(term))
    );
  });

  return (
    <div className="guests-page">
      <GuestsHeader search={search} setSearch={setSearch} guests={guests} />
      
      {loading ? (
        <div className="loading-container">
          <p>Loading featured guests...</p>
        </div>
      ) : (
        <div className="guests-grid">
          {filteredGuests.map((guest, index) => (
            <GuestCard 
              key={guest.id} 
              index={index}
              guest={{
                ...guest,
                category: guest.designation, // Map designation to category for GuestCard
                location: "Guest Speaker" // Default if not in model
              }} 
            />
          ))}
          {filteredGuests.length === 0 && (
            <div className="no-results">
              <FiUserPlus />
              <h3>
                {search ? 'No Matches Found' : 'No Guest Profiles Available'}
              </h3>
              <p>
                {search 
                  ? `We couldn't find any guests matching "${search}". Please try a different term.` 
                  : 'We are currently preparing more incredible guest stories. Stay tuned!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Guests;
