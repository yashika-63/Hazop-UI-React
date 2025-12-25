import React, { useState, useEffect, useRef } from 'react';
import './CommonCss/Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './Context/ThemeContext';

const Topbar = ({ toggleSidebar, isOpen }) => {

  const { theme, toggleTheme } = useTheme();

  const [showProfile, setShowProfile] = useState(false);
  const fullName = localStorage.getItem('fullName') || 'User';
  const email = localStorage.getItem('email') || '-';
  const profileRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

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
    // FIX 1: Use 'var(--bg-topbar)' instead of 'var(--bg-card)'
    // This ensures the header is Dark Glossy in light mode, not White.
    <div className="topbar" style={{ backgroundColor: 'var(--bg-topbar)', borderBottom: '1px solid var(--sidebar-border)' }}>

      <div className="sidebar-logo" onClick={toggleSidebar}>
        <img
          src={isOpen ? "/assets/Pristine.png" : "/assets/Pristine-logo.png"}
          alt="Pristine Logo"
          height={30}
        />
      </div>

      <div style={{ flex: 1 }}></div>

      {/* --- THEME TOGGLE BUTTON --- */}
      {/* FIX 2: Replaced inline styles with class 'theme-toggle-btn' */}
      <button
        onClick={toggleTheme}
        className="theme-toggle-btn"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={20} color="#ffcc00" /> : <Moon size={20} />}
      </button>
      {/* --------------------------- */}

      {/* FIX 3: Use 'var(--sidebar-text)' so the text is White in Light Theme */}
      <div className="welcome-message" style={{ color: 'var(--sidebar-text)' }}>
        <span>Welcome, </span>
        <strong>{fullName} !</strong>
      </div>

      <div style={{ width: 15 }}></div>

      <div className="topbar-logo">
        <img src="/assets/Alkyl Logo.png" alt="Logo" />
      </div>

      <div
        className="profile-wrapper"
        ref={profileRef}
        onClick={() => setShowProfile(!showProfile)}
      >
        <div className="profile-flip">
          <div className="profile-front" style={{ color: '#fff' }}>{fullName.charAt(0)}</div>
          <div className="profile-back">👤</div>
        </div>

        {showProfile && (
          // Note: Popup background should remain 'popup-bg' so it matches the theme of the page content
          <div className={`profile-popup ${showProfile ? 'active' : ''}`} style={{ backgroundColor: 'var(--popup-bg)', color: 'var(--text-main)' }}>
            <p><strong style={{ color: 'var(--text-main)' }}>{fullName}</strong></p>
            <p style={{ color: 'var(--text-secondary)' }}>{email}</p>
            <button type='button' className='logout-btn' onClick={handleLogout} style={{ marginTop: '10px' }}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;