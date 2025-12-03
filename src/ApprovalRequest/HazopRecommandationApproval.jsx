import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/global.css";
import { strings } from "../string";
import { FaEllipsisV, FaEye, FaTimes } from "react-icons/fa";

const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="confirm-overlay">
            <div className="confirm-box">
            <h4>Confirmation</h4>
                <p>{message}</p>
                <div className="confirm-buttons">
                    <button type="button" onClick={onCancel} className="cancel-btn">No</button>
                    <button type="button" onClick={onConfirm} className="confirm-btn">Yes</button>
                </div>
            </div>
        </div>
    );
};

const HazopRecommendationApproval = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false); 
    const [actionToTake, setActionToTake] = useState(null);
    const empCode = localStorage.getItem("empCode");

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const fetchRecommendations = async () => {
        if (!empCode) {
            console.error("Employee code not found in localStorage");
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

    const openRecordModal = (record) => {
        setSelectedRecord(record);
        setShowModal(true);
    };

    const handleApprove = () => {
        setActionToTake("approve");
        setShowConfirmation(true);
    };

    const handleReject = () => {
        setActionToTake("reject");
        setShowConfirmation(true);
    };

    const handleCancel = () => {
        setShowModal(false); 
    };

    const confirmAction = async () => {
        if (!selectedRecord) return;

        const actionStatus = actionToTake === "approve" ? true : false;

        setLoading(true);

        try {
            const response = await axios.put(
                `http://${strings.localhost}/api/nodeRecommendation/verify/${selectedRecord.id}/${empCode}/${actionStatus}`
            );
            console.log("Action successful:", response.data);
            setShowModal(false); 
            setShowConfirmation(false); 
            fetchRecommendations(); 
        } catch (error) {
            console.error("Error during approval/rejection:", error);
        } finally {
            setLoading(false); 
        }
    };

    const handleConfirmationCancel = () => {
        setShowConfirmation(false); 
    };

    const renderDropdown = (item) => (
        <div className="dropdown">
            <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
                <FaEllipsisV />
            </button>

            {openDropdown === item.id && (
                <div className="dropdown-content">
                    <button type="button" onClick={() => openRecordModal(item)}>
                        <FaEye /> View
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            {recommendations.length === 0 ? (
                <p>No recommendations found.</p>
            ) : (
                <table className="hazoplist-table">
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Recommendation</th>
                            <th>Department</th>
                            <th>Remark</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recommendations.map((rec, index) => (
                            <tr key={rec.id}>
                                <td>{index + 1}</td>
                                <td>{rec.recommendation}</td>
                                <td>{rec.department || "N/A"}</td>
                                <td>{rec.remarkbyManagement || "N/A"}</td>
                                <td>{renderDropdown(rec)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showModal && selectedRecord && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <div className="modal-header">
                            <h4 className="centerText">Recommendation Details</h4>
                            <button className="close-btn" onClick={handleCancel}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div>
                                <div className="details-row">
                                    <span className="label">Recommendation:</span>
                                    <span className="value">{selectedRecord.recommendation || '-'}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Department:</span>
                                    <span className="value">{selectedRecord.department || '-'}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Remark:</span>
                                    <span className="value">{selectedRecord.remarkbyManagement || '-'}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Responsible:</span>
                                    <span className="value">{selectedRecord.responsibility || '-'}</span>
                                </div>
                            </div>
                            <div className="confirm-buttons">
                                <button type="button" onClick={handleApprove} className="approveBtn"> Approve </button>
                                <button type="button" onClick={handleReject} className="rejectBtn"> Reject </button>
                                <button type="button" onClick={handleCancel} className="cancel-btn"> Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmation && (
                <ConfirmationPopup
                    message={`Are you sure you want to ${actionToTake === 'approve' ? 'approve' : 'reject'} this recommendation?`}
                    onConfirm={confirmAction}
                    onCancel={handleConfirmationCancel}
                />
            )}
        </div>
    );
};

export default HazopRecommendationApproval;
