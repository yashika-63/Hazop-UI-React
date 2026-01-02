import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/global.css";
import { strings } from "../string";
import { getRiskColor, showToast, truncateWords } from "../CommonUI/CommonUI";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

const HazopRecommendationApproval = ({ onActionComplete }) => {
    const navigate = useNavigate(); // 2. Initialize hook
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRejectId, setSelectedRejectId] = useState(null);
    const [rejectComment, setRejectComment] = useState("");
    const empCode = localStorage.getItem("empCode");
    const [expandedRowId, setExpandedRowId] = useState(null);

    const toggleRow = (id) => setExpandedRowId(expandedRowId === id ? null : id);

    const fetchRecommendations = async () => {
        if (!empCode) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/nodeRecommendation/filter?sendForVerification=true&sendForVerificationActionStatus=false&verificationResponsibleEmpCode=${empCode}`
            );
            setRecommendations(response.data || []);
        } catch (err) {
            console.error("Error fetching recommendations:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    // --- 3. NEW: Navigation Handler ---
    const handleNavigateToDetail = (e, rec) => {
        e.stopPropagation(); // Stop row expansion

        // Extract Node ID (Check root 'javaHazopNode' or nested inside detail)
        // Based on your previous JSON, it's likely 'rec.javaHazopNode?.id'
        const targetNodeId = rec.javaHazopNode?.id || rec.javaHazopNodeDetail?.hazopNodeId;

        // Extract Detail ID
        const targetDetailId = rec.javaHazopNodeDetail?.id;

        if (targetNodeId && targetDetailId) {
            navigate('/ViewNodeDiscussion', {
                state: {
                    nodeId: targetNodeId,      // Matches ViewNodeDiscussion expectations
                    detailId: targetDetailId   // Matches ViewNodeDiscussion expectations
                }
            });
        } else {
            console.error("Missing ID. Node:", targetNodeId, "Detail:", targetDetailId);
            showToast("Navigation details missing", "error");
        }
    };

    const handleApprove = async (id) => {
        setLoading(true);
        try {
            await axios.put(
                `http://${strings.localhost}/api/nodeRecommendation/verify/${id}/${empCode}/true?remark=Yes`
            );
            fetchRecommendations();
            showToast("Approved successfully.", 'success');
            if (onActionComplete) onActionComplete();
            window.dispatchEvent(new Event('refreshHazopCounts'));
        } catch (err) {
            console.error("Error approving recommendation:", err);
            showToast("Failed to approve.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectClick = (id) => {
        setSelectedRejectId(id);
        setRejectComment("");
        setShowRejectModal(true);
    };

    const handleRejectSave = async () => {
        if (!rejectComment.trim()) return;
        setLoading(true);
        try {
            await axios.put(
                `http://${strings.localhost}/api/nodeRecommendation/verify/${selectedRejectId}/${empCode}/false?remark=No`,
                { comment: rejectComment }
            );
            fetchRecommendations();
            showToast("Rejected successfully.", 'success');
            setShowRejectModal(false);
            if (onActionComplete) onActionComplete();
            window.dispatchEvent(new Event('refreshHazopCounts'));
        } catch (err) {
            console.error("Error rejecting recommendation:", err);
            showToast("Failed to reject.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectCancel = () => {
        setShowRejectModal(false);
    };

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <table className="hazoplist-table">
                <thead>
                    <tr>
                        <th>Node Ref No</th>
                        <th>Deviation</th>
                        <th>Recommendation</th>
                        <th>Department</th>
                        <th>Initial Risk rating</th>
                        <th>Final Risk rating</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {recommendations.length === 0 ? (
                        <tr>
                            <td colSpan="8">No pending recommendations found.</td>
                        </tr>
                    ) : (
                        recommendations.map((rec, index) => (
                            <tr
                                key={rec.id}
                                className={expandedRowId === rec.id ? "expanded-row" : ""}
                                onClick={() => toggleRow(rec.id)}
                            >
                                <td>
                                    {rec.javaHazopNode?.nodeNumber && rec.javaHazopNodeDetail?.nodeDetailNumber
                                        ? `${rec.javaHazopNode.nodeNumber}.${rec.javaHazopNodeDetail.nodeDetailNumber}`
                                        : '-'}
                                </td>


                                {/* 4. Clickable Deviation Cell */}
                                <td
                                    className={`truncate-cell ${expandedRowId === rec.id ? "expanded-cell" : ""}`}
                                    title="Click to view discussion details"
                                    onClick={(e) => handleNavigateToDetail(e, rec)}
                                    style={{ cursor: 'pointer', color: '#319795', fontWeight: '600' }}
                                >
                                    {expandedRowId === rec.id
                                        ? rec.javaHazopNodeDetail?.deviation
                                        : truncateWords(rec.javaHazopNodeDetail?.deviation || "-", 10)}
                                </td>

                                <td className={`truncate-cell ${expandedRowId === rec.id ? "expanded-cell" : ""}`} title={rec.recommendation}>
                                    {expandedRowId === rec.id
                                        ? rec.recommendation
                                        : truncateWords(rec.recommendation || "-", 10)}
                                </td>
                                <td>{rec.department || "N/A"}</td>
                                <td style={{ color: getRiskColor(rec.javaHazopNodeDetail?.riskRating || "-") }}>
                                    {rec.javaHazopNodeDetail?.riskRating || "-"}
                                </td>
                                <td style={{ color: getRiskColor(rec.javaHazopNodeDetail?.additionalRiskRating || "-") }}>
                                    {rec.javaHazopNodeDetail?.additionalRiskRating || "-"}
                                </td>
                                <td className="action-buttons" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className="approveBtn"
                                        onClick={() => handleApprove(rec.id)}
                                        title="Approve this recommendation"
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className="rejectBtn"
                                        onClick={() => handleRejectClick(rec.id)}
                                        title="Reject this recommendation"
                                    >
                                        No
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h3 className="centerText">Reject Recommendation</h3>
                        <textarea
                            placeholder="Enter your comment..."
                            value={rejectComment}
                            onChange={(e) => setRejectComment(e.target.value)}
                            rows={5}
                        />
                        <div className="center-controls">
                            <button type="button" onClick={handleRejectCancel} className="cancel-btn">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRejectSave}
                                disabled={!rejectComment.trim()}
                                className="confirm-btn"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HazopRecommendationApproval;