import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import "../../css/components/Contact/Contact.css";
import { submitContact } from "../../api/contactapi";
import { useAuth } from "../../context/AuthContext";

function Contact(){
  const { user, isAuthenticated } = useAuth();

  const [form,setForm]=useState({
    name: user?.full_name || user?.username || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    subject:"",
    message:""
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.full_name || user.username || "",
        email: user.email || "",
        phone_number: user.phone_number || ""
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);

  const handleChange=(e)=>{
    setForm({...form,[e.target.name]:e.target.value})
  }

const handleSubmit= async (e)=>{
e.preventDefault();
setLoading(true);

try {
await submitContact(form);
alert("Message Sent Successfully");
setForm({
name:"",
email:"",
phone_number:"",
subject:"",
message:""
});
} catch (err) {
alert("Failed to send message");
}
setLoading(false);
}

return(

<div className="contact-container">
    <div className="contact-background-shapes">
        <div className="c-shape c-shape-1"></div>
        <div className="c-shape c-shape-2"></div>
    </div>

    <div className="contact-wrapper">
        {/* LEFT SIDE CONTACT INFO */}
        <div className="contact-info animate-slide-left">
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-desc">Have questions or want to collaborate with our talk show? Reach out to us.</p>

            <div className="info-cards-container">
                <div className="info-card-dynamic">
                    <div className="icon-box"><Mail size={24}/></div>
                    <div className="info-content">
                        <label>Email Us</label>
                        <span>talkshow@gmail.com</span>
                    </div>
                </div>

                <div className="info-card-dynamic">
                    <div className="icon-box"><Phone size={24}/></div>
                    <div className="info-content">
                        <label>Call Us</label>
                        <span>+91 9876543210</span>
                    </div>
                </div>

                <div className="info-card-dynamic">
                    <div className="icon-box"><MapPin size={24}/></div>
                    <div className="info-content">
                        <label>Location</label>
                        <span>Hyderabad, India</span>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="contact-form-wrapper animate-slide-right">
            <div className="contact-form-glass">
                <h2>Send Message</h2>
                <form onSubmit={handleSubmit} className="modern-form">
                    <div className="input-field">
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <div className="input-focus-line"></div>
                    </div>

                    <div className="input-field">
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={form.email}
                            onChange={handleChange}
                            readOnly={isAuthenticated}
                            required
                        />
                        <div className="input-focus-line"></div>
                    </div>

                    <div className="input-field">
                        <input
                            type="text"
                            name="phone_number"
                            placeholder="Phone Number"
                            value={form.phone_number}
                            onChange={handleChange}
                            required
                        />
                        <div className="input-focus-line"></div>
                    </div>

                    <div className="input-field">
                        <input
                            type="text"
                            name="subject"
                            placeholder="Subject"
                            value={form.subject}
                            onChange={handleChange}
                            required
                        />
                        <div className="input-focus-line"></div>
                    </div>

                    <div className="input-field">
                        <textarea
                            name="message"
                            placeholder="Your Message"
                            value={form.message}
                            onChange={handleChange}
                            required
                        />
                        <div className="input-focus-line"></div>
                    </div>

                    <button type="submit" className="glow-submit-btn" disabled={loading}>
                        <Send size={18}/> <span>{loading ? "Sending..." : "Send Message"}</span>
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

)

}

export default Contact;