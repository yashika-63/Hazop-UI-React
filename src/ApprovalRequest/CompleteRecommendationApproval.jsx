import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../string";
import { formatDate, showToast, truncateWords } from "../CommonUI/CommonUI";
import { FaEllipsisV, FaEye, FaCalendarAlt, FaCheck, FaTimes, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CompleteRecommendationApproval = ({ onActionComplete }) => {
    const [completedAssignments, setCompletedAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [selectedRecord, setSelectedRecord] = useState(null);
    // const [confirmation, setConfirmation] = useState(null);
    const [dateLimits, setDateLimits] = useState({ min: "", max: "" });
    // Inline Edit States (Only for Overdue Rescheduling now)
    const [editingRowId, setEditingRowId] = useState(null);
    const [tempTargetDate, setTempTargetDate] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    // History States
    const [historyData, setHistoryData] = useState({});
    const [loadingHistory, setLoadingHistory] = useState(false);

    const navigate = useNavigate();
    const empCode = localStorage.getItem("empCode");
    const [expandedRowId, setExpandedRowId] = useState(null);

    // Fetch history when a row is expanded
    const fetchHistory = async (assignmentId) => {
        // If we already have data, don't fetch again
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
        const newExpandedId = expandedRowId === id ? null : id;
        setExpandedRowId(newExpandedId);

        // If opening a row, fetch history
        if (newExpandedId) {
            fetchHistory(id);
        }
    }

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const fetchCompletedAssignments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://${strings.localhost}/api/recommendation/assign/getByEmployeeStatus`,
                {
                    params: {
                        empCode: empCode,
                        assignWorkAcceptanceStatus: true,
                        assignworkAcceptance: true,
                        completionStatus: false,
                    },
                }
            );
            const data = Array.isArray(response.data) ? response.data : [];
            setCompletedAssignments(data);
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch completed assignments", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompletedAssignments();
    }, []);

    // --- HELPER FUNCTIONS ---

    // Get today's date string YYYY-MM-DD
    const getTodayString = () => new Date().toISOString().split('T')[0];

    // Calculate Overdue Days
    const getOverdueDays = (targetDateStr) => {
        if (!targetDateStr) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(targetDateStr);
        target.setHours(0, 0, 0, 0);

        const diffTime = today - target;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Separate Lists
    const inProgressList = completedAssignments.filter(rec => {
        if (!rec.targetDate) return true; // Keep no-date items in progress
        return rec.targetDate >= getTodayString();
    });

    const overdueList = completedAssignments.filter(rec => {
        if (!rec.targetDate) return false;
        return rec.targetDate < getTodayString();
    });

    const handleNavigateToDetail = (e, rec) => {
        e.stopPropagation();
        const targetNodeId = rec.javaHazopNodeRecommendation?.javaHazopNodeDetail?.hazopNodeId
            || rec.javaHazopNodeRecommendation?.javaHazopNode?.id;

        const targetDetailId = rec.javaHazopNodeRecommendation?.javaHazopNodeDetail?.id;

        if (targetNodeId && targetDetailId) {
            navigate('/ViewNodeDiscussion', {
                state: {
                    nodeId: targetNodeId,
                    detailId: targetDetailId
                }
            });
        } else {
            console.error("Missing ID. Node:", targetNodeId, "Detail:", targetDetailId);
        }
    };

    const openUpdatePopup = (record) => {
        setSelectedRecord({
            assignmentId: record.id,
            ...record
        });
        setOpenDropdown(null);
    };

    // --- INLINE DATE EDIT HANDLERS (For Overdue Rescheduling) ---

    const handleEditClick = (record) => {
        setEditingRowId(record.id);
        const currentTargetDateStr = record.targetDate ? record.targetDate.split('T')[0] : getTodayString();
        setTempTargetDate(currentTargetDateStr);

        const baseDate = new Date(currentTargetDateStr);

        // Min Date: Current Target + 1 Day (Tomorrow relative to target)
        const minDateObj = new Date(baseDate);
        minDateObj.setDate(baseDate.getDate() + 1);
        const minDateStr = minDateObj.toISOString().split('T')[0];

        // Max Date: Current Target + 7 Days
        const maxDateObj = new Date(baseDate);
        maxDateObj.setDate(baseDate.getDate() + 7);
        const maxDateStr = maxDateObj.toISOString().split('T')[0];

        setDateLimits({ min: minDateStr, max: maxDateStr });
        setOpenDropdown(null);
    };

    const handleCancelEdit = () => {
        setEditingRowId(null);
        setTempTargetDate("");
    };

    const handleSaveDate = async (recordId) => {
        if (!tempTargetDate) {
            return showToast("Please select a valid date", "error");
        }
        if (tempTargetDate < dateLimits.min || tempTargetDate > dateLimits.max) {
            return showToast(`Please select a date between ${formatDate(dateLimits.min)} and ${formatDate(dateLimits.max)}`, "warning");
        }
        // --- NEW VALIDATION LOGIC ---
        // Find the current record in our state to get its original date
        const currentRecord = completedAssignments.find(r => r.id === recordId);

        if (currentRecord && currentRecord.targetDate) {
            const originalDate = new Date(currentRecord.targetDate).setHours(0, 0, 0, 0);
            const newSelectedDate = new Date(tempTargetDate).setHours(0, 0, 0, 0);

            if (newSelectedDate <= originalDate) {
                return showToast("New target date must be later than the current target date", "warning");
            }
        }
        // ----------------------------

        setActionLoading(true);
        try {
            await axios.post(
                `http://${strings.localhost}/api/nodeRecommendation/saveRecord`,
                null,
                {
                    params: {
                        assignmentId: recordId,
                        targetDate: tempTargetDate,
                        createdByEmpCode: empCode
                    }
                }
            );

            showToast("Target date updated successfully", "success");
            fetchCompletedAssignments();
            setEditingRowId(null);
            setTempTargetDate("");

            // Clear history cache for this item
            setHistoryData(prev => {
                const newState = { ...prev };
                delete newState[recordId];
                return newState;
            });

            if (onActionComplete) onActionComplete();
            window.dispatchEvent(new Event('refreshHazopCounts'));

        } catch (err) {
            console.error(err);
            showToast("Failed to update target date", "error");
        } finally {
            setActionLoading(false);
        }
    };
    // --- COMPLETE TASK HANDLERS ---
    const handleCompleteTask = () => {
        setConfirmation({
            assignmentId: selectedRecord.assignmentId,
            completeTask: true,
            message: "Are you sure you want to mark this task as completed?",
        });
    };


    const handleDirectComplete = async (assignmentId) => {
        setActionLoading(true);
        const currentDate = getTodayString();

        try {
            await axios.post(
                `http://${strings.localhost}/api/recommendation/assign/completeTask`,
                {},
                {
                    params: {
                        assignmentId: assignmentId,
                        empCode: empCode,
                        completionDate: currentDate,
                    },
                }
            );

            showToast("Task marked as completed", "success");
            fetchCompletedAssignments();
            if (onActionComplete) onActionComplete();
            window.dispatchEvent(new Event('refreshHazopCounts'));
        } catch (err) {
            console.error(err);
            showToast("Failed to complete task", "error");
        } finally {
            setActionLoading(false);
        }
    };


    const confirmCompletion = async () => {
        if (!confirmation) return;
        setActionLoading(true);
        const currentDate = getTodayString();

        try {
            await axios.post(
                `http://${strings.localhost}/api/recommendation/assign/completeTask`,
                {},
                {
                    params: {
                        assignmentId: confirmation.assignmentId,
                        empCode: empCode,
                        completionDate: currentDate,
                    },
                }
            );

            showToast("Task marked as completed", "success");
            fetchCompletedAssignments();
            setSelectedRecord(null);
            setConfirmation(null);
            if (onActionComplete) onActionComplete();
            window.dispatchEvent(new Event('refreshHazopCounts'));
        } catch (err) {
            console.error(err);
            showToast("Failed to complete task", "error");
            setConfirmation(null);
        } finally {
            setActionLoading(false);
        }
    };

    const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
        return (
            <div className="confirm-overlay">
                <div className="confirm-box">
                    <p>{message}</p>
                    <div className="confirm-buttons">
                        <button type="button" onClick={onCancel} className="cancel-btn">No</button>
                        <button type="button" onClick={onConfirm} className="confirm-btn">Yes</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* --- TABLE 1: IN PROGRESS --- */}
            <h4>In-Progress Recommendations</h4>
            <table className="hazoplist-table">
                <thead>
                    <tr>
                        <th>Node Ref No</th>
                        <th>Deviation</th>
                        <th>Recommendation</th>
                        <th>Assigned By</th>
                        <th>Target Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {inProgressList.length === 0 ? (
                        <tr><td colSpan={7}>No In-Progress Recommendations</td></tr>
                    ) : (

                        inProgressList.map((rec, idx) => (
                            <tr key={rec.id} className={expandedRowId === rec.id ? "expanded-row" : ""} onClick={() => toggleRow(rec.id)}>
                                <td>
                                    {rec.javaHazopNodeRecommendation?.javaHazopNode?.nodeNumber
                                        ? rec.javaHazopNodeRecommendation.javaHazopNodeDetail?.nodeDetailNumber != null
                                            ? `${rec.javaHazopNodeRecommendation.javaHazopNode.nodeNumber}.${rec.javaHazopNodeRecommendation.javaHazopNodeDetail.nodeDetailNumber}`
                                            : rec.javaHazopNodeRecommendation.javaHazopNode.nodeNumber
                                        : '-'}
                                </td>

                                <td className={`truncate-cell ${expandedRowId === rec.id ? "expanded-cell" : ""}`}
                                    title="Click to view discussion details"
                                    onClick={(e) => handleNavigateToDetail(e, rec)}
                                    style={{ cursor: 'pointer', color: '#319795', fontWeight: '600' }}
                                >
                                    {expandedRowId === rec.id
                                        ? rec.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation
                                        : truncateWords(rec.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation || "-", 10)}
                                </td>

                                <td className={`truncate-cell ${expandedRowId === rec.id ? "expanded-cell" : ""}`} title={rec.javaHazopNodeRecommendation?.recommendation}>
                                    {expandedRowId === rec.id
                                        ? rec.javaHazopNodeRecommendation?.recommendation
                                        : truncateWords(rec.javaHazopNodeRecommendation?.recommendation || "-", 10)}
                                </td>

                                <td>{rec.createdByName || "-"}</td>

                                {/* --- ADDED INLINE EDIT LOGIC HERE --- */}
                                <td onClick={(e) => e.stopPropagation()}>
                                    {editingRowId === rec.id ? (
                                        <div className="inline-action-group">
                                            <input
                                                type="date"
                                                className="inline-date-input"
                                                value={tempTargetDate}
                                                min={getTodayString()}
                                                onChange={(e) => setTempTargetDate(e.target.value)}
                                            />
                                            <div className="inline-btn-group">
                                                <button className="inline-save-btn" onClick={() => handleSaveDate(rec.id)} title="Save">
                                                    <FaCheck />
                                                </button>
                                                <button className="inline-cancel-btn" onClick={handleCancelEdit} title="Cancel">
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        formatDate(rec.targetDate || "-")
                                    )}
                                </td>

                                <td onClick={(e) => e.stopPropagation()}>
                                    <div className="dropdown" style={{ display: "inline-block" }}>
                                        <button className="dots-button" onClick={() => toggleDropdown(rec.id)}>
                                            <FaEllipsisV />
                                        </button>
                                        {openDropdown === rec.id && (
                                            <div className="dropdown-content">
                                                {/* <button onClick={() => openUpdatePopup(rec)}>
                                                    <FaEye /> View
                                                </button> */}

                                                {/* --- RE-ADDED CHANGE TARGET DATE BUTTON --- */}
                                                <button onClick={() => handleEditClick(rec)}>
                                                    <FaCalendarAlt /> Change target date
                                                </button>
                                                <button onClick={() => handleDirectComplete(rec.id)}>
                                                    <FaCheck /> Complete
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


            {/* --- TABLE 2: OVERDUE ASSIGNMENTS --- */}
            <h4 style={{ color: "#e53e3e" }}>Overdue Assignments</h4>
            <table className="hazoplist-table">
                <thead>
                    <tr>
                        <th>Node Ref No</th>
                        <th>Deviation</th>
                        <th>Recommendation</th>
                        <th>Target Date</th>
                        <th>Status</th>
                        <th>Overdue Days</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {overdueList.length === 0 ? (
                        <tr><td colSpan={8}>No Overdue Assignments</td></tr>
                    ) : (
                        overdueList.map((rec, idx) => (
                            <React.Fragment key={rec.id}>
                                <tr className={expandedRowId === rec.id ? "expanded-row" : ""} onClick={() => toggleRow(rec.id)}>
                                    <td>
                                        {rec.javaHazopNodeRecommendation?.javaHazopNode?.nodeNumber
                                            ? rec.javaHazopNodeRecommendation.javaHazopNodeDetail?.nodeDetailNumber != null
                                                ? `${rec.javaHazopNodeRecommendation.javaHazopNode.nodeNumber}.${rec.javaHazopNodeRecommendation.javaHazopNodeDetail.nodeDetailNumber}`
                                                : rec.javaHazopNodeRecommendation.javaHazopNode.nodeNumber
                                            : '-'}
                                    </td>

                                    <td className={`truncate-cell ${expandedRowId === rec.id ? "expanded-cell" : ""}`}
                                        title="Click to view discussion details"
                                        onClick={(e) => handleNavigateToDetail(e, rec)}
                                        style={{ cursor: 'pointer', color: '#e53e3e', fontWeight: '600' }}
                                    >
                                        {expandedRowId === rec.id
                                            ? rec.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation
                                            : truncateWords(rec.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation || "-", 10)}
                                    </td>

                                    <td className={`truncate-cell ${expandedRowId === rec.id ? "expanded-cell" : ""}`}>
                                        {expandedRowId === rec.id
                                            ? rec.javaHazopNodeRecommendation?.recommendation
                                            : truncateWords(rec.javaHazopNodeRecommendation?.recommendation || "-", 10)}
                                    </td>

                                    <td onClick={(e) => e.stopPropagation()}>
                                        {editingRowId === rec.id ? (
                                            <div className="inline-action-group">
                                                <input
                                                    type="date"
                                                    className="inline-date-input"
                                                    value={tempTargetDate}
                                                    min={getTodayString()}
                                                    onChange={(e) => setTempTargetDate(e.target.value)}
                                                />
                                                <div className="inline-btn-group">
                                                    <button className="inline-save-btn" onClick={() => handleSaveDate(rec.id)} title="Save">
                                                        <FaCheck />
                                                    </button>
                                                    <button className="inline-cancel-btn" onClick={handleCancelEdit} title="Cancel">
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            formatDate(rec.targetDate || "-")
                                        )}
                                    </td>

                                    <td style={{ color: "red", fontWeight: "bold" }}>Overdue</td>
                                    <td style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>
                                        {getOverdueDays(rec.targetDate)} Days
                                    </td>

                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="dropdown" style={{ display: "inline-block" }}>
                                            <button className="dots-button" onClick={() => toggleDropdown(rec.id)}>
                                                <FaEllipsisV />
                                            </button>
                                            {openDropdown === rec.id && (
                                                <div className="dropdown-content">
                                                    <button onClick={() => handleEditClick(rec)}>
                                                        <FaCalendarAlt /> Change target date
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>

                                {/* --- EXPANDED ROW FOR HISTORY/DETAILS --- */}
                                {expandedRowId === rec.id && (
                                    <tr className="detail-row">
                                        <td colSpan="9">
                                            <div className="detail-panel">
                                                <div className="detail-grid">
                                                    <div className="detail-item full-width">
                                                        <span className="detail-label">Deviation:</span>
                                                        <p className="detail-text">{rec.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation}</p>
                                                    </div>
                                                    <div className="detail-item full-width">
                                                        <span className="detail-label">Recommendation:</span>
                                                        <p className="detail-text">{rec.javaHazopNodeRecommendation?.recommendation}</p>
                                                    </div>
                                                    {/* <div className="detail-item">
                                                        <span className="detail-label">Management Remark:</span>
                                                        <p className="detail-text">{rec.javaHazopNodeRecommendation?.remarkbyManagement || "No remarks"}</p>
                                                    </div> */}
                                                    <div className="detail-item full-width">
                                                        <span className="detail-label"><FaHistory /> Target Date History:</span>
                                                        <div className="history-container detail-text">
                                                            {loadingHistory ? (
                                                                <small>Loading history...</small>
                                                            ) : (
                                                                historyData[rec.id] && historyData[rec.id].length > 0 ? (
                                                                    <ul className="history-list">
                                                                        {historyData[rec.id]
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
                                                        <p className="detail-text">{formatDate(rec.CompletionDate || "-")}</p>
                                                    </div>

                                                    <div className="detail-item">
                                                        <span className="detail-label">Assigned To:</span>
                                                        <p className="detail-text">{rec.assignToEmpCode} ({rec.assignWorkDate})</p>
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

            {/* --- MODALS & POPUPS --- */}

            {/* View Popup - Only accessible via In-Progress table now */}
            {/* {selectedRecord && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h5 className='centerText'>Recommendation Details</h5>
                        <div className="details-row">
                            <span className="label">Recommendation:</span>
                            <span className="value">{selectedRecord.javaHazopNodeRecommendation?.recommendation || '-'}</span>
                        </div>
                        <div className="details-row">
                            <span className="label">Department:</span>
                            <span className="value">{selectedRecord.javaHazopNodeRecommendation?.department || '-'}</span>
                        </div>
                        <div className="details-row">
                            <span className="label">Remark:</span>
                            <span className="value">{selectedRecord.javaHazopNodeRecommendation?.remarkbyManagement || '-'}</span>
                        </div>
                        <div className="details-row">
                            <span className="label">Responsible:</span>
                            <span className="value">{selectedRecord.javaHazopNodeRecommendation?.responsibility || '-'}</span>
                        </div>
                        <div className="confirm-buttons">
                            <button type="button" className="cancel-btn" onClick={() => setSelectedRecord(null)}>
                                Close
                            </button>
                            <button type="button" className="confirm-btn" onClick={handleCompleteTask}>
                                Complete task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmation && (
                <ConfirmationPopup
                    message={confirmation.message}
                    onConfirm={confirmCompletion}
                    onCancel={() => setConfirmation(null)}
                />
            )} */}

            {actionLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
        </div>
    );
};

export default CompleteRecommendationApproval;