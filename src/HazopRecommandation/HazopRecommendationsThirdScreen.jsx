import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { FaTimes, FaSearch } from "react-icons/fa";
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

    const handleCompleteClick = () => {
        setShowModal(true);
    };

    const handleModalCancel = () => {
        setShowModal(false);
        setSelectedEmployee(null);
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

    return (
        <div className="third-screen-container">

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <table className="premium-table table-not-assigned">
                <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Recommendation</th>
                        <th>Management Remark</th>
                        <th>Verified By</th>
                        <th>Responsible</th>
                        <th>Completion Status</th>
                        <th>Completion Date</th>
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
                                <td>{item.recommendation}</td>
                                <td>{item.remarkbyManagement || "-"}</td>
                                <td>{item.verificationResponsibleEmployeeName || "-"}</td>
                                <td>{item.responsibility || "-"}</td>
                                <td>{item.completionStatus === true ? "Completed" : "Pending"}</td>
                                <td>{item.CompletionDate || "-"}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div className="rightbtn-controls">
                <button
                    className="confirm-btn"
                    onClick={handleCompleteClick}
                    disabled={!allCompleted}
                    title={!allCompleted ? "All records must be completed to enable this button" : ""}
                >
                    Send For Verification
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
        </div>
    );
};

export default HazopRecommendationsThirdScreen;
