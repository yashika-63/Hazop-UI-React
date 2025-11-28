import React from 'react';
import './CommonCss/Sidebar.css';

const Topbar = ({ toggleSidebar }) => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
        &#9776; 
        </button>
        <div className="topbar-logo">Hazop</div>
      </div>
    </div>
  );
};

export default Topbar;
