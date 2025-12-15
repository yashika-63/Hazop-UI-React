import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast, truncateWords } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { FaTimes, FaSearch, FaEye, FaEllipsisV, FaExchangeAlt } from "react-icons/fa";
import './Recommandation.css';

const ConfirmationPopup = ({ message, onConfirm, onCancel, isSending }) => {
    return (
        <div className="confirm-overlay">
            <div className="confirm-box">
                <p>{message}</p>
                <div className="confirm-buttons">
                    <button type="button" onClick={onCancel} disabled={isSending} className="cancel-btn">No</button>
                    <button type="button" onClick={onConfirm} disabled={isSending} className="confirm-btn">
                        {isSending ? "Sending..." : "Yes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const HazopRecommendationsThirdScreen = ({ hazopId }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [teamSearch, setTeamSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [reassignComment, setReassignComment] = useState("");
    const [showReassignPopup, setShowReassignPopup] = useState(false);
    const empCode = localStorage.getItem("empCode");
    const [showSendReviewPopup, setShowSendReviewPopup] = useState(false);
    const [selectedReviewEmployee, setSelectedReviewEmployee] = useState(null);


    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/nodeRecommendation/getVerificationActionRecords/${hazopId}`
            );
            setRecords(res.data || []);
        } catch (err) {
            console.error("API Error:", err);
            setRecords([]);
            showToast("Failed to fetch data.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hazopId) fetchRecords();
    }, [hazopId]);

    // Check if all completionStatus are true
    const allCompleted = records.length > 0 && records.every(r => r.completionStatus === true);

    const handleTeamSearchChange = async (e) => {
        const value = e.target.value;
        setTeamSearch(value);
        if (value.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`
            );
            setSearchResults(response.data || []);
        } catch (err) {
            console.error("Error fetching team members:", err);
        }
    };

    const addTeamMember = (user) => {
        setSelectedEmployee(user);
        setSearchResults([]);
        setTeamSearch("");
    };
    const addReviewEmployee = (user) => {
        setSelectedReviewEmployee(user);
        setSearchResults([]);
        setTeamSearch("");
    };

    const handleCompleteClick = () => {
        setShowModal(true);
    };

    const handleModalCancel = () => {
        setShowModal(false);
        setSelectedEmployee(null);
    };


    const handleOpenSendReview = () => {
        setShowSendReviewPopup(true);
        setSelectedReviewEmployee(null);
        setTeamSearch("");
        setSearchResults([]);
    };


    const handleSendReview = async () => {
        if (!selectedReviewEmployee) return;

        setIsSending(true);
        try {
            await axios.post(
                `http://${strings.localhost}/api/hazopRegistration/hazop/sendForVerification/${hazopId}/${encodeURIComponent(selectedReviewEmployee.empCode)}`
            );
            showToast("Hazop sent for review successfully.", "success");
            setShowSendReviewPopup(false);
            setSelectedReviewEmployee(null);
            fetchRecords(); // refresh table
        } catch (err) {
            console.error("Error sending for review:", err);
            showToast("Failed to send Hazop for review.", "error");
        } finally {
            setIsSending(false);
        }
    };


    const handleConfirmComplete = async () => {
        if (!selectedEmployee) return;
        setIsSending(true);
        try {
            await axios.post(
                `http://${strings.localhost}/hazopApproval/save?hazopId=${hazopId}&employeeCode=${selectedEmployee.empCode}`
            );
            showToast("Hazop Send successfully for verification.", "success");
            setShowConfirmation(false);
            setShowModal(false);
            setSelectedEmployee(null);
            fetchRecords();
        } catch (err) {
            console.error("Error completing hazop:", err);
            showToast("Failed to complete hazop.", "error");
        } finally {
            setIsSending(false);
        }
    };

    const handleView = (item) => {
        setSelectedRecommendation(item);
        setShowReassignPopup(true);
    };

    // Reassign API call
    const handleReassign = async () => {
        if (!selectedEmployee || !selectedRecommendation) return;

        const payload = {
            recommendationId: selectedRecommendation.id,
            createdByEmpCode: empCode,
            assignToEmpCode: selectedEmployee.empCode,
            assignWorkDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
            reassignComment
        };

        try {
            setIsSending(true);
            await axios.post(`http://${strings.localhost}/api/recommendation/assign/reassign`, null, { params: payload });
            showToast("Recommendation reassigned successfully", "success");
            setShowReassignPopup(false);
            setSelectedEmployee(null);
            setReassignComment("");
        } catch (err) {
            console.error(err);
            showToast("Failed to reassign recommendation", "error");
        } finally {
            setIsSending(false);
        }
    };


    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };
    const renderDropdown = (item) => (
        <div className="dropdown top-header">
            <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
                <FaEllipsisV />
            </button>

            {openDropdown === item.id && (
                <div className="dropdown-content">
                    <button
                        onClick={() => handleView(item)}
                    >
                        <FaExchangeAlt /> Re-assign
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

            <table className="assigned-table">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Recommendation</th>
                        <th>Verified By</th>
                        <th>Completion Status</th>
                        <th>Completion Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {records.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="no-data1">No Data Available</td>
                        </tr>
                    ) : (
                        records.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>{truncateWords(item.recommendation || '-')}</td>
                                <td>{item.verificationResponsibleEmployeeName || "-"}</td>
                                <td>
                                    <span
                                        className={
                                            item.completionStatus === true
                                                ? "status-completed"
                                                : item.completionStatus === false
                                                    ? "status-pending"
                                                    : "status-pending"
                                        }
                                    >
                                        {item.completionStatus === true ? "Completed" : "Pending"}
                                    </span>
                                </td>
                                <td>{item.CompletionDate || "-"}</td>
                                <td>{renderDropdown(item)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div className="rightbtn-controls">
                {/* <button
                    className="confirm-btn"
                    onClick={handleCompleteClick}
                    disabled={!allCompleted}
                    title={!allCompleted ? "All records must be completed to enable this button" : ""}
                >
                    Send For Verification
                </button> */}

                <button
                    className="confirm-btn review-btn"
                    onClick={handleOpenSendReview}
                    disabled={!allCompleted || isSending}
                    title={!allCompleted ? "All records must be completed to enable this button" : ""}
                >
                    Send For Review
                </button>
            </div>
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h4 className="centerText">Select Employee to Complete Hazop</h4>
                        <div className="search-container">
                            <div className="search-bar-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search employee..."
                                    value={teamSearch}
                                    onChange={handleTeamSearchChange}
                                    disabled={loading}
                                />
                                <FaSearch className="search-icon" />
                                <ul className="search-results">
                                    {searchResults.map(user => (
                                        <li key={user.empCode} onClick={() => addTeamMember(user)}>
                                            {user.empCode} - ({user.emailId || "NA"}) ({user.department || "NA"})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>


                        {selectedEmployee && (
                            <div className="details-row">
                                <span className="label">Selected Employee:</span>
                                <span className="value selected-employee-value">
                                    {selectedEmployee.empCode}
                                    <FaTimes
                                        onClick={() => setSelectedEmployee(null)}
                                        className="remove-icon"
                                    />
                                </span>
                            </div>
                        )}

                        <div className="confirm-buttons">
                            <button type="button" onClick={handleModalCancel} className="cancel-btn">Cancel</button>
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(true)}
                                className="confirm-btn"
                                disabled={!selectedEmployee}
                            >
                                Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showReassignPopup && selectedRecommendation && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h3 className="centerText">Recommendation Details</h3>
                        <p><strong>Recommendation:</strong> {selectedRecommendation.recommendation}</p>
                        <p>
                            <strong>Completion Status:</strong>{" "}
                            {
                                selectedRecommendation.completionStatus === true
                                    ? "Completed"
                                    : selectedRecommendation.completionStatus === false
                                        ? "Pending"
                                        : "-"
                            }
                        </p>
                        <p><strong>Completion Date:</strong> {selectedRecommendation.completionDate || "-"}</p>
                        <div className="search-container">
                            <div className="search-bar-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search employee..."
                                    value={teamSearch}
                                    onChange={handleTeamSearchChange}
                                    disabled={loading}
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

                        <div className='form-group'>
                            <div>
                                <label className="label">Reassign Comment:</label>
                                <textarea
                                    value={reassignComment}
                                    onChange={(e) => setReassignComment(e.target.value)}
                                    rows={3}
                                    placeholder="Write a comment..."
                                />
                            </div>
                        </div>

                        <div className="confirm-buttons">
                            <button type="button" className="cancel-btn" onClick={() => setShowReassignPopup(false)}>Close</button>
                            <button type="button" className="confirm-btn" onClick={handleReassign} disabled={!selectedEmployee || !reassignComment}>
                                {isSending ? "Sending..." : "Reassign"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showConfirmation && selectedEmployee && (
                <ConfirmationPopup
                    message={`Are you sure you want to send  this Hazop for complete to ${selectedEmployee.empCode}?`}
                    onConfirm={handleConfirmComplete}
                    onCancel={() => setShowConfirmation(false)}
                    isSending={isSending}
                />
            )}

            {isSending && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            {showSendReviewPopup && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h4 className="centerText">Select Employee to Send Hazop for Review</h4>

                        <div className="search-container">
                            <div className="search-bar-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search employee..."
                                    value={teamSearch}
                                    onChange={handleTeamSearchChange} // reuse existing search handler
                                    disabled={loading}
                                />
                                <FaSearch className="search-icon" />
                                <ul className="search-results">
                                    {searchResults.map(user => (
                                        <li key={user.empCode} onClick={() => addReviewEmployee(user)}>
                                            {user.empCode} - ({user.emailId || "NA"}) ({user.department || "NA"})
                                        </li>

                                    ))}
                                </ul>
                            </div>
                        </div>

                        {selectedReviewEmployee && (
                            <div>
                                <span className="label">Selected Employee:</span>
                                <span className="value selected-employee-value">
                                    <div className="details-row">
                                        <span className="label">Employee Code:</span>
                                        <span className="value">{selectedReviewEmployee.empCode}</span>
                                    </div>
                                    <div className="details-row">
                                        <span className="label">Name:</span>
                                        <span className="value">{selectedReviewEmployee.firstName} {selectedReviewEmployee.lastName}</span>
                                    </div>
                                    <div className="details-row">
                                        <span className="label">Department:</span>
                                        <span className="value">{selectedReviewEmployee.department || '-'}</span>
                                    </div>
                                    <div className="details-row">
                                        <span className="label">Email:</span>
                                        <span className="value">{selectedReviewEmployee.emailId || '-'}</span>
                                    </div>
                                    <FaTimes
                                        onClick={() => setSelectedReviewEmployee(null)}
                                        className="remove-icon"
                                    />
                                </span>
                            </div>
                        )}



                        <div className="confirm-buttons">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setShowSendReviewPopup(false)}
                                disabled={isSending}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="confirm-btn"
                                onClick={handleSendReview}
                                disabled={!selectedReviewEmployee || isSending}
                            >
                                {isSending ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
export default HazopRecommendationsThirdScreen;
