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

    // --- New State for Team Comments API ---
    const [teamComments, setTeamComments] = useState([]);

    // --- Modal / Popup States ---
    const [showModal, setShowModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showTeamCompletionPopup, setShowTeamCompletionPopup] = useState(false);
    const [showReassignPopup, setShowReassignPopup] = useState(false);
    const [showSendReviewPopup, setShowSendReviewPopup] = useState(false);

    // --- Data States ---
    const [teamMembers, setTeamMembers] = useState([]);
    const [teamSearch, setTeamSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedReviewEmployee, setSelectedReviewEmployee] = useState(null);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [reassignComment, setReassignComment] = useState("");

    // --- UI States ---
    const [isSending, setIsSending] = useState(false);
    const [isSendingCompletion, setIsSendingCompletion] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [historyData, setHistoryData] = useState({});
    const [loadingHistory, setLoadingHistory] = useState(false);

    // --- Inline Date Edit States ---
    const [editingDateRowId, setEditingDateRowId] = useState(null);
    const [tempTargetDate, setTempTargetDate] = useState("");

    const empCode = localStorage.getItem("empCode");

    // --- API Calls ---

    const fetchTeamMembers = async () => {
        try {
            const res = await axios.get(`http://${strings.localhost}/api/hazopTeam/teamByHazop/${hazopId}?status=true`);
            setTeamMembers(res.data || []);
        } catch (err) {
            console.error("Failed to fetch team members", err);
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

    // 1. NEW API: Fetch Team Comments / Status
    const fetchTeamComments = async () => {
        try {
            const res = await axios.get(`http://${strings.localhost}/api/team-comments/getByHazop/${hazopId}`);
            setTeamComments(res.data || []);
        } catch (err) {
            console.error("Failed to fetch team comments", err);
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

    useEffect(() => {
        if (hazopId) {
            fetchRecords();
            fetchTeamComments(); // Fetch new table data
        }
        fetchTeamMembers();
    }, [hazopId]);

    // --- Completion Logic Update ---

    const isTeamSignOffInitiated = teamComments.length > 0;

    // 2. CHECK ALL NODES: Every record must have completionStatus === true
    const recordsCompleted = records.length > 0 && records.every(r => r.completionStatus === true);

    // 3. CHECK TEAM SIGN OFF: Every team member must have signed
    const teamCommentsCompleted = teamComments.length > 0 && teamComments.every(r => r.sendForReviewAction === true);

    // 4. FINAL FLAG: Both conditions must be met to enable the review button
    const allCompleted = recordsCompleted && teamCommentsCompleted;

    // 5. Check if it was already sent (to keep button disabled after success)
    const isAlreadySentForFinalReview = teamComments.length > 0 && teamComments.every(r => r.sendForReviewAction === true);

    // Calculate Node Progress
    const totalNodes = records.length;
    const completedNodesCount = records.filter(r => r.completionStatus === true).length;
    const nodeProgressPercent = totalNodes > 0 ? (completedNodesCount / totalNodes) * 100 : 0;

    // Calculate Team Sign-off Progress
    const totalTeam = teamComments.length;
    const signedTeamCount = teamComments.filter(r => r.sendForReviewAction === true).length;
    const teamProgressPercent = totalTeam > 0 ? (signedTeamCount / totalTeam) * 100 : 0;
    const toggleRow = (id) => {
        if (editingDateRowId === id) return;
        const newExpandedId = expandedRowId === id ? null : id;
        setExpandedRowId(newExpandedId);
        if (newExpandedId) {
            fetchHistory(id);
        }
    };

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
            fetchTeamComments(); // Refresh the lower table
        } catch (err) {
            console.error("Error sending for completion:", err);
            showToast("Failed to send to some or all team members.", "error");
        } finally {
            setIsSendingCompletion(false);
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

            {/* --- TABLE 1: Recommendations Records --- */}
            <h4 ></h4>

            <div className="table-header-stats">
                <div className={`mini-badge ${completedNodesCount === totalNodes ? 'ready' : 'not-ready'}`}>
                    <span className="badge-dot"></span>
                    Nodes: {completedNodesCount}/{totalNodes}
                </div>
                <div className={`mini-badge ${signedTeamCount === totalTeam && totalTeam > 0 ? 'ready' : 'not-ready'}`}>
                    <span className="badge-dot"></span>
                    Sign-offs: {signedTeamCount}/{totalTeam}
                </div>
            </div>

            <table className="assigned-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Sr.No</th>
                        <th>Node Ref No</th>
                        <th>Deviation</th>
                        <th>Recommendation</th>
                        <th>Reviewed By</th>
                        <th>Completion Status</th>
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
                                {/* Expanded Row Content (Details & History) - Same as before */}
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

            {/* --- MIDDLE BUTTON: Send for Completion --- */}
            <div className="middle-controls" style={{ marginTop: '15px', marginBottom: '20px' }}>
                <button
                    className="confirm-btn completion-btn"
                    style={{
                        backgroundColor: isTeamSignOffInitiated ? '#bdc3c7' : '#e67e22',
                        cursor: isTeamSignOffInitiated ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => setShowTeamCompletionPopup(true)}
                    // UPDATED DISABLED LOGIC:
                    disabled={isSendingCompletion || teamMembers.length === 0 || isTeamSignOffInitiated}
                    title={
                        isTeamSignOffInitiated
                            ? "Team sign off has already been initiated."
                            : teamMembers.length === 0 ? "No team members found" : "Notify all team members to sign"
                    }
                >
                    {isSendingCompletion ? "Sending..." : "Send for team sign off"}
                </button>
            </div>

            {/* --- TABLE 2: Team Comments / Verification Status --- */}
            <h4 className="table-header-title">Sign Off Status</h4>
            <table className="assigned-table" style={{ marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Employee Name</th>
                        <th>Email</th>
                        <th>Assigned Date</th>
                        <th>Signed By</th>
                        <th>Signed On</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {teamComments.length === 0 ? (
                        <tr><td colSpan="7" className="no-data1">No Team Comments Available</td></tr>
                    ) : (
                        teamComments.map((item, index) => (
                            <tr key={item.id} className="main-row">
                                <td>{index + 1}</td>
                                <td>{item.empCode}</td> {/* Displaying Name as per your API response */}
                                <td>{item.empEmail}</td>
                                <td>{formatDate(item.assignDate)}</td>
                                <td>{item.signByEmpName || "-"}</td>
                                <td>{formatDate(item.signedOn) || "-"}</td>
                                <td>
                                    <span
                                        className={
                                            item.sendForReviewStatus && item.sendForReviewAction
                                                ? "status-completed"
                                                : "status-pending"
                                        }
                                    >
                                        {item.sendForReviewStatus && item.sendForReviewAction
                                            ? "Signed"
                                            : "Pending"}
                                    </span>
                                </td>

                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* --- BOTTOM BUTTON: Send For Review (Final Action) --- */}
            <div className="rightbtn-controls" style={{ marginTop: '10px' }}>
                <button
                    className="confirm-btn review-btn"
                    onClick={handleOpenSendReview}
                    // Button is only clickable if all nodes AND team sign-offs are true
                    disabled={!allCompleted || isSending}
                    title={
                        !allCompleted
                            ? "All individual recommendations and team sign-offs must be 'Completed' first."
                            : "Send Hazop for Final Review"
                    }
                >
                    {isSending ? "Processing..." : "Send For Review"}
                </button>
            </div>

            {/* --- POPUPS --- */}

            {/* Team Completion Popup */}
            {showTeamCompletionPopup && (
                <ConfirmationPopup
                    message={`Are you sure you want to send for sign off to all ${teamMembers.length} team members?`}
                    onConfirm={handleSendForCompletion}
                    onCancel={() => setShowTeamCompletionPopup(false)}
                    isSending={isSendingCompletion}
                />
            )}

            {/* Modal for Assigning Complete (Used in Table 1) */}
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

            {/* Reassign Popup */}
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

            {/* Send For Review Popup */}
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