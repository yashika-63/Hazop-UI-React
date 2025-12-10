import React, { useState, useEffect, useRef } from 'react';
import './CommonCss/Sidebar.css';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ toggleSidebar, isOpen }) => {
  const [showProfile, setShowProfile] = useState(false);
  const fullName = localStorage.getItem('fullName') || 'User';
  const email = localStorage.getItem('email') || '-';
  const navigate = useNavigate();

  // Ref for profile wrapper
  const profileRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="topbar">

      <div className="sidebar-logo" onClick={toggleSidebar}>
        <img
          src={isOpen ? "/assets/Pristine.png" : "/assets/Pristine-logo.png"}
          alt="Pristine Logo"
          height={30}
        />
      </div>


      <div style={{ flex: 1 }}></div>

      <div className="welcome-message">
        <span>Welcome, </span>
        <strong>{fullName} !</strong>
      </div>
      <div style={{ width: 15 }}></div>

      <div className="topbar-logo">
        <img src="/assets/Alkyl Logo.png" alt="Logo" />
      </div>

      <div
        className="profile-wrapper"
        ref={profileRef} // attach ref here
        onClick={() => setShowProfile(!showProfile)}
      >
        <div className="profile-flip">
          <div className="profile-front">{fullName.charAt(0)}</div>
          <div className="profile-back">👤</div>
        </div>

        {showProfile && (
          <div className={`profile-popup ${showProfile ? 'active' : ''}`}>
            <p><strong>{fullName}</strong></p>
            <p>{email}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;
