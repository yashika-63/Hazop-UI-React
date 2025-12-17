import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDate, showToast, truncateText } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { FaTimes, FaSearch, FaEllipsisV, FaExchangeAlt, FaCalendarAlt, FaCheck, FaUndo, FaChevronUp, FaChevronDown, FaHistory } from "react-icons/fa";
import './Recommandation.css';

const ConfirmationPopup = ({ message, onConfirm, onCancel, isSending }) => {
    return (
        <div className="confirm-overlay">
            <div className="confirm-box">
                <p>{message}</p>
                <div className="confirm-buttons">
                    <button type="button" onClick={onCancel} disabled={isSending} className="cancel-btn">No</button>
                    <button type="button" onClick={onConfirm} disabled={isSending} className="confirm-btn">
                        {isSending ? "Sending..." : "Yes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const HazopRecommendationsThirdScreen = ({ hazopId }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Modal / Popup States ---
    const [showModal, setShowModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    // 1. NEW STATE: For Team Completion Confirmation
    const [showTeamCompletionPopup, setShowTeamCompletionPopup] = useState(false); 
    
    const [showReassignPopup, setShowReassignPopup] = useState(false);
    const [showSendReviewPopup, setShowSendReviewPopup] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isSendingCompletion, setIsSendingCompletion] = useState(false);
    
    // --- Data States ---
    const [teamSearch, setTeamSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedReviewEmployee, setSelectedReviewEmployee] = useState(null);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [reassignComment, setReassignComment] = useState("");

    // --- UI States ---
    const [isSending, setIsSending] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [historyData, setHistoryData] = useState({}); 
    const [loadingHistory, setLoadingHistory] = useState(false);
    
    // --- Inline Date Edit States ---
    const [editingDateRowId, setEditingDateRowId] = useState(null); 
    const [tempTargetDate, setTempTargetDate] = useState(""); 

    const empCode = localStorage.getItem("empCode");

    const fetchTeamMembers = async () => {
        try {
            const res = await axios.get(`http://${strings.localhost}/api/hazopTeam/teamByHazop/${hazopId}?status=true`);
            setTeamMembers(res.data || []);
        } catch (err) {
            console.error("Failed to fetch team members", err);
        }
    };

    const fetchHistory = async (assignmentId) => {
        if (historyData[assignmentId]) return;

        setLoadingHistory(true);
        try {
            const res = await axios.get(`http://${strings.localhost}/api/nodeRecommendation/getByAssignment?assignmentId=${assignmentId}`);
            setHistoryData(prev => ({
                ...prev,
                [assignmentId]: res.data || []
            }));
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoadingHistory(false);
        }
    };
    const toggleRow = (id) => {
        if (editingDateRowId === id) return; 

        const newExpandedId = expandedRowId === id ? null : id;
        setExpandedRowId(newExpandedId);

        if (newExpandedId) {
            fetchHistory(id);
        }
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/nodeRecommendation/getVerificationActionRecords/${hazopId}`
            );
            setRecords(res.data || []);
        } catch (err) {
            console.error("API Error:", err);
            setRecords([]);
            showToast("Failed to fetch data.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hazopId) fetchRecords();
        fetchTeamMembers();
    }, [hazopId]);

    const allCompleted = records.length > 0 && records.every(r => r.completionStatus === true);

    // --- Search & Team Logic ---
    const handleTeamSearchChange = async (e) => {
        const value = e.target.value;
        setTeamSearch(value);
        if (value.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`
            );
            setSearchResults(response.data || []);
        } catch (err) {
            console.error("Error fetching team members:", err);
        }
    };

    const addTeamMember = (user) => {
        setSelectedEmployee(user);
        setSearchResults([]);
        setTeamSearch("");
    };
    const addReviewEmployee = (user) => {
        setSelectedReviewEmployee(user);
        setSearchResults([]);
        setTeamSearch("");
    };

    const handleModalCancel = () => {
        setShowModal(false);
        setSelectedEmployee(null);
    };

    const handleOpenSendReview = () => {
        setShowSendReviewPopup(true);
        setSelectedReviewEmployee(null);
        setTeamSearch("");
        setSearchResults([]);
    };

    // --- Action Handlers ---
    const handleSendReview = async () => {
        if (!selectedReviewEmployee) return;
        setIsSending(true);
        try {
            await axios.post(
                `http://${strings.localhost}/api/hazopRegistration/hazop/sendForVerification/${hazopId}/${encodeURIComponent(selectedReviewEmployee.empCode)}`
            );
            showToast("Hazop sent for review successfully.", "success");
            setShowSendReviewPopup(false);
            setSelectedReviewEmployee(null);
            fetchRecords();
        } catch (err) {
            console.error("Error sending for review:", err);
            showToast("Failed to send Hazop for review.", "error");
        } finally {
            setIsSending(false);
        }
    };

    const handleConfirmComplete = async () => {
        if (!selectedEmployee) return;
        setIsSending(true);
        try {
            await axios.post(
                `http://${strings.localhost}/hazopApproval/save?hazopId=${hazopId}&employeeCode=${selectedEmployee.empCode}`
            );
            showToast("Hazop Send successfully for verification.", "success");
            setShowConfirmation(false);
            setShowModal(false);
            setSelectedEmployee(null);
            fetchRecords();
        } catch (err) {
            console.error("Error completing hazop:", err);
            showToast("Failed to complete hazop.", "error");
        } finally {
            setIsSending(false);
        }
    };

    const handleSendForCompletion = async () => {
        if (!teamMembers || teamMembers.length === 0) {
            showToast("No team members found for this Hazop.", "warning");
            return;
        }

        setIsSendingCompletion(true);
        try {
            const apiCalls = teamMembers.map((member) => {
                const email = member.emailId || member.empEmail || "";

                return axios.post(
                    `http://${strings.localhost}/api/team-comments/send-for-review`,
                    null,
                    {
                        params: {
                            hazopRegistrationId: hazopId,
                            empCode: member.empCode,
                            empEmail: email
                        }
                    }
                );
            });

            await Promise.all(apiCalls);
            showToast("Sent for completion to all team members successfully.", "success");
        } catch (err) {
            console.error("Error sending for completion:", err);
            showToast("Failed to send to some or all team members.", "error");
        } finally {
            setIsSendingCompletion(false);
            // 2. Close the confirmation popup after process finishes
            setShowTeamCompletionPopup(false);
        }
    };

    const handleView = (item) => {
        setSelectedRecommendation(item);
        setShowReassignPopup(true);
        setOpenDropdown(null);
    };

    const handleReassign = async () => {
        if (!selectedEmployee || !selectedRecommendation) return;
        const payload = {
            recommendationId: selectedRecommendation.id,
            createdByEmpCode: empCode,
            assignToEmpCode: selectedEmployee.empCode,
            assignWorkDate: new Date().toISOString().split("T")[0],
            reassignComment
        };

        try {
            setIsSending(true);
            await axios.post(`http://${strings.localhost}/api/recommendation/assign/reassign`, null, { params: payload });
            showToast("Recommendation reassigned successfully", "success");
            setShowReassignPopup(false);
            setSelectedEmployee(null);
            setReassignComment("");
        } catch (err) {
            console.error(err);
            showToast("Failed to reassign recommendation", "error");
        } finally {
            setIsSending(false);
        }
    };

    // --- Inline Date Edit Logic ---
    const handleEditDateClick = (item) => {
        setEditingDateRowId(item.id);
        setOpenDropdown(null);
        setExpandedRowId(null);
        setTempTargetDate(item.targetDate ? item.targetDate.split('T')[0] : "");
    };

    const handleCancelEdit = () => {
        setEditingDateRowId(null);
        setTempTargetDate("");
    };

    const handleSaveTargetDate = async (id) => {
        if (!tempTargetDate) {
            showToast("Please select a date", "error");
            return;
        }

        setIsSending(true);
        try {
            await axios.post(
                `http://${strings.localhost}/api/nodeRecommendation/saveRecord`,
                null,
                {
                    params: {
                        assignmentId: id,
                        targetDate: tempTargetDate,
                        createdByEmpCode: empCode
                    }
                }
            );

            showToast("Target date updated successfully", "success");
            setEditingDateRowId(null);
            setTempTargetDate("");
            fetchRecords(); 
        } catch (err) {
            console.error("Error saving date:", err);
            showToast("Failed to update target date", "error");
        } finally {
            setIsSending(false);
        }
    };

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const renderDropdownContent = (item) => (
        <div className="dropdown-content">
            <button onClick={(e) => { e.stopPropagation(); handleView(item); }}>
                <FaExchangeAlt /> Re-assign
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleEditDateClick(item); }}>
                <FaCalendarAlt /> Change Target Date
            </button>
        </div>
    );

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <table className="assigned-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Sr.No</th>
                        <th>Node Reference No</th>
                        <th>Deviation</th>
                        <th>Recommendation</th>
                        <th>Reviewed By</th>
                        <th>Completion Status</th>
                        <th>Completion Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {records.length === 0 ? (
                        <tr><td colSpan="9" className="no-data1">No Data Available</td></tr>
                    ) : (
                        records.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <tr
                                    className={expandedRowId === item.id ? "main-row expanded" : "main-row"}
                                    onClick={() => toggleRow(item.id)}
                                >
                                    <td className="expand-icon-cell">
                                        {expandedRowId === item.id ? <FaChevronUp /> : <FaChevronDown />}
                                    </td>
                                    <td>{index + 1}</td>
                                    <td>
                                        {item.javaHazopNode?.nodeNumber && item.javaHazopNodeDetail?.nodeDetailNumber
                                            ? `${item.javaHazopNode.nodeNumber}.${item.javaHazopNodeDetail.nodeDetailNumber}`
                                            : '-'}
                                    </td>
                                    <td>{truncateText(item.javaHazopNodeDetail?.deviation, 30)}</td>
                                    <td>{truncateText(item.recommendation, 30)}</td>
                                    <td>{item.verificationResponsibleEmployeeName || "-"}</td>
                                    <td>
                                        <span className={item.completionStatus === true ? "status-completed" : "status-pending"}>
                                            {item.completionStatus === true ? "Completed" : "Pending"}
                                        </span>
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        {editingDateRowId === item.id ? (
                                            <div className="inline-action-group">
                                                <input
                                                    type="date"
                                                    className="inline-date-input"
                                                    value={tempTargetDate}
                                                    min={new Date().toISOString().split("T")[0]}
                                                    onChange={(e) => setTempTargetDate(e.target.value)}
                                                />
                                                <div className="inline-btn-group">
                                                    <button className="inline-save-btn" onClick={() => handleSaveTargetDate(item.id)} disabled={isSending}><FaCheck /></button>
                                                    <button className="inline-cancel-btn" onClick={handleCancelEdit}><FaTimes /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="dropdown top-header">
                                                <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
                                                    <FaEllipsisV />
                                                </button>
                                                {openDropdown === item.id && renderDropdownContent(item)}
                                            </div>
                                        )}
                                    </td>
                                    <td></td>
                                </tr>

                                {/* --- EXPANDED DETAIL ROW --- */}
                                {expandedRowId === item.id && (
                                    <tr className="detail-row">
                                        <td colSpan="9">
                                            <div className="detail-panel">
                                                <div className="detail-grid">
                                                    <div className="detail-item full-width">
                                                        <span className="detail-label">Deviation:</span>
                                                        <p className="detail-text">{item.javaHazopNodeDetail?.deviation}</p>
                                                    </div>
                                                    <div className="detail-item full-width">
                                                        <span className="detail-label">Recommendation:</span>
                                                        <p className="detail-text">{item.recommendation}</p>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Management Remark:</span>
                                                        <p className="detail-text">{item.remarkbyManagement || "No remarks"}</p>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label"><FaHistory /> Target Date History:</span>
                                                        <div className="history-container detail-text">
                                                            {loadingHistory ? (
                                                                <small>Loading history...</small>
                                                            ) : (
                                                                historyData[item.id] && historyData[item.id].length > 0 ? (
                                                                    <ul className="history-list">
                                                                        {historyData[item.id]
                                                                            .sort((a, b) => b.currentUpdatedRecordNo - a.currentUpdatedRecordNo)
                                                                            .map((hist) => (
                                                                                <li key={hist.id}>
                                                                                    <span className="history-date">
                                                                                        {formatDate(hist.targateDate)}
                                                                                    </span>
                                                                                    <span className="history-meta">
                                                                                        (Updated by: {hist.createdByEmpCode || "System"})
                                                                                    </span>
                                                                                </li>
                                                                            ))}
                                                                    </ul>
                                                                ) : (
                                                                    <small>No update history available.</small>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Completion Date:</span>
                                                        <p className="detail-text">{formatDate(item.CompletionDate || "-")}</p>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Assigned To:</span>
                                                        <p className="detail-text">{item.verificationResponsibleEmployeeName} ({item.verificationResponsibleEmployeeCode})</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    )}
                </tbody>
            </table>

            <div className="rightbtn-controls">
                <button
                    className="confirm-btn completion-btn"
                    style={{ marginRight: '10px', backgroundColor: '#e67e22' }} 
                    // 3. TRIGGER POPUP INSTEAD OF DIRECT ACTION
                    onClick={() => setShowTeamCompletionPopup(true)} 
                    disabled={isSendingCompletion || teamMembers.length === 0}
                    title={teamMembers.length === 0 ? "No team members found" : "Notify all team members"}
                >
                    {isSendingCompletion ? "Sending..." : "Send for Completion"}
                </button>
                <button
                    className="confirm-btn review-btn"
                    onClick={handleOpenSendReview}
                    disabled={!allCompleted || isSending}
                    title={!allCompleted ? "All records must be completed to enable this button" : ""}
                >
                    Send For Review
                </button>
            </div>

            {/* 4. TEAM COMPLETION CONFIRMATION POPUP */}
            {showTeamCompletionPopup && (
                <ConfirmationPopup
                    message={`Are you sure you want to send for completion to all ${teamMembers.length} team members?`}
                    onConfirm={handleSendForCompletion}
                    onCancel={() => setShowTeamCompletionPopup(false)}
                    isSending={isSendingCompletion}
                />
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h4 className="centerText">Select Employee to Complete Hazop</h4>
                        <div className="search-container">
                            <div className="search-bar-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search employee..."
                                    value={teamSearch}
                                    onChange={handleTeamSearchChange}
                                    disabled={loading}
                                />
                                <FaSearch className="search-icon" />
                                <ul className="search-results">
                                    {searchResults.map(user => (
                                        <li key={user.empCode} onClick={() => addTeamMember(user)}>
                                            {user.empCode} - ({user.emailId || "NA"}) ({user.department || "NA"})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {selectedEmployee && (
                            <div className="details-row">
                                <span className="label">Selected Employee:</span>
                                <span className="value selected-employee-value">
                                    {selectedEmployee.empCode}
                                    <FaTimes
                                        onClick={() => setSelectedEmployee(null)}
                                        className="remove-icon"
                                    />
                                </span>
                            </div>
                        )}

                        <div className="confirm-buttons">
                            <button type="button" onClick={handleModalCancel} className="cancel-btn">Cancel</button>
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(true)}
                                className="confirm-btn"
                                disabled={!selectedEmployee}
                            >
                                Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {showReassignPopup && selectedRecommendation && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h3 className="centerText">Recommendation Details</h3>
                        <p><strong>Recommendation:</strong> {selectedRecommendation.recommendation}</p>
                        <p>
                            <strong>Completion Status:</strong>{" "}
                            {selectedRecommendation.completionStatus === true ? "Completed" : "Pending"}
                        </p>

                        <div className="search-container">
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
                                                {user.empCode} - ({user.emailId})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {selectedEmployee && (
                            <div className="details-container">
                                <h5>Selected Employee: {selectedEmployee.firstName} {selectedEmployee.lastName}</h5>
                                <FaTimes className="remove-icon" onClick={() => setSelectedEmployee(null)} />
                            </div>
                        )}

                        <div className='form-group'>
                            <textarea
                                value={reassignComment}
                                onChange={(e) => setReassignComment(e.target.value)}
                                rows={3}
                                placeholder="Reassign comment..."
                            />
                        </div>

                        <div className="confirm-buttons">
                            <button type="button" className="cancel-btn" onClick={() => setShowReassignPopup(false)}>Close</button>
                            <button type="button" className="confirm-btn" onClick={handleReassign} disabled={!selectedEmployee || !reassignComment}>
                                {isSending ? "Sending..." : "Reassign"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSendReviewPopup && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h4 className="centerText">Select Reviewer</h4>
                        <div className="search-container">
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
                                        {searchResults.map(user => (
                                            <li key={user.empCode} onClick={() => addReviewEmployee(user)}>
                                                {user.empCode} - ({user.emailId})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        {selectedReviewEmployee && (
                            <div className="details-container">
                                <span>Selected: {selectedReviewEmployee.firstName} ({selectedReviewEmployee.empCode})</span>
                                <FaTimes className="remove-icon" onClick={() => setSelectedReviewEmployee(null)} />
                            </div>
                        )}
                        <div className="confirm-buttons">
                            <button className="cancel-btn" onClick={() => setShowSendReviewPopup(false)}>Cancel</button>
                            <button className="confirm-btn" onClick={handleSendReview} disabled={!selectedReviewEmployee || isSending}>
                                {isSending ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default HazopRecommendationsThirdScreen;