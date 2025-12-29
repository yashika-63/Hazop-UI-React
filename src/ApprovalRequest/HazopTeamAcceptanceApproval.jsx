import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEllipsisV, FaEye, FaTimes } from "react-icons/fa";
import './Approval.css';
import { formatDate, showToast, truncateWords } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { useNavigate } from "react-router-dom";


const HazopTeamAcceptanceApproval = ({ onActionComplete }) => {
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [hazopLoading, setHazopLoading] = useState(false);

    const navigate = useNavigate();
    const empCode = localStorage.getItem("empCode");

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };


    const fetchTeamData = async () => {
        try {
            const response = await axios.get(`http://${strings.localhost}/api/hazopTeam/getDataByEmployee`, {
                params: {
                    empCode,
                    sendForAcceptance: 1,
                    actionTaken: 0
                }
            });
            const data = Array.isArray(response.data) ? response.data : [];
            setTeamData(data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch HAZOP team data.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTeamData();
    }, [empCode]);

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
                    <button type="button" onClick={() => handleViewClick(item)}>
                        <FaEye /> View Hazop
                    </button>
                </div>
            )}
        </div>
    );

    const openRecordModal = async (record) => {
        setSelectedRecord(record);
        setShowModal(true);
    };
    const handleViewClick = (item) => {
        localStorage.setItem("hazopId", item.javaHazopRegistration?.id);
        navigate("/HazopView");
    };
    const closeModal = () => {
        setSelectedRecord(null);
        setShowModal(false);
        setShowConfirm(false);
        setConfirmAction(null);
    };

    const handleApproveReject = (action) => {
        setConfirmAction(action);
        setShowConfirm(true);
    };

    const confirmActionApi = async () => {
        if (!selectedRecord) return;
        setProcessing(true);
        try {
            const teamId = selectedRecord.id;
            const empCode = selectedRecord.empCode;

            await axios.put(`http://${strings.localhost}/api/hazopTeam/updateAction`, null, {
                params: {
                    teamId,
                    empCode,
                    action: confirmAction
                }
            });

            showToast(`Record ${confirmAction ? "approved" : "rejected"} successfully.`, 'success');
            closeModal();

            setTeamData(prev => prev.filter(item => item.id !== teamId));
            if (onActionComplete) onActionComplete();
            window.dispatchEvent(new Event('refreshHazopCounts'));
            
        } catch (err) {
            console.error(err);

            const message = err.response?.data || "Failed to perform action.";
            showToast(message, 'error');
        } finally {
            setProcessing(false);
        }
    };



    return (
        <div>
            <table className="hazoplist-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Hazop Title</th>
                        <th>Hazop Site</th>
                        <th>Department</th>
                        <th>Creation Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {teamData.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="no-data">
                                No pending HAZOP approvals.
                            </td>
                        </tr>
                    ) : (
                        teamData.map((item, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>{truncateWords(item.javaHazopRegistration?.hazopTitle || '-')}</td>
                                <td>{truncateWords(item.javaHazopRegistration?.site || '-')}</td>
                                <td>{item.javaHazopRegistration?.department || "-"}</td>
                                <td>{formatDate(item.javaHazopRegistration?.hazopCreationDate) || "-"}</td>
                                <td>{renderDropdown(item)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {showModal && selectedRecord && (
                <div className="modal-overlay">
                    <div className="modal-body">

                        <div className="modal-header">
                            <buttton type="button" className="close-btn" onClick={closeModal}><FaTimes /></buttton>
                            <div className="centerText">HAZOP  Details</div>
                        </div>

                        {hazopLoading ? (
                            <p>Loading HAZOP details...</p>
                        ) : teamData ? (
                            <div className="details-container">

                                <div className="details-row">
                                    <span className="label">Title:</span>
                                    <span className="value">{selectedRecord.javaHazopRegistration?.hazopTitle || "-"}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Site:</span>
                                    <span className="value">{selectedRecord.javaHazopRegistration?.site || "-"}</span>
                                </div>

                                <div className="details-row">
                                    <span className="label">Description:</span>
                                    <span className="value">{selectedRecord.javaHazopRegistration?.description || "-"}</span>
                                </div>

                                <div className="details-row">
                                    <span className="label">Created By:</span>
                                    <span className="value">{selectedRecord.javaHazopRegistration?.empCode || "-"}</span>
                                </div>

                                <div className="details-row">
                                    <span className="label">Hazop Creation Date:</span>
                                    <span className="value">{formatDate(selectedRecord.javaHazopRegistration?.hazopCreationDate) || "-"}</span>
                                </div>

                            </div>
                        ) : (
                            <p className="no-data1">No HAZOP details found.</p>
                        )}

                        <div className="details-container">

                            <div className="details-row">
                                <span className="label">Team Member:</span>
                                <span className="value">{selectedRecord.employeeName || selectedRecord.empCode}</span>
                            </div>

                            <div className="details-row">
                                <span className="label">Department:</span>
                                <span className="value">{selectedRecord.javaHazopRegistration?.department || "-"}</span>
                            </div>

                            <div className="details-row">
                                <span className="label">Email:</span>
                                <span className="value">{selectedRecord.emailId || "-"}</span>
                            </div>

                            <div className="details-row">
                                <span className="label">Send For Acceptance:</span>
                                <span className="value">{selectedRecord.sendForAcceptance ? "Yes" : "No"}</span>
                            </div>

                            <div className="details-row">
                                <span className="label">Action Taken:</span>
                                <span className="value">{selectedRecord.actionTaken ? "Yes" : "No"}</span>
                            </div>
                        </div>


                        <div className="center-controls">
                            <button type="button" disabled={processing} onClick={() => handleApproveReject(true)} className="approveBtn">Approve</button>
                            <button type="button" disabled={processing} onClick={() => handleApproveReject(false)} className="rejectBtn">Reject</button>
                            <button type="button" disabled={processing} onClick={closeModal} className="cancel-btn">Close</button>
                        </div>


                        {/* Custom Confirmation Modal */}
                        {showConfirm && (
                            <div className="confirm-overlay">
                                <div className="confirm-box">
                                    <h4>Confirmation</h4>
                                    <p>Are you sure you want to {confirmAction ? "APPROVE" : "REJECT"} this record?</p>
                                    <div className="confirm-buttons">
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() => setShowConfirm(false)}
                                            className="cancel-btn"
                                        >
                                            No
                                        </button>

                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={confirmActionApi}
                                            className="confirm-btn"
                                        >
                                            {processing ? (
                                                <>
                                                    <span className="spinner"></span> {confirmAction ? "Approving..." : "Rejecting..."}
                                                </>
                                            ) : (
                                                "Yes"
                                            )}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                </div>

            )}
        </div>
    );
};

export default HazopTeamAcceptanceApproval;
