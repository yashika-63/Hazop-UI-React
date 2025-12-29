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

  const fetchSidebarCounts = () => {
    if (empCode) {
      fetch(`http://${strings.localhost}/api/hazop-dashboard/total-pending-count?empCode=${empCode}`)
        .then((res) => res.json())
        .then((data) => setTotalPendingCount(data.totalPendingCount || 0))
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    fetchSidebarCounts();
    // Listen for updates from other components
    window.addEventListener('refreshHazopCounts', fetchSidebarCounts);
    return () => {
      window.removeEventListener('refreshHazopCounts', fetchSidebarCounts);
    };
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
      badge: totalPendingCount, // Count passed here
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
                {/* 1. Icon Container (Icon + Red Dot Badge) */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span className="icon">{item.icon}</span>

                  {/* Red Dot: Only visible when closed AND badge > 0 */}
                  {!isOpen && item.badge > 0 && (
                    <span className="sidebar-dot-badge"></span>
                  )}
                </div>

                {/* 2. Text (Visible only when Open) */}
                {isOpen && <span className="text">{item.name}</span>}

                {/* 3. Number Badge (Visible only when Open AND badge > 0) */}
                {isOpen && item.badge > 0 && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}

                {/* 4. Tooltip (Visible on Hover when Closed) */}
                {!isOpen && (
                  <span className="sidebar-tooltip">{item.name}</span>
                )}
              </NavLink>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;