import React, { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiX, FiSend, FiUser, FiCpu } from 'react-icons/fi';
import '../../css/components/common/SupportAssistant.css';

const SupportAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your TalkShow Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-assistant', handleOpen);
    return () => window.removeEventListener('open-assistant', handleOpen);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const autoReplies = [
    { label: "How to show talent?", reply: "To show your talent, click the 'Show Your Talent' button in the header and fill out the submission form!" },
    { label: "Where are episodes?", reply: "You can find all our episodes in the 'Episodes' section in the main menu." },
    { label: "Change Password", reply: "Go to your 'Profile' page, then 'Security Settings' to initiate a password reset via email OTP." },
    { label: "Delete Account", reply: "Account deletion is available in the 'Danger Zone' at the bottom of your Profile settings." },
    { label: "Is my data safe?", reply: "Yes! We use secure encryption and never share your personal data with third parties." },
    { label: "What is TalkShow?", reply: "TalkShow is a platform for grassroots talent to shine. We bridge the gap between local talent and global audiences." }
  ];

  const handleSend = (text) => {
    if (!text.trim()) return;

    const newUserMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "I'm still learning! For complex issues, please email hello@dynamictalkshow.com.";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('talent')) botResponse = autoReplies[0].reply;
      else if (lowerText.includes('episode')) botResponse = autoReplies[1].reply;
      else if (lowerText.includes('password')) botResponse = autoReplies[2].reply;
      else if (lowerText.includes('delete') || lowerText.includes('purge')) botResponse = autoReplies[3].reply;
      else if (lowerText.includes('safe') || lowerText.includes('privacy')) botResponse = autoReplies[4].reply;
      else if (lowerText.includes('what') || lowerText.includes('about')) botResponse = autoReplies[5].reply;
      else if (lowerText.includes('contact')) botResponse = "You can reach us at hello@dynamictalkshow.com or via the Contact page.";

      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className={`support-assistant-wrapper ${isOpen ? 'active' : ''}`}>
      {!isOpen && (
        <button className="notif-btn assistant-bubble" onClick={() => setIsOpen(true)}>
          <FiMessageCircle />
          <span className="assistant-pulse"></span>
        </button>
      )}

      {isOpen && (
        <div className="assistant-window">
          <div className="assistant-header">
            <div className="assistant-id">
              <FiCpu />
              <div>
                <h4>TalkShow AI</h4>
                <span>Online</span>
              </div>
            </div>
            <button className="close-assistant" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>

          <div className="assistant-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="message-row bot"><div className="message-bubble typing">...</div></div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="assistant-quick-replies">
            {autoReplies.map((ar, idx) => (
              <button key={idx} onClick={() => handleSend(ar.label)}>
                {ar.label}
              </button>
            ))}
          </div>

          <div className="assistant-input-area">
            <input 
              type="text" 
              placeholder="Type your question..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
            />
            <button onClick={() => handleSend(inputValue)}>
              <FiSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportAssistant;
