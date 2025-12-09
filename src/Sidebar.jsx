import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaChartLine, FaClipboardCheck, FaCogs, FaHome, FaList, FaListAlt, FaListUl, FaRegListAlt, FaTasks } from "react-icons/fa";
import { FaDiagramProject, FaPeopleGroup, FaShield } from "react-icons/fa6";
import "./CommonCss/Sidebar.css";

const Sidebar = ({ isOpen }) => {
  const [totalPendingCount, setTotalPendingCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5559/api/hazop-dashboard/total-pending-count?empCode=Rohan Kaitake")
      .then(res => res.json())
      .then(data => {
        setTotalPendingCount(data.totalPendingCount || 0);
      })
      .catch(err => console.error(err));
  }, []);

  const menuItems = [
    { name: "HazopPage", path: "/HazopPage", icon: <FaHome /> },
    { name: "HazopList", path: "/HazopList", icon: <FaListUl /> },
    { name: "MOCList", path: "/MOCList", icon: <FaTasks /> },
    {
      name: "ApprovalRequest",
      path: "/RequestHandler",
      icon: <FaClipboardCheck />,
      badge: totalPendingCount,
    },
    { name: "All Hazop's", path: "/HazopStatusPage", icon: <FaChartLine /> },
    { name: "HazopWorkflow", path: "/HazopWorkflow", icon: <FaDiagramProject /> },

  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <ul className="menu-list">
        {menuItems.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "menu-link active" : "menu-link"
              }
            >
              <span className="icon">{item.icon}</span>
              {isOpen && <span className="text">{item.name}</span>}
              {item.badge > 0 && <span className="sidebar-badge">{item.badge}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
