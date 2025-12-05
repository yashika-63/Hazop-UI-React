import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { strings } from '../string';
import { formatDate, showToast, truncateWords } from '../CommonUI/CommonUI';
import { FaEye, FaEllipsisV } from "react-icons/fa";

const ConfirmationPopup = ({ message, onConfirm, onCancel }) => (
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

const RecommendationApproval = () => {
    const [assignments, setAssignments] = useState([]);
    const [acceptedAssignments, setAcceptedAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isCompletionFlow, setIsCompletionFlow] = useState(false);

    const empCode = localStorage.getItem("empCode");
    const empName = localStorage.getItem("fullName");
    const empEmail = localStorage.getItem("email");

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://${strings.localhost}/api/recommendation/assign/getAssignments`,
                {
                    params: {
                        assignToEmpCode: empCode,
                        assignWorkSendForAcceptance: true,
                        assignWorkAcceptanceStatus: false,
                    },
                }
            );
            setAssignments(response.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch assignments.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAcceptedAssignments = async () => {
        try {
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
            setAcceptedAssignments(data);
        } catch (err) {
            console.error(err);
            showToast('Failed to fetch accepted assignments', 'error');
        }
    };

    useEffect(() => {
        fetchAssignments();
        fetchAcceptedAssignments();
    }, []);

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const openUpdatePopup = (item, isCompletion = false) => {
        setSelectedRecord({
            assignmentId: item.id,
            recommendation: item.javaHazopNodeRecommendation
        });
        setIsCompletionFlow(isCompletion);
        setOpenDropdown(null);
    };

    const handleAction = (assignmentId, accept) => {
        setConfirmation({
            assignmentId,
            accept,
            message: `Are you sure you want to ${accept ? 'accept' : 'reject'} this recommendation?`
        });
    };

    const confirmAction = async () => {
        if (!confirmation) return;

        setActionLoading(true);
        try {
            await axios.post(
                `http://${strings.localhost}/api/recommendation/assign/acceptOrReject`,
                {},
                {
                    params: {
                        assignmentId: confirmation.assignmentId,
                        accept: confirmation.accept,
                        empCode: empCode,
                        empName: empName,
                        empEmail: empEmail
                    }
                }
            );
            showToast(`Successfully ${confirmation.accept ? 'accepted' : 'rejected'} this recommendation`, 'success');
            fetchAssignments();
            fetchAcceptedAssignments();
            setSelectedRecord(null);
            setConfirmation(null);
        } catch (err) {
            console.error(err);
            showToast("Failed to perform action.", 'error');
            setConfirmation(null);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteTask = () => {
        setConfirmation({
            assignmentId: selectedRecord.assignmentId,
            completeTask: true,
            message: "Are you sure you want to mark this task as completed?"
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
                        completionDate: currentDate
                    }
                }
            );

            showToast("Task marked as completed", "success");
            fetchAcceptedAssignments();
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

    const cancelConfirmation = () => setConfirmation(null);

    const renderDropdown = (rec, isCompletion = false) => (
        <div className="dropdown">
            <button className="dots-button" onClick={() => toggleDropdown(rec.id)}>
                <FaEllipsisV />
            </button>
            {openDropdown === rec.id && (
                <div className="dropdown-content">
                    <button onClick={() => openUpdatePopup(rec, isCompletion)}>
                        <FaEye /> View
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div>

            <h4>Pending Assignments</h4>
            <table className="hazoplist-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Recommendation</th>
                        <th>Remark</th>
                        <th>Assigned By</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.length === 0 ? (
                        <tr className="no-data">
                            <td colSpan={5}>No assignments found.</td>
                        </tr>
                    ) : (
                        assignments.map((rec, idx) => (
                            <tr key={rec.id}>
                                <td>{idx + 1}</td>
                                <td>{truncateWords(rec?.javaHazopNodeRecommendation?.recommendation || '-')}</td>
                                <td>{truncateWords(rec?.javaHazopNodeRecommendation?.remarkbyManagement || '-')}</td>
                                <td>{rec.createdByName || '-'}</td>
                                <td>{renderDropdown(rec)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <h4>Accepted Assignments (Pending Completion)</h4>
            <table className="hazoplist-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Recommendation</th>
                        <th>Remark</th>
                        <th>Assigned By</th>
                        <th>Completion Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {acceptedAssignments.length === 0 ? (
                        <tr className="no-data">
                            <td colSpan={6}>No accepted assignments found.</td>
                        </tr>
                    ) : (
                        acceptedAssignments.map((rec, idx) => (
                            <tr key={rec.id}>
                                <td>{idx + 1}</td>
                                <td>{truncateWords(rec?.javaHazopNodeRecommendation?.recommendation || '-')}</td>
                                <td>{truncateWords(rec?.javaHazopNodeRecommendation?.remarkbyManagement || '-')}</td>
                                <td>{rec.createdByName || '-'}</td>
                                <td>{formatDate(rec.completionDate || '-')}</td>
                                <td>{renderDropdown(rec, true)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {selectedRecord && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h5 className='centerText'>Recommendation Details</h5>

                        <div className="details-row">
                            <span className="label">Recommendation:</span>
                            <span className="value">{selectedRecord.recommendation?.recommendation || '-'}</span>
                        </div>

                        <div className="details-row">
                            <span className="label">Department:</span>
                            <span className="value">{selectedRecord.recommendation?.department || '-'}</span>
                        </div>

                        <div className="details-row">
                            <span className="label">Remark:</span>
                            <span className="value">{selectedRecord.recommendation?.remarkbyManagement || '-'}</span>
                        </div>

                        <div className="details-row">
                            <span className="label">Responsible:</span>
                            <span className="value">{selectedRecord.recommendation?.responsibility || '-'}</span>
                        </div>

                        <div className="confirm-buttons">
                            {!isCompletionFlow ? (
                                <>
                                    <button
                                        type="button"
                                        className="approveBtn"
                                        onClick={() => handleAction(selectedRecord.assignmentId, true)}
                                    >
                                        Accept
                                    </button>

                                    <button
                                        type="button"
                                        className="rejectBtn"
                                        onClick={() => handleAction(selectedRecord.assignmentId, false)}
                                    >
                                        Reject
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className="approveBtn"
                                    onClick={handleCompleteTask}
                                >
                                    Complete Task
                                </button>
                            )}

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setSelectedRecord(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmation && (
                <ConfirmationPopup
                    message={confirmation.message}
                    onConfirm={
                        confirmation.completeTask
                            ? confirmCompletion
                            : confirmAction
                    }
                    onCancel={cancelConfirmation}
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

export default RecommendationApproval;
