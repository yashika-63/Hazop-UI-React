import React, { useEffect, useState } from "react";
import axios from "axios";

import { strings } from "../string"; // Adjust path as needed
import { formatDate } from "../CommonUI/CommonUI"; // Adjust path as needed
import { FaChartPie, FaCheckCircle, FaEdit, FaEllipsisV, FaEye, FaLightbulb, FaSpinner } from "react-icons/fa";
import { FaArrowsSpin } from "react-icons/fa6";

// Helper Functions
const truncateWords = (text, wordLimit = 4) => {
  if (!text) return "-";
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
};

const getInitial = (name) => {
  if (!name || typeof name !== "string") return null;
  return name.trim().charAt(0).toUpperCase();
};

const HazopCard = ({ 
    item, 
    columnType, 
    // Props passed from Parent for global state management
    openDropdown, 
    toggleDropdown, 
    handleOpenNode, 
    handleUpdate, 
    handleRecommendation, 
    openSendCompletionPopup, 
    handleNavigate, 
    handleViewDashboard, 
    handleViewHazop 
}) => {
  
  // --- Local State for Lazy Loaded Data ---
  const [peopleCount, setPeopleCount] = useState(null); // null = loading
  const [canSendForCompletion, setCanSendForCompletion] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // --- Effect: Fetch Detail Data on Mount ---
  useEffect(() => {
    let isMounted = true;

    const fetchCardDetails = async () => {
      try {
        // 1. Fetch Team Count
        const countPromise = axios.get(`${strings.localhost}/api/hazopTeam/count/${item.id}`);
        
        // 2. Fetch Status (Only needed for 'New Registered' column)
        const statusPromise = columnType === "new" 
            ? axios.get(`${strings.localhost}/api/hazopNode/check-status/${item.id}`)
            : Promise.resolve(null);

        const [countRes, statusRes] = await Promise.allSettled([countPromise, statusPromise]);

        if (isMounted) {
            // Process Count
            if (countRes.status === "fulfilled") {
                setPeopleCount(Number(countRes.value.data) || 0);
            } else {
                setPeopleCount(0);
            }

            // Process Eligibility Logic
            if (statusRes.status === "fulfilled" && statusRes.value) {
                const data = statusRes.value.data;
                const isEligible = data.approvalActionTaken === true &&
                                   data.sendForApproval === false &&
                                   data.allNodesComplete === true &&
                                   data.status === true;
                setCanSendForCompletion(isEligible);
            }
            setLoadingDetails(false);
        }
      } catch (err) {
        console.error("Error loading card details", err);
      }
    };

    fetchCardDetails();

    return () => { isMounted = false; };
  }, [item.id, columnType]);

  return (
    <div className={`kanban-card priority-${item.priority?.toLowerCase() || "medium"}`}>
      <div className="card-top">
        {item.verificationActionTaken === true && (
          <span className="verified-badge"><FaCheckCircle /> Verified</span>
        )}
        <span className="card-date">{formatDate(item.hazopCreationDate)}</span>
        
        {/* --- Dropdown Logic --- */}
        <div className="dropdown">
            <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
                <FaEllipsisV />
            </button>

            {openDropdown === item.id && (
                <div className="dropdown-content">
                {columnType === "new" && (
                    <>
                    <button type="button" onClick={() => handleOpenNode(item)}>
                        <FaEye /> Open Node
                    </button>
                    <button type="button" onClick={() => handleUpdate(item)}>
                        <FaEdit /> Create Team
                    </button>
                    <button type="button" onClick={() => handleRecommendation(item)}>
                        <FaLightbulb /> Recommendation
                    </button>
                    
                    {/* Only show if logic passed in useEffect */}
                    {/* {canSendForCompletion && (
                        <button type="button" onClick={() => openSendCompletionPopup(item)}>
                        <FaCheckCircle /> Send for Completion
                        </button>
                    )} */}

                    <button type="button" onClick={() => handleNavigate(item)}>
                        <FaArrowsSpin /> HAZOP Status
                    </button>
                    </>
                )}
                <button type="button" onClick={() => handleViewDashboard(item)}>
                    <FaChartPie /> Dashboard
                </button>
                {(columnType === "pending" || columnType === "completed") && (
                    <button type="button" onClick={() => handleViewHazop(item)}>
                    <FaEye /> View
                    </button>
                )}
                </div>
            )}
        </div>
      </div>

      <div className="card-title">{truncateWords(item.hazopTitle || "Untitled", 4)}</div>
      <div className="card-sub">{truncateWords(item.description, 6)}</div>

      <div className="card-footer">
        <span className="people-count">
            {loadingDetails && peopleCount === null ? (
                <FaSpinner className="fa-spin" />
            ) : (
                `👥 ${peopleCount} working`
            )}
        </span>

        <div className="avatar-group">
          {(() => {
            const initials = [];
            const createdInitial = getInitial(item.createdBy);
            const verifierInitial = getInitial(item.verificationemployeeName);
            if (createdInitial) initials.push(createdInitial);
            if (verifierInitial) initials.push(verifierInitial);
            return initials.map((i, index) => (
              <span className="avatar" key={index}>{i}</span>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default HazopCard;