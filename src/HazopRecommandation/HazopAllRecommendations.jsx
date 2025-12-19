import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import '../styles/global.css';
import { getRiskClass, getRiskColor, getRiskLevelText, showToast, truncateText, truncateWords } from '../CommonUI/CommonUI';
import { strings } from '../string';
const HazopAllRecommendations = ({ hazopId }) => {

    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRowId, setExpandedRowId] = useState(null);

    const [globalSearch, setGlobalSearch] = useState("");
    const [globalResults, setGlobalResults] = useState([]);
    const [selectedGlobalEmployee, setSelectedGlobalEmployee] = useState(null);
    const navigate = useNavigate();
    const toggleRow = (id) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };
    /* =====================================
       FETCH DATA
       ===================================== */
    const fetchRecommendations = async () => {
        if (!hazopId) return;

        setLoading(true);
        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`
            );

            setRecommendations(res.data ?? []);

        } catch (err) {
            console.error(err);
            showToast("Failed to load recommendations", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, [hazopId]);
    // --- NEW: Navigation Handler ---
    const handleNavigateToDetail = (e, rec) => {
        e.stopPropagation();

        // Find the Node ID (Logic handles both structure types)
        const targetNodeId = rec.javaHazopNode?.id || hazopId;

        // Find the Detail ID
        const targetDetailId = rec.javaHazopNodeDetail?.id;

        if (targetNodeId && targetDetailId) {
            navigate('/ViewNodeDiscussion', {
                state: {
                    nodeId: targetNodeId,      // Key must be 'nodeId'
                    detailId: targetDetailId   // Key must be 'detailId'
                }
            });
        } else {
            showToast("Navigation details missing", "error");
        }
    };
    /* =====================================
       HANDLE GLOBAL EMPLOYEE SEARCH
       ===================================== */
    const handleGlobalSearchChange = async (value) => {
        setGlobalSearch(value);

        if (value.length < 2) {
            setGlobalResults([]);
            return;
        }

        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`
            );

            setGlobalResults(res.data || []);

        } catch (err) {
            console.error(err);
        }
    };


    /* =====================================
       SEND ALL RECOMMENDATIONS
       ===================================== */
    const handleSendAll = async () => {
        if (!selectedGlobalEmployee) {
            showToast("Please select a reviewer first", "error");
            return;
        }

        const empCode = selectedGlobalEmployee.empCode;

        // Only target items that are NOT yet sent for review
        const draftRecs = recommendations.filter(
            (rec) => rec.sendForVerificationActionStatus === false && rec.completionStatus !== true
        );

        if (draftRecs.length === 0) {
            showToast("No new draft recommendations to send.", "info");
            return;
        }

        setLoading(true);
        try {
            for (const rec of draftRecs) {
                await axios.put(
                    `http://${strings.localhost}/api/nodeRecommendation/sendForVerification/${rec.id}/${empCode}`
                );
            }

            showToast(`${draftRecs.length} recommendations sent for review!`, "success");
            fetchRecommendations(); // Refresh data to update status to "Pending Review"
        } catch (err) {
            console.error(err);
            showToast("Failed to send recommendations", "error");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (rec) => {
        if (rec.completionStatus === true) {
            return (
                <span className="status-badge1 status-badge1-completed">
                    Completed
                </span>
            );
        }

        if (rec.sendForVerification === false && rec.sendForVerificationAction === false) {
            return (
                <span className="status-badge1 status-badge1-pending">
                    Pending
                </span>
            );
        }

        return (
            <span className="status-badge1 status-badge1-draft">
                Sent
            </span>
        );
    };

    return (
        <div>
            <button className="nd-back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '10px' }}>  ← Back </button>

            {/* ============================ */}
            {/* GLOBAL EMPLOYEE SELECTOR     */}
            {/* ============================ */}
            <div className="top-row">
                <div className="search-container">
                    <div className="search-bar-wrapper">
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={globalSearch}
                            onChange={(e) => handleGlobalSearchChange(e.target.value)}
                        />
                        <FaSearch className="search-icon-table" />

                        {globalResults.length > 0 && (
                            <ul className="search-results-table">
                                {globalResults.map((emp) => (
                                    <li
                                        key={emp.empCode}
                                        onClick={() => {
                                            setSelectedGlobalEmployee(emp);
                                            setGlobalSearch(emp.empCode);
                                            setGlobalResults([]);
                                        }}
                                    >
                                        {emp.empCode} — {emp.emailId || "NA"}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE — EMP TAG + BUTTON */}
                <div className="right-actions">
                    {selectedGlobalEmployee && (
                        <div className="selected-emp-tag">
                            <strong>{selectedGlobalEmployee.empCode}</strong> (
                            {selectedGlobalEmployee.emailId})
                        </div>
                    )}

                    <button
                        className="confirm-btn send-all-btn"
                        disabled={!selectedGlobalEmployee || loading}
                        onClick={handleSendAll}
                    >
                        {loading ? "Sending..." : "Send All for review"}
                    </button>
                </div>

            </div>


            <table className="assigned-table">
                <thead>
                    <tr>
                        <th>Node Reference No</th>
                        <th>Deviation</th>
                        <th>Recommendation</th>
                        <th>Initial Risk rating</th>
                        <th>Final Risk rating</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {recommendations.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="no-data1">No data found</td>
                        </tr>
                    ) : (
                        recommendations.map((rec, index) => (
                            <tr key={rec.id} className={expandedRowId === rec.id ? "expanded-row" : ""}
                                onClick={() => toggleRow(rec.id)}>
                                <td>
                                    {rec.javaHazopNode?.nodeNumber && rec.javaHazopNodeDetail?.nodeDetailNumber
                                        ? `${rec.javaHazopNode.nodeNumber}.${rec.javaHazopNodeDetail.nodeDetailNumber}`
                                        : '-'}
                                </td>
                                <td
                                    className={`truncate-cell ${expandedRowId === rec.id ? "expanded-cell" : ""}`}
                                    onClick={(e) => handleNavigateToDetail(e, rec)}
                                    style={{ cursor: 'pointer', color: '#319795', fontWeight: '600' }}
                                    title="Click to view discussion details"
                                >
                                    {expandedRowId === rec.id
                                        ? rec.javaHazopNodeDetail?.deviation
                                        : truncateText(rec.javaHazopNodeDetail?.deviation, 50)}
                                </td>
                                <td className={`truncate-cell ${expandedRowId === rec.id ? "expanded-cell" : ""}`}>
                                    {expandedRowId === rec.id
                                        ? rec.recommendation
                                        : truncateText(rec.recommendation, 50)}
                                </td>
                                <td style={{ color: getRiskColor(rec.javaHazopNodeDetail?.riskRating || '-') }}>
                                    {rec.javaHazopNodeDetail?.riskRating || '-'}
                                </td>
                                <td style={{ color: getRiskColor(rec.javaHazopNodeDetail?.additionalRiskRating || '-') }}>
                                    {rec.javaHazopNodeDetail?.additionalRiskRating || '-'}
                                </td>
                                <td>
                                    {getStatusBadge(rec)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

        </div>
    );
};

export default HazopAllRecommendations;
