import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaExclamationTriangle } from 'react-icons/fa'; 
import '../styles/global.css';
import { getRiskColor, showToast, truncateText } from '../CommonUI/CommonUI';
import { strings } from '../string';

const HazopAllRecommendations = ({ hazopId }) => {

    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [isHazopComplete, setIsHazopComplete] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);
    const [globalSearch, setGlobalSearch] = useState("");
    const [globalResults, setGlobalResults] = useState([]);
    const [selectedGlobalEmployee, setSelectedGlobalEmployee] = useState(null);
    const navigate = useNavigate();

    const toggleRow = (id) => {
        if (loading) return;
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    /* =====================================
       FETCH DATA & CHECK STATUS
       ===================================== */
    useEffect(() => {
        if (!hazopId) return;

        const loadData = async () => {
            setLoading(true);
            setStatusLoading(true);
            try {
                // 1. Fetch Recommendations
                const recRes = await axios.get(
                    `${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`
                );
                setRecommendations(recRes.data ?? []);

                // 2. Check Hazop Status
                const statusRes = await axios.get(
                    `${strings.localhost}/api/hazopNode/check-status/${hazopId}`
                );

                // Set status based on allNodesComplete flag
                if (statusRes.data && statusRes.data.allNodesComplete === true) {
                    setIsHazopComplete(true);
                } else {
                    setIsHazopComplete(false);
                }

            } catch (err) {
                console.error(err);
                showToast("Failed to load data", "error");
            } finally {
                setLoading(false);
                setStatusLoading(false);
            }
        };

        loadData();
    }, [hazopId]);

    const handleNavigateToDetail = (e, rec) => {
        e.stopPropagation();
        const targetNodeId = rec.javaHazopNode?.id || hazopId;
        const targetDetailId = rec.javaHazopNodeDetail?.id;

        if (targetNodeId && targetDetailId) {
            navigate('/ViewNodeDiscussion', {
                state: { nodeId: targetNodeId, detailId: targetDetailId }
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
                `${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`
            );
            setGlobalResults(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const getFullName = (user) =>
        [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ");

    /* =====================================
       SEND ALL RECOMMENDATIONS
       ===================================== */
    const handleSendAll = async () => {
        if (!isHazopComplete) {
            showToast("Cannot send: All nodes are not completed yet.", "error");
            return;
        }
        if (!selectedGlobalEmployee) {
            showToast("Please select a reviewer first", "error");
            return;
        }
        if (isAlreadySent) {
            showToast("Recommendations already sent for review", "info");
            return;
        }
        const empCode = selectedGlobalEmployee.empCode;

        const draftRecs = recommendations.filter(
            (rec) => rec.sendForVerification === false &&
                rec.sendForVerificationAction === false &&
                rec.completionStatus !== true
        );

        if (draftRecs.length === 0) {
            showToast("No new draft recommendations to send.", "info");
            return;
        }

        setLoading(true);
        try {
            for (const rec of draftRecs) {
                await axios.put(
                    `${strings.localhost}/api/nodeRecommendation/sendForVerification/${rec.id}/${empCode}`
                );
            }
            showToast(`${draftRecs.length} recommendations sent for review!`, "success");

            // Refresh data
            const recRes = await axios.get(`${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`);
            setRecommendations(recRes.data ?? []);

        } catch (err) {
            console.error(err);
            showToast("Failed to send recommendations", "error");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (rec) => {
        if (rec.sendForVerification === false && rec.sendForVerificationAction === true && rec.sendForVerificationActionStatus === true) {
            return <span className="status-badge1 status-badge1-completed">Completed</span>;
        }
        if (rec.sendForVerification === false && rec.sendForVerificationAction === false && rec.sendForVerificationActionStatus === true) {
            return <span className="status-badge1 status-badge1-rejected">Rejected</span>;
        }
        if (rec.sendForVerification === false && rec.sendForVerificationAction === false && rec.sendForVerificationActionStatus === false) {
            return <span className="status-badge1 status-badge1-pending">Pending</span>;
        }
        return <span className="status-badge1 status-badge1-draft">Sent</span>;
    };

    const isAlreadySent = recommendations.some((rec) => rec.sendForVerification === true);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="nd-back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '10px' }} disabled={loading}>
                    ← Back
                </button>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            {!statusLoading && !isHazopComplete && (
                <div style={{
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    padding: '10px 15px',
                    borderRadius: '4px',
                    border: '1px solid #ffeeba',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: '400',
                    width: '980px',
                    margin: '10px auto'
                }}>
                    <FaExclamationTriangle />
                    <span>All nodes are not completed yet. You cannot send recommendations for review until all nodes are finalized.</span>
                </div>
            )}

            {/* ============================ */}
            {/* GLOBAL EMPLOYEE SELECTOR     */}
            {/* ============================ */}

            {isHazopComplete && (
                <div className="top-row">
                    <div className="search-container">
                        <div className="search-bar-wrapper">
                            <input
                                type="text"
                                placeholder="Search employee..."
                                disabled={loading || isAlreadySent}
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
                                            {getFullName(emp)} ({emp.empCode}) – ({emp.emailId || "NA"})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="right-actions">
                        {selectedGlobalEmployee && (
                            <div className="selected-emp-tag">
                                <strong>{selectedGlobalEmployee.empCode}</strong> ({selectedGlobalEmployee.emailId})
                            </div>
                        )}

                        <button
                            className="confirm-btn send-all-btn"
                            disabled={!selectedGlobalEmployee || loading || isAlreadySent}
                            onClick={handleSendAll}
                            style={{ opacity: (!selectedGlobalEmployee || isAlreadySent) ? 0.6 : 1 }}
                        >
                            {loading
                                ? "Sending..."
                                : isAlreadySent
                                    ? "Already Sent for Review"
                                    : "Send All for review"}
                        </button>
                    </div>
                </div>
            )}

            <table className="assigned-table">
                <thead>
                    <tr>
                        <th>Node Ref No</th>
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
                            <td colSpan="6" className="no-data1">No data found</td>
                        </tr>
                    ) : (
                        recommendations.map((rec) => (
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