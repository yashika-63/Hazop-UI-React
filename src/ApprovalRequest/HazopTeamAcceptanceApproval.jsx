import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEllipsisV, FaEye, FaTimes } from "react-icons/fa";
import './Approval.css';
import { showToast } from "../CommonUI/CommonUI";

const HazopTeamAcceptanceApproval = () => {
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [hazopDetails, setHazopDetails] = useState(null);
    const [hazopLoading, setHazopLoading] = useState(false);

    const empCode = "Dhananjay patil";

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const response = await axios.get(`http://localhost:5559/api/hazopTeam/getDataByEmployee`, {
                    params: {
                        empCode,
                        sendForAcceptance: 1,
                        actionTaken: 0
                    }
                });
                setTeamData(response.data || []);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch HAZOP team data.");
            } finally {
                setLoading(false);
            }
        };
        fetchTeamData();
    }, []);

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

    const openRecordModal = async (record) => {
        setSelectedRecord(record);
        setShowModal(true);

        const hazopId = record.hazopId || record.id;

        setHazopLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5559/api/hazopRegistration/by-id`,
                { params: { hazopId } }
            );

            setHazopDetails(response.data);
        } catch (err) {
            console.error(err);
            showToast("Failed to load HAZOP details.", "error");
        } finally {
            setHazopLoading(false);
        }
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

            await axios.put(`http://localhost:5559/api/hazopTeam/updateAction`, null, {
                params: {
                    teamId,
                    empCode,
                    action: confirmAction
                }
            });

            showToast(`Record ${confirmAction ? "approved" : "rejected"} successfully.`, 'success');
            closeModal();

            setTeamData(prev => prev.filter(item => item.id !== teamId));
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
                        <th>HAZOP ID</th>
                        <th>Team Member</th>
                        <th>Department</th>
                        <th>Email Id</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {teamData.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="no-data">
                                No pending HAZOP approvals.
                            </td>
                        </tr>
                    ) : (
                        teamData.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.id}</td>
                                <td>{item.employeeName || item.empCode}</td>
                                <td>{item.dimension1 || "-"}</td>
                                <td>{item.emailId || '-'}</td>
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
                            <h4>HAZOP  Details</h4>
                        </div>

                        {hazopLoading ? (
                            <p>Loading HAZOP details...</p>
                        ) : hazopDetails ? (
                            <div className="details-container">

                                <div className="details-row">
                                    <span className="label">Title:</span>
                                    <span className="value">{hazopDetails.title || "-"}</span>
                                </div>

                                <div className="details-row">
                                    <span className="label">Description:</span>
                                    <span className="value">{hazopDetails.description || "-"}</span>
                                </div>

                                <div className="details-row">
                                    <span className="label">Created By:</span>
                                    <span className="value">{hazopDetails.createdBy || "-"}</span>
                                </div>

                                <div className="details-row">
                                    <span className="label">Created Date:</span>
                                    <span className="value">{hazopDetails.createdDate || "-"}</span>
                                </div>

                            </div>
                        ) : (
                            <p className="no-data1">No HAZOP details found.</p>
                        )}

                        <div className="details-container">
                            <div className="details-row">
                                <span className="label">HAZOP ID:</span>
                                <span className="value">{selectedRecord.id}</span>
                            </div>

                            <div className="details-row">
                                <span className="label">Team Member:</span>
                                <span className="value">{selectedRecord.employeeName || selectedRecord.empCode}</span>
                            </div>

                            <div className="details-row">
                                <span className="label">Department:</span>
                                <span className="value">{selectedRecord.dimension1 || "-"}</span>
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
                    </div>

                    {/* Custom Confirmation Modal */}
                    {showConfirm && (
                        <div className="confirm-overlay">
                            <div className="confirm-box">
                                <h4>Confirmation</h4>
                                <p>Are you sure you want to {confirmAction ? "APPROVE" : "REJECT"} this record?</p>
                                <div className="confirm-buttons">
                                    <button
                                        disabled={processing}
                                        onClick={() => setShowConfirm(false)}
                                        className="cancel-btn"
                                    >
                                        No
                                    </button>

                                    <button
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
            )}
        </div>
    );
};

export default HazopTeamAcceptanceApproval;
