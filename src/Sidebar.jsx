import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUser, FaProjectDiagram } from 'react-icons/fa';
import './CommonCss/Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { name: 'HazopPage', path: '/HazopPage', icon: <FaHome /> },
    { name: 'Node', path: '/NodePage', icon: <FaProjectDiagram /> },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <ul className="menu-list">
        {menuItems.map((item, index) => (
          <li key={index}>
            <NavLink to={item.path} className="menu-link" activeClassName="active">
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
