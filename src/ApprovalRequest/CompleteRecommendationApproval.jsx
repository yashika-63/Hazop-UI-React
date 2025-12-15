import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../string";
import { formatDate, showToast, truncateWords } from "../CommonUI/CommonUI";
import { FaEllipsisV, FaEye } from "react-icons/fa";

const CompleteRecommendationApproval = () => {
    const [completedAssignments, setCompletedAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const empCode = localStorage.getItem("empCode");


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

    const openUpdatePopup = (record) => {
        setSelectedRecord({
            assignmentId: record.id,
            ...record
        });
    };

    const handleCompleteTask = () => {
        setConfirmation({
            assignmentId: selectedRecord.assignmentId,
            completeTask: true,
            message: "Are you sure you want to mark this task as completed?",
        });
    };

    const confirmCompletion = async () => {
        if (!confirmation) return;
        setActionLoading(true);

        const currentDate = new Date().toISOString().split("T")[0];

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
                        <button type="button" onClick={onCancel} className="cancel-btn">
                            No
                        </button>
                        <button type="button" onClick={onConfirm} className="confirm-btn">
                            Yes
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h4>Completed Recommendations</h4>

            <table className="hazoplist-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Recommendation</th>
                        <th>Remark</th>
                        <th>Assigned By</th>
                        <th>Target Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {completedAssignments.length === 0 ? (
                        <tr>
                            <td colSpan={7}>No Recommendations</td>
                        </tr>
                    ) : (
                        completedAssignments.map((rec, idx) => {
                            const isDelayed =
                                !rec.completionStatus &&
                                rec.targetDate &&
                                new Date(rec.targetDate) < new Date();

                            return (
                                <tr key={rec.id}>
                                    <td>{idx + 1}</td>
                                    <td>
                                        {truncateWords(rec?.javaHazopNodeRecommendation?.recommendation || "-")}
                                    </td>
                                    <td>
                                        {truncateWords(rec?.javaHazopNodeRecommendation?.remarkbyManagement || "-")}
                                    </td>
                                    <td>{rec.createdByName || "-"}</td>
                                    <td>{formatDate(rec.targetDate || "-")}</td>
                                    <td>
                                        {isDelayed && (
                                            <span style={{ color: "red", fontWeight: 600 }}>Delay</span>
                                        )}

                                        <div className="dropdown" style={{ display: "inline-block", marginLeft: "0px" }}>
                                            <button
                                                className="dots-button"
                                                onClick={() => toggleDropdown(rec.id)}
                                            >
                                                <FaEllipsisV />
                                            </button>

                                            {openDropdown === rec.id && (
                                                <div className="dropdown-content">
                                                    <button onClick={() => openUpdatePopup(rec)}>
                                                        <FaEye /> View
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>

            </table>


            {/* Selected Record Detail */}
            {selectedRecord && (
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

            {/* Confirmation Popup */}
            {confirmation && (
                <ConfirmationPopup
                    message={confirmation.message}
                    onConfirm={confirmCompletion}
                    onCancel={() => setConfirmation(null)}
                />
            )}

            {actionLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
        </div>
    );
};

export default CompleteRecommendationApproval;
