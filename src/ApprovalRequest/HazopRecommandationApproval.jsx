import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/global.css";
import { strings } from "../string";
import { getRiskColor, truncateWords } from "../CommonUI/CommonUI";

const HazopRecommendationApproval = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRejectId, setSelectedRejectId] = useState(null);
    const [rejectComment, setRejectComment] = useState("");
    const empCode = localStorage.getItem("empCode");

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

    const handleApprove = async (id) => {
        setLoading(true);
        try {
            await axios.put(
                `http://${strings.localhost}/api/nodeRecommendation/verify/${id}/${empCode}/true?remark=Yes`
            );
            fetchRecommendations();
        } catch (err) {
            console.error("Error approving recommendation:", err);
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
            setShowRejectModal(false);
        } catch (err) {
            console.error("Error rejecting recommendation:", err);
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
                        <th>Sr.No</th>
                        <th>Recommendation</th>
                        <th>Department</th>
                        <th>Initial Risk rating</th>
                        <th>Final Risk rating</th>
                        {/* <th>Remark</th> */}
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {recommendations.length === 0 ? (
                        <tr>
                            <td colSpan="5">No recommendations found.</td>
                        </tr>
                    ) : (
                        recommendations.map((rec, index) => (
                            <tr key={rec.id}>
                                <td>{index + 1}</td>
                                <td className="description-cell" title={rec.recommendation}>
                                    {rec.recommendation}
                                </td>
                                <td>{rec.department || "N/A"}</td>
                                <td style={{ color: getRiskColor(rec.javaHazopNodeDetail?.riskRating || '-') }}>
                                    {rec.javaHazopNodeDetail?.riskRating || '-'}
                                </td>
                                <td style={{ color: getRiskColor(rec.javaHazopNodeDetail?.additionalRiskRating || '-') }}>
                                    {rec.javaHazopNodeDetail?.additionalRiskRating || '-'}
                                </td>
                                {/* <td title={rec.remarkbyManagement || ""}>{truncateWords(rec.remarkbyManagement || "N/A")}</td> */}
                                <td className="action-buttons">
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
