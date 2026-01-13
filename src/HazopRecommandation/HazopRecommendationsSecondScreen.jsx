import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../string";
import { showToast, formatDate, truncateText } from "../CommonUI/CommonUI";
import { FaHistory, FaSearch, FaChevronUp, FaChevronDown, FaEllipsisV, FaCheck, FaTimes, FaCalendarAlt } from "react-icons/fa";
import '../styles/global.css';
import { useNavigate } from "react-router-dom";
import './Recommandation.css';

const HazopRecommendationsSecondScreen = ({ hazopId }) => {
    const [data, setData] = useState({
        rejected: [],
        accepted: [],
        assigned: [],
        notAssigned: [],
    });

    const [loading, setLoading] = useState(true);

    // --- Dropdown & Row Expansion ---
    const [openDropdown, setOpenDropdown] = useState(null);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [searchResults, setSearchResults] = useState({});
    const [searchInputs, setSearchInputs] = useState({});
    const [selectedEmployees, setSelectedEmployees] = useState({});
    const [assigningIds, setAssigningIds] = useState([]);
    const [historyData, setHistoryData] = useState({});
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [editingDateRowId, setEditingDateRowId] = useState(null);
    const [tempTargetDate, setTempTargetDate] = useState("");
    const [isSending, setIsSending] = useState(false);

    const navigate = useNavigate();
    const empCode = localStorage.getItem("empCode");

    // --- Core Data Fetching ---
    // Modified to accept 'isRefresh' to prevent full page loading spinner on updates
    const fetchData = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const res = await axios.get(
                `${strings.localhost}/api/recommendation/assign/getAllByRegistration/${hazopId}`
            );
            setData({
                rejected: res.data.rejected ?? [],
                accepted: res.data.accepted ?? [],
                assigned: res.data.assigned ?? [],
                notAssigned: res.data.notAssigned ?? [],
            });
        } catch (error) {
            console.error("API Error:", error);
            showToast("Failed to fetch records", "error");
        } finally {
            if (!isRefresh) setLoading(false);
        }
    };

    useEffect(() => {
        if (hazopId) fetchData();
    }, [hazopId]);

    // --- History Fetching Logic ---
    const fetchHistory = async (assignmentId) => {
        // Always fetch fresh history if expanding row to see latest updates
        // if (historyData[assignmentId]) return; 

        setLoadingHistory(true);
        try {
            const res = await axios.get(`${strings.localhost}/api/nodeRecommendation/getByAssignment?assignmentId=${assignmentId}`);
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

    // --- Row Expansion Logic ---
    const toggleRow = (id) => {
        if (editingDateRowId === id) return; // Don't collapse if editing
        const newExpandedId = expandedRowId === id ? null : id;
        setExpandedRowId(newExpandedId);

        if (newExpandedId) {
            fetchHistory(id);
        }
    };

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    // --- Inline Date Edit Handlers ---
    const handleEditDateClick = (item) => {
        setEditingDateRowId(item.id);
        setOpenDropdown(null);
        setExpandedRowId(null);
        const existingDate = item.targetDate ? item.targetDate.split('T')[0] : "";
        setTempTargetDate(existingDate);
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
                `${strings.localhost}/api/nodeRecommendation/saveRecord`,
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

            // Call fetchData with isRefresh=true to update data without spinner
            await fetchData(true);

            // Also refresh history for this specific item if needed
            fetchHistory(id);

        } catch (err) {
            console.error("Error saving date:", err);
            showToast("Failed to update target date", "error");
        } finally {
            setIsSending(false);
        }
    };

    const renderDropdownContent = (item) => (
        <div className="dropdown-content">
            <button onClick={(e) => { e.stopPropagation(); handleEditDateClick(item); }}>
                <FaCalendarAlt /> Change Target Date
            </button>
        </div>
    );

    const handleNavigateToDetail = (e, rec) => {
        e.stopPropagation();
        const targetNodeId = rec.javaHazopNode?.id || rec.javaHazopNodeRecommendation?.javaHazopNode?.id;
        const targetDetailId = rec.javaHazopNodeDetail?.id || rec.javaHazopNodeRecommendation?.javaHazopNodeDetail?.id;

        if (targetNodeId && targetDetailId) {
            navigate('/ViewNodeDiscussion', {
                state: { nodeId: targetNodeId, detailId: targetDetailId }
            });
        } else {
            showToast("Navigation details missing", "error");
        }
    };

    // --- Search & Assign Logic ---
    const handleSearchChange = async (recId, value) => {
        setSearchInputs(prev => ({ ...prev, [recId]: value }));
        setSelectedEmployees(prev => ({ ...prev, [recId]: null }));
        if (value.length < 2) {
            setSearchResults(prev => ({ ...prev, [recId]: [] }));
            return;
        }
        try {
            const res = await axios.get(`${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`);
            setSearchResults(prev => ({ ...prev, [recId]: res.data || [] }));
        } catch (err) { console.error(err); }
    };

    const handleSelectEmployee = (recId, emp) => {
        setSelectedEmployees(prev => ({ ...prev, [recId]: emp }));
        setSearchInputs(prev => ({ ...prev, [recId]: emp.empCode }));
        setSearchResults(prev => ({ ...prev, [recId]: [] }));
    };

    const handleAssign = async (recId) => {
        const employee = selectedEmployees[recId];
        if (!employee) return;
        setAssigningIds(prev => [...prev, recId]);
        try {
            await axios.post(`${strings.localhost}/api/recommendation/assign/save`, null, {
                params: {
                    recommendationId: recId,
                    createdByEmpCode: employee.empCode,
                    assignToEmpCode: employee.empCode,
                    assignWorkDate: new Date().toISOString().split("T")[0]
                }
            });
            showToast("Employee assigned successfully!", "success");
            fetchData(true); // Background refresh
        } catch (err) {
            showToast("Failed to assign employee", "error");
        } finally {
            setAssigningIds(prev => prev.filter(id => id !== recId));
            setSelectedEmployees(prev => ({ ...prev, [recId]: null }));
            setSearchInputs(prev => ({ ...prev, [recId]: "" }));
        }
    };

    if (loading) return <p className="loading">Loading...</p>;


      const getFullName = (user) =>
        [user.firstName, user.middleName, user.lastName]
            .filter(Boolean)
            .join(" ");
    return (
        <div>
            {/* --- NOT ASSIGNED TABLE --- */}
            {data.notAssigned.length > 0 && (
                <div className="assigned-table-wrapper not-assigned">
                    <h5>Not Assigned</h5>
                    <table className="assigned-table">
                        <thead>
                            <tr>
                                <th>Node Ref No</th>
                                <th>Deviation</th>
                                <th>Recommendation</th>
                                <th>Assign Employee</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.notAssigned.map((item, index) => (
                                <tr key={item.id} className={expandedRowId === item.id ? "expanded-row" : ""} onClick={() => toggleRow(item.id)}>
                                    {/* <td className="sr-no">{index + 1}</td> */}
                                    <td>
                                        {item.javaHazopNode?.nodeNumber && item.javaHazopNodeDetail?.nodeDetailNumber
                                            ? `${item.javaHazopNode.nodeNumber}.${item.javaHazopNodeDetail.nodeDetailNumber}`
                                            : '-'}
                                    </td>
                                    <td className="truncate-cell" onClick={(e) => handleNavigateToDetail(e, item)} style={{ cursor: 'pointer', color: '#319795', fontWeight: '600' }}>
                                        {truncateText(item.javaHazopNodeDetail?.deviation, 50)}
                                    </td>
                                    <td className="truncate-cell">{truncateText(item.recommendation, 50)}</td>
                                    <td className="assign-employee">
                                        <div className="search-bar-table" onClick={e => e.stopPropagation()}>
                                            <input type="text" placeholder="Search..." value={searchInputs[item.id] || ""} onChange={e => handleSearchChange(item.id, e.target.value)} />
                                            <FaSearch className="search-icon-table" />
                                            {searchResults[item.id]?.length > 0 && (
                                                <ul className="search-results-table">
                                                    {searchResults[item.id].map(emp => (
                                                        <li key={emp.empCode} onClick={() => handleSelectEmployee(item.id, emp)}>
                                                            {getFullName(emp)} ({emp.empCode}) – ({emp.emailId || "NA"})                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="confirm-btn" onClick={(e) => { e.stopPropagation(); handleAssign(item.id); }} disabled={!selectedEmployees[item.id] || assigningIds.includes(item.id)}>
                                            {assigningIds.includes(item.id) ? "Assigning..." : "Assign"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- ASSIGNED TABLE --- */}
            {data.assigned.length > 0 && (
                <div className="assigned-table-wrapper assigned">
                    <h5>Assigned</h5>
                    <table className="assigned-table">
                        <thead>
                            <tr>
                                <th>Ref No</th>
                                <th>Deviation</th>
                                <th>Recommendation</th>
                                <th>Created By</th>
                                <th>Assigned To</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.assigned.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.javaHazopNodeRecommendation?.javaHazopNode?.nodeNumber}</td>
                                    <td className="truncate-cell">{truncateText(item.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation, 50)}</td>
                                    <td className="truncate-cell">{truncateText(item.javaHazopNodeRecommendation?.recommendation ?? "-", 50)}</td>
                                    <td>{item.createdByName || '-'}</td>
                                    <td>{item.assignToEmpCode || '-'}</td>
                                    <td>{item.assignWorkDate ? formatDate(item.assignWorkDate) : "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- ACCEPTED TABLE (With History & Edit Date) --- */}
            {data.accepted.length > 0 && (
                <div className="assigned-table-wrapper accepted">
                    <h5>Accepted</h5>
                    <table className="assigned-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                <th>Ref No</th>
                                <th>Deviation</th>
                                <th>Recommendation</th>
                                <th>Assigned To</th>
                                <th>Accepted By</th>
                                <th>Target Date</th>
                                <th style={{ width: '50px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.accepted.map((item) => (
                                <React.Fragment key={item.id}>
                                    <tr
                                        className={expandedRowId === item.id ? "main-row expanded" : "main-row"}
                                        onClick={() => toggleRow(item.id)}
                                    >
                                        <td className="expand-icon-cell">
                                            {expandedRowId === item.id ? <FaChevronUp /> : <FaChevronDown />}
                                        </td>

                                        <td>
                                            {item.javaHazopNodeRecommendation?.javaHazopNode?.nodeNumber &&
                                                item.javaHazopNodeRecommendation?.javaHazopNodeDetail?.nodeDetailNumber
                                                ? `${item.javaHazopNodeRecommendation.javaHazopNode.nodeNumber}.${item.javaHazopNodeRecommendation.javaHazopNodeDetail.nodeDetailNumber}`
                                                : (item.javaHazopNodeRecommendation?.javaHazopNode?.nodeNumber || '-')}
                                        </td>
                                        <td className="truncate-cell" title="Click to view details" onClick={(e) => handleNavigateToDetail(e, item)} style={{ cursor: 'pointer', color: '#319795' }}>
                                            {truncateText(item.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation, 30)}
                                        </td>

                                        <td className="truncate-cell">
                                            {truncateText(item.javaHazopNodeRecommendation?.recommendation ?? "-", 30)}
                                        </td>

                                        <td>{item.assignToEmpCode}</td>
                                        <td>{item.acceptedByEmployeeName}</td>

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
                                                formatDate(item.targetDate) || "-"
                                            )}
                                        </td>

                                        <td onClick={(e) => e.stopPropagation()}>
                                            {editingDateRowId !== item.id && (
                                                <div className="dropdown top-header">
                                                    <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
                                                        <FaEllipsisV />
                                                    </button>
                                                    {openDropdown === item.id && renderDropdownContent(item)}
                                                </div>
                                            )}
                                        </td>
                                    </tr>

                                    {expandedRowId === item.id && (
                                        <tr className="detail-row">
                                            <td colSpan="8">
                                                <div className="detail-panel">
                                                    <div className="detail-grid">
                                                        <div className="detail-item full-width">
                                                            <span className="detail-label">Deviation:</span>
                                                            <p className="detail-text">{item.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation}</p>
                                                        </div>
                                                        <div className="detail-item full-width">
                                                            <span className="detail-label">Recommendation:</span>
                                                            <p className="detail-text">{item.javaHazopNodeRecommendation?.recommendation}</p>
                                                        </div>

                                                        <div className="detail-item full-width">
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
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- REJECTED TABLE (Standard View) --- */}
            {data.rejected.length > 0 && (
                <div className="assigned-table-wrapper rejected">
                    <h5>Rejected</h5>
                    <table className="assigned-table">
                        <thead>
                            <tr>
                                <th>Ref No</th>
                                <th>Deviation</th>
                                <th>Recommendation</th>
                                <th>Assigned To</th>
                                <th>Rejected By</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.rejected.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.javaHazopNodeRecommendation?.javaHazopNode?.nodeNumber}</td>
                                    <td className="truncate-cell">{truncateText(item.javaHazopNodeRecommendation?.javaHazopNodeDetail?.deviation, 50)}</td>
                                    <td className="truncate-cell">{truncateText(item.javaHazopNodeRecommendation?.recommendation ?? "-", 50)}</td>
                                    <td>{item.assignToEmpCode}</td>
                                    <td>{item.acceptedByEmployeeName}</td>
                                    <td>{item.assignWorkDate ? formatDate(item.assignWorkDate) : "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HazopRecommendationsSecondScreen;