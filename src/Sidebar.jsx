import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHouseChimney,    
  FaListCheck,
  FaSitemap,         
  FaBell,             
  FaChartSimple,      
  FaUsersGear        
} from "react-icons/fa6";

import "./CommonCss/Sidebar.css";
import { strings } from "./string";
import { PERMISSIONS } from "./RBAC/Permissions";

const Sidebar = ({ isOpen }) => {
  const [totalPendingCount, setTotalPendingCount] = useState(0);

  const role = localStorage.getItem("Role");
  const empCode = localStorage.getItem("empCode");

  useEffect(() => {
    if (empCode) {
      fetch(
        `http://${strings.localhost}/api/hazop-dashboard/total-pending-count?empCode=${empCode}`
      )
        .then((res) => res.json())
        .then((data) => setTotalPendingCount(data.totalPendingCount || 0))
        .catch((err) => console.error(err));
    }
  }, [empCode]);

  const menuItems = [
    {
      name: "Hazop Page",
      path: "/HazopPage",
      icon: <FaHouseChimney />,
      permissionKey: "HazopPage",
    },
    {
      name: "Hazop List",
      path: "/HazopList",
      icon: <FaListCheck />,
      permissionKey: "HazopList",
    },
    {
      name: "MOC List",
      path: "/MOCList",
      icon: <FaSitemap />,
      permissionKey: "MOCList",
    },
    {
      name: "Approval Requests",
      path: "/RequestHandler",
      icon: <FaBell />,
      badge: totalPendingCount,
      permissionKey: "ApprovalRequest",
    },
    {
      name: "All Hazop's List",
      path: "/HazopStatusPage",
      icon: <FaChartSimple />,
      permissionKey: "HazopStatusPage",
    },
    {
      name: "Hazop Overview",
      path: "/RoleBasedHazopPage",
      icon: <FaUsersGear />,
      permissionKey: "RoleBasedHazopPage",
    },
  ];
  

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <ul className="menu-list">
        {menuItems
          // Filter Logic:
          // 1. If allowedRoles is null/undefined -> Show to everyone (ApprovalRequest)
          // 2. Else -> Check if current user role is in the allowed list
          .filter((item) => {
            const allowedRoles = PERMISSIONS[item.permissionKey];
            if (allowedRoles === null) return true;
            return allowedRoles && allowedRoles.includes(role);
          })
          .map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="icon">{item.icon}</span>
                {isOpen && <span className="text">{item.name}</span>}
                {item.badge > 0 && isOpen && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;