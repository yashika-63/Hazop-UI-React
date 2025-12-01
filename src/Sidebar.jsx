import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUser, FaProjectDiagram, FaFileArchive, FaFileAlt, FaList } from 'react-icons/fa';
import './CommonCss/Sidebar.css';
import { FaPeopleGroup } from 'react-icons/fa6';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { name: 'HazopPage', path: '/HazopPage', icon: <FaHome /> },
    { name: 'Node', path: '/NodePage', icon: <FaProjectDiagram /> },
    { name: 'HazopList', path: '/HazopList', icon: <FaList /> },
    {name: 'ApprovalRequest', path:'/RequestHandler', icon:<FaPeopleGroup/>}
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
