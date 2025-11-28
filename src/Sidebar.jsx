import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import './CommonCss/Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { name: 'Home', path: '/', icon: <FaHome /> },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <ul className="menu-list">
        {menuItems.map((item, index) => (
          <li key={index}>
            <NavLink to={item.path} className="menu-link">
              <span className="icon">{item.icon}</span>
              {isOpen && <span className="text">{item.name}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
