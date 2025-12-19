import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../string";
import { showToast, truncateWords } from "../CommonUI/CommonUI";
import { FaEye, FaEllipsisV, FaTimes, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Reusable Popup for REJECT flow (Accept flow is now inline)
const RejectConfirmationPopup = ({
  message,
  onConfirm,
  onCancel,
  comment,
  setComment,
  teamSearch,
  handleTeamSearchChange,
  searchResults,
  addTeamMember,
  selectedEmployee,
  setSelectedEmployee,
}) => (
  <div className="modal-overlay">
    <div className="modal-body">
      <p>{message}</p>
      <div className="form-group">
        <label>Comment (Reason for Rejection):</label>
        <textarea
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {/* <div className="search-container">
                <label>Recommendate To:</label>
                <div className="search-bar-wrapper">
                    <input
                        type="text"
                        placeholder="Search employee..."
                        value={teamSearch}
                        onChange={handleTeamSearchChange}
                    />
                    <FaSearch className="search-icon" />
                    {searchResults.length > 0 && (
                        <ul className="search-results">
                            {searchResults.map((user) => (
                                <li key={user.empCode} onClick={() => addTeamMember(user)}>
                                    {user.empCode} - ({user.emailId || "NA"})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div> */}

      {selectedEmployee && (
        <div className="details-container">
          <h5>Recommending To:</h5>
          <div className="details-row">
            <span>
              {selectedEmployee.firstName} {selectedEmployee.lastName} (
              {selectedEmployee.empCode})
            </span>
            <FaTimes
              className="remove-icon"
              onClick={() => setSelectedEmployee(null)}
              style={{ cursor: "pointer", color: "red" }}
            />
          </div>
        </div>
      )}

      <div className="confirm-buttons">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={`confirm-btn ${!comment ? "disabled-btn" : ""}`}
          onClick={!comment ? null : onConfirm}
          disabled={!comment}
        >
          Reject
        </button>
      </div>
    </div>
  </div>
);

const PendingRecommendationApproval = () => {
  const [assignments, setAssignments] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDateInput, setShowDateInput] = useState(false); // Controls Target Date visibility
  const [rejectConfirmation, setRejectConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const empCode = localStorage.getItem("empCode");
  const empName = localStorage.getItem("fullName");
  const empEmail = localStorage.getItem("email");
  const [expandedRowId, setExpandedRowId] = useState(null);
  const navigate = useNavigate();
  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `http://${strings.localhost}/api/recommendation/assign/getAssignments`,
        {
          params: {
            assignToEmpCode: empCode,
            assignWorkSendForAcceptance: true,
            assignWorkAcceptanceStatus: false,
          },
        }
      );
      setAssignments(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleNavigateToDetail = (e, rec) => {
    e.stopPropagation();

    // Access the nested objects correctly based on your API response structure
    const targetNodeId =
      rec.javaHazopNodeRecommendation?.javaHazopNodeDetail?.hazopNodeId ||
      rec.javaHazopNodeRecommendation?.javaHazopNode?.id;

    const targetDetailId =
      rec.javaHazopNodeRecommendation?.javaHazopNodeDetail?.id;

    if (targetNodeId && targetDetailId) {
      navigate("/ViewNodeDiscussion", {
        state: {
          nodeId: targetNodeId,
          detailId: targetDetailId,
        },
      });
    } else {
      console.error(
        "Missing ID. Node:",
        targetNodeId,
        "Detail:",
        targetDetailId
      );
      // showToast("Navigation details missing", "error");
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const openPopup = (rec) => {
    setSelectedRecord({
      assignmentId: rec.id,
      recommendation: rec.javaHazopNodeRecommendation,
    });
    setOpenDropdown(null);
    setShowDateInput(false);
    setTargetDate("");
  };

  // --- REJECT FLOW HANDLERS ---
  const initRejectFlow = (assignmentId) => {
    setSelectedRecord(null);
    setRejectConfirmation({
      assignmentId,
      message: "Are you sure you want to reject this recommendation?",
    });
  };

  const handleTeamSearchChange = async (e) => {
    const value = e.target.value;
    setTeamSearch(value);
    if (value.length < 2) return setSearchResults([]);
    try {
      const response = await axios.get(
        `http://${strings.localhost}/api/employee/search?search=${value}`
      );
      setSearchResults(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addTeamMember = (user) => {
    setSelectedEmployee(user);
    setTeamSearch("");
    setSearchResults([]);
  };

  const confirmReject = async () => {
    if (!selectedEmployee)
      return showToast("Select a reassignment employee", "error");

    setLoading(true);
    try {
      await axios.post(
        `http://${strings.localhost}/api/recommendation/assign/acceptOrReject`,
        {},
        {
          params: {
            assignmentId: rejectConfirmation.assignmentId,
            accept: false,
            empCode,
            empName,
            empEmail,
            comment,
            // recommendedPersonName: selectedEmployee.fullName,
            // recommendedPersonEmpCode: selectedEmployee.empCode,
          },
        }
      );
      showToast("Rejected successfully", "success");
      resetAll();
    } catch (err) {
      showToast("Failed to reject", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- ACCEPT FLOW HANDLERS (Inline) ---

  // 1. User clicks "Accept" in modal -> Shows Date Input
  const handleAcceptClick = () => {
    setShowDateInput(true);
  };

  // 2. User clicks "Save" -> Hits Save API then Accept API
  const handleAcceptSave = async () => {
    if (!targetDate) {
      return showToast("Please select a target date", "error");
    }

        setLoading(true);
        try {
            // Step 1: Hit the SAVE API as requested
            await axios.post(
                `http://${strings.localhost}/api/nodeRecommendation/saveRecord`,
                null, // No body, using params
                {
                    params: {
                        assignmentId: selectedRecord.assignmentId,
                        targetDate: targetDate,
                        createdByEmpCode: empCode
                    }
                }
            );

      // Step 2: Hit the ACCEPT API
      await axios.post(
        `http://${strings.localhost}/api/recommendation/assign/acceptOrReject`,
        {},
        {
          params: {
            assignmentId: selectedRecord.assignmentId,
            accept: true,
            empCode,
            empName,
            empEmail,
            targetDate: targetDate,
            comment: "Accepted",
          },
        }
      );

      showToast("Recommendation Accepted Successfully", "success");
      resetAll();
    } catch (err) {
      console.error("Error in saving/accepting:", err);
      showToast("Failed to save and accept", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    fetchAssignments();
    setSelectedRecord(null);
    setRejectConfirmation(null);
    setComment("");
    setTargetDate("");
    setSelectedEmployee(null);
    setShowDateInput(false);
  };

  return (
    <div>
      <h4>Assigned Recommendations</h4>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* MAIN TABLE */}
      <table className="hazoplist-table">
        <thead>
          <tr>
            <th>Sr.No</th>
            <th>Node Reference No</th>
            <th>Deviation</th>
            <th>Recommendation</th>
            <th>Assigned By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 ? (
            <tr>
              <td colSpan={7}>No Recommendations</td>
            </tr>
          ) : (
            assignments.map((rec, idx) => (
              <tr
                key={rec.id}
                className={expandedRowId === rec.id ? "expanded-row" : ""}
                onClick={() => toggleRow(rec.id)}
              >
                <td>{idx + 1}</td>
                <td>
                  {rec.javaHazopNodeRecommendation?.javaHazopNode?.nodeNumber &&
                  rec.javaHazopNodeRecommendation?.javaHazopNodeDetail
                    ?.nodeDetailNumber
                    ? `${rec.javaHazopNodeRecommendation.javaHazopNode.nodeNumber}.${rec.javaHazopNodeRecommendation.javaHazopNodeDetail.nodeDetailNumber}`
                    : "-"}
                </td>

                <td
                  className={`truncate-cell ${
                    expandedRowId === rec.id ? "expanded-cell" : ""
                  }`}
                  onClick={(e) => handleNavigateToDetail(e, rec)}
                  style={{
                    cursor: "pointer",
                    color: "#319795",
                    fontWeight: "600",
                  }}
                  title="Click to view discussion details"
                >
                  {expandedRowId === rec.id
                    ? rec.javaHazopNodeRecommendation?.javaHazopNodeDetail
                        ?.deviation
                    : truncateWords(
                        rec.javaHazopNodeRecommendation?.javaHazopNodeDetail
                          ?.deviation || "-",
                        10
                      )}
                </td>

                <td
                  className={`truncate-cell ${
                    expandedRowId === rec.id ? "expanded-cell" : ""
                  }`}
                >
                  {expandedRowId === rec.id
                    ? rec.javaHazopNodeRecommendation?.recommendation
                    : truncateWords(
                        rec.javaHazopNodeRecommendation?.recommendation || "-",
                        10
                      )}
                </td>
                <td>{rec.createdByName}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown">
                    <button
                      className="dots-button"
                      onClick={() => toggleDropdown(rec.id)}
                    >
                      <FaEllipsisV />
                    </button>
                    {openDropdown === rec.id && (
                      <div className="dropdown-content">
                        <button onClick={() => openPopup(rec)}>
                          <FaEye /> View
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* RECOMMENDATION DETAILS MODAL (Now includes Accept Flow) */}
      {selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-body">
            <h5 className="centerText">Recommendation Details</h5>

            <div className="details-row">
              <span className="label">Recommendation:</span>
              <span className="value">
                {selectedRecord.recommendation?.recommendation || "-"}
              </span>
            </div>
            <div className="details-row">
              <span className="label">Department:</span>
              <span className="value">
                {selectedRecord.recommendation?.department || "-"}
              </span>
            </div>
            <div className="details-row">
              <span className="label">Remark:</span>
              <span className="value">
                {selectedRecord.recommendation?.remarkbyManagement || "-"}
              </span>
            </div>

            {/* CONDITIONAL UI: If "Accept" was clicked, show Date Input */}
            {showDateInput && (
              <div
                className="details-row"
                style={{
                  marginTop: "15px",
                  background: "#f0f8ff",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <span
                  className="label"
                  style={{ fontWeight: "bold", color: "#007bff" }}
                >
                  *Target Date:
                </span>
                <input
                  type="date"
                  className="form-control"
                  value={targetDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setTargetDate(e.target.value)}
                  style={{ width: "60%", marginLeft: "10px" }}
                />
              </div>
            )}

            <div className="confirm-buttons" style={{ marginTop: "20px" }}>
              {/* Logic: If date input is NOT shown, show Accept/Reject. If shown, show Save. */}
              {!showDateInput ? (
                <>
                  <button
                    type="button"
                    className="approveBtn"
                    onClick={handleAcceptClick}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="rejectBtn"
                    onClick={() => initRejectFlow(selectedRecord.assignmentId)}
                  >
                    Reject
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="approveBtn"
                  onClick={handleAcceptSave}
                >
                  Save & Confirm
                </button>
              )}

              <button
                type="button"
                className="cancel-btn"
                onClick={() => setSelectedRecord(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION POPUP (Separate component for cleaner code) */}
      {rejectConfirmation && (
        <RejectConfirmationPopup
          message={rejectConfirmation.message}
          onConfirm={confirmReject}
          onCancel={() => setRejectConfirmation(null)}
          comment={comment}
          setComment={setComment}
          teamSearch={teamSearch}
          handleTeamSearchChange={handleTeamSearchChange}
          searchResults={searchResults}
          addTeamMember={addTeamMember}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
        />
      )}
    </div>
  );
};

export default PendingRecommendationApproval;
