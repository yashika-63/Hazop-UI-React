import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { strings } from '../string';
import { showToast, truncateWords } from '../CommonUI/CommonUI';
import { FaEye, FaEllipsisV, FaTimes, FaSearch } from "react-icons/fa";

const PendingConfirmationPopup = ({
    message,
    onConfirm,
    onCancel,
    type,
    comment,
    setComment,
    targetDate,
    setTargetDate,
    teamSearch,
    handleTeamSearchChange,
    searchResults,
    addTeamMember,
    selectedEmployee,
    setSelectedEmployee,
}) => (
    <div className="modal-overlay">
        <div className="modal-body">
            <p>{message}</p>

            {type === "accept" && (
                <>
                    <div className='form-group'>
                        <label>Comment</label>
                        <textarea rows={5} value={comment} onChange={(e) => setComment(e.target.value)} />
                    </div>
                    <div>
                        <label>Target Date:</label>
                        <input
                            type="date"
                            value={targetDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setTargetDate(e.target.value)}
                        />
                    </div>
                </>
            )}

            {type === "reject" && (
                <>
                    <div className='form-group'>
                        <label>Comment:</label>
                        <textarea rows={5} value={comment} onChange={(e) => setComment(e.target.value)} />
                    </div>

                    <div className="search-container">
                        <div className="search-bar-wrapper">
                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={teamSearch}
                                onChange={handleTeamSearchChange}
                            />
                            <FaSearch className="search-icon" />

                            <ul className="search-results">
                                {searchResults.map((user) => (
                                    <li key={user.empCode} onClick={() => addTeamMember(user)}>
                                        {user.empCode} -  ({user.emailId || "NA"})({user.department || "NA"})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {selectedEmployee && (
                        <div className="details-container">
                            <h5>Selected Employee</h5>
                            <div className="details-row">
                                <span className="label">Name:</span>
                                <span>{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                            </div>
                            <div className="details-row">
                                <span className="label">Email:</span>
                                <span>{selectedEmployee.emailId}</span>
                            </div>
                            <div className="details-row">
                                <span className="label">Code:</span>
                                <span>{selectedEmployee.empCode}</span>
                            </div>

                            <FaTimes className="remove-icon" onClick={() => setSelectedEmployee(null)} />
                        </div>
                    )}
                </>
            )}

            <div className="confirm-buttons">
                <button type="button" className="cancel-btn" onClick={onCancel}>No</button>
                <button type="button" className="confirm-btn" onClick={onConfirm}>Yes</button>
            </div>
        </div>
    </div>
);

const PendingRecommendationApproval = () => {
    const [assignments, setAssignments] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [loading, setLoading] = useState(false);

    const [comment, setComment] = useState("");
    const [targetDate, setTargetDate] = useState("");

    const [teamSearch, setTeamSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const empCode = localStorage.getItem("empCode");
    const empName = localStorage.getItem("fullName");
    const empEmail = localStorage.getItem("email");

    const fetchAssignments = async () => {
        try {
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
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const openPopup = (rec) => {
        setSelectedRecord({
            assignmentId: rec.id,
            recommendation: rec.javaHazopNodeRecommendation
        });
        setOpenDropdown(null);
    };

    const handleAction = (assignmentId, accept) => {
        setConfirmation({
            assignmentId,
            accept,
            message: `Are you sure you want to ${accept ? "accept" : "reject"} this recommendation?`,
        });
    };

    const handleTeamSearchChange = async (e) => {
        const value = e.target.value;
        setTeamSearch(value);

        if (value.length < 2) return setSearchResults([]);

        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/employee/search?search=${value}`
            );
            setSearchResults(response.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const addTeamMember = (user) => {
        setSelectedEmployee(user);
        setTeamSearch(`${user.empCode}`);
        setSearchResults([]);
    };

    const confirmAction = async () => {
        if (!confirmation) return;

        if (confirmation.accept && !targetDate) {
            return showToast("Please select target date", "error");
        }
        if (!confirmation.accept && !selectedEmployee) {
            return showToast("Select a reassignment employee", "error");
        }
        setLoading(true);
        try {
            await axios.post(
                `http://${strings.localhost}/api/recommendation/assign/acceptOrReject`,
                {},
                {
                    params: {
                        assignmentId: confirmation.assignmentId,
                        accept: confirmation.accept,
                        empCode,
                        empName,
                        empEmail,
                        comment,
                        targetDate,
                        recommendedPersonName: !confirmation.accept ? selectedEmployee.fullName : null,
                        recommendedPersonEmpCode: !confirmation.accept ? selectedEmployee.empCode : null,
                    },
                }
            );

            showToast("Action Successful", "success");

            fetchAssignments();
            setSelectedRecord(null);
            setConfirmation(null);
            setComment("");
            setTargetDate("");
            setSelectedEmployee(null);
        } catch (err) {
            showToast("Failed Action", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h4>Pending Recommendations</h4>
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
                        <th>Remark</th>
                        <th>Assigned By</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {assignments.length === 0 ? (
                        <tr><td colSpan={5}>No  Recommendations</td></tr>
                    ) : (
                        assignments.map((rec, idx) => (
                            <tr key={rec.id}>
                                <td>{idx + 1}</td>
                                <td>{truncateWords(rec.javaHazopNodeRecommendation?.recommendation)}</td>
                                <td>{truncateWords(rec.javaHazopNodeRecommendation?.remarkbyManagement)}</td>
                                <td>{rec.createdByName}</td>

                                <td>
                                    <div className="dropdown">
                                        <button className="dots-button" onClick={() => toggleDropdown(rec.id)}>
                                            <FaEllipsisV />
                                        </button>

                                        {openDropdown === rec.id && (
                                            <div className="dropdown-content">
                                                <button onClick={() => openPopup(rec)}>
                                                    <FaEye /> View
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
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
                            <button className="approveBtn"
                                onClick={() => handleAction(selectedRecord.assignmentId, true)}>
                                Accept
                            </button>

                            <button className="rejectBtn"
                                onClick={() => handleAction(selectedRecord.assignmentId, false)}>
                                Reject
                            </button>

                            <button className="cancel-btn" onClick={() => setSelectedRecord(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmation && (
                <PendingConfirmationPopup
                    message={confirmation.message}
                    type={confirmation.accept ? "accept" : "reject"}
                    comment={comment}
                    setComment={setComment}
                    selectedEmployee={selectedEmployee}
                    setSelectedEmployee={setSelectedEmployee}
                    targetDate={targetDate}
                    setTargetDate={setTargetDate}
                    teamSearch={teamSearch}
                    handleTeamSearchChange={handleTeamSearchChange}
                    searchResults={searchResults}
                    addTeamMember={addTeamMember}
                    onConfirm={confirmAction}
                    onCancel={() => setConfirmation(null)}
                />
            )}
        </div>
    );
};

export default PendingRecommendationApproval;
