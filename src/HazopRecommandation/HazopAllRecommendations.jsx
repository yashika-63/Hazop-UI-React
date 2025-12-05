import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaEllipsisV, FaPaperPlane, FaSearch, FaTimes } from 'react-icons/fa';
import '../styles/global.css';
import { showToast } from '../CommonUI/CommonUI';
import { strings } from '../string';


const HazopAllRecommendations = ({ hazopId }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [teamSearch, setTeamSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };
    console.log("hazopId", hazopId);
    useEffect(() => {
        if (!hazopId) return;
        const fetchRecommendations = async () => {
            try {
                const res = await axios.get(
                    `http://${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`
                );
                setRecommendations(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, [hazopId]);

    const handleOpenPopup = (rec) => {
        setSelectedRecommendation(rec);
        setPopupOpen(true);
        setTeamSearch("");
        setSearchResults([]);
        setSelectedEmployee(null);
    };

    const handleTeamSearchChange = async (e) => {
        const value = e.target.value;
        setTeamSearch(value);
        setSelectedEmployee(null);

        if (value.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`
            );
            setSearchResults(res.data || []);
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    };

    const selectEmployee = (emp) => {
        setSelectedEmployee(emp);
        setTeamSearch(emp.empCode);
        setSearchResults([]);
    };

    const handleSendForVerification = async () => {
        if (!selectedRecommendation || !selectedEmployee) return;
        setIsSending(true)
        try {
            await axios.put(
                `http://${strings.localhost}/api/nodeRecommendation/sendForVerification/${selectedRecommendation.id}/${selectedEmployee.empCode}`
            );
            showToast("Recommendation sent successfully!", 'success');
            setPopupOpen(false);
        } catch (err) {
            console.error(err);
            showToast("Failed to send recommendation.", 'error');
        } finally {
            setIsSending(false)
        }
    };


    const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
        return (
            <div className="confirm-overlay">
                <div className="confirm-box">

                    <p>{message}</p>
                    <div className="confirm-buttons">
                        <button type="button" onClick={onCancel} disabled={isSending} className="cancel-btn">No</button>
                        <button type="button" onClick={onConfirm} disabled={isSending} className="confirm-btn">{isSending ? "Sending..." : "Yes"}</button>
                    </div>
                </div>
            </div>
        );
    };


    const renderDropdown = (rec) => {
        const isDisabled = rec.sendForVerificationActionStatus;

        return (
            <div className="dropdown">
                <button className="dots-button" onClick={() => toggleDropdown(rec.id)}>
                    <FaEllipsisV />
                </button>

                {openDropdown === rec.id && (
                    <div className="dropdown-content">
                        <button
                            disabled={isDisabled}
                            className={isDisabled ? "disabled-option" : ""}
                            onClick={() => !isDisabled && handleOpenPopup(rec)}
                            title={isDisabled ? "Already approved, no need to send for verification" : ""}
                        >
                            <FaPaperPlane /> Send For Verification
                        </button>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div>
            {isSending && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <table className="premium-table table-not-assigned">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Recommendation</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {recommendations.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="no-data1">No recommendation data found</td>
                        </tr>
                    ) : (
                        recommendations.map((rec) => (
                            <tr key={rec.id}>
                                <td>{rec.id}</td>
                                <td>{rec.recommendation}</td>
                                <td>
                                    {rec.sendForVerification && !rec.sendForVerificationActionStatus ? (
                                        <span className="status-pending">Pending</span>
                                    ) : !rec.sendForVerification && rec.sendForVerificationActionStatus ? (
                                        <span className="status-completed">Action Taken</span>
                                    ) : (
                                        <span className="status-pending">N/A</span>
                                    )}
                                </td>

                                <td>
                                    {renderDropdown(rec)}
                                </td>

                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {/* Employee selection popup */}
            {popupOpen && (
                <div className="modal-overlay">
                    <div className="modal-body">
                        <h4 className='centerText'>Send Recommendation: {selectedRecommendation?.recommendation}</h4>

                        <div className="search-container">
                            <div className="search-bar-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search employee..."
                                    value={teamSearch}
                                    onChange={handleTeamSearchChange}
                                />
                                <FaSearch className="search-icon" />
                                {searchResults.length > 0 && (
                                    <ul className="search-results">
                                        {searchResults.map((emp) => (
                                            <li key={emp.empCode} onClick={() => selectEmployee(emp)}>
                                                {emp.empCode} - ({emp.emailId || "NA"}) ({emp.department || "NA"})
                                            </li>
                                        ))}
                                    </ul>
                                )}
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
                            <button onClick={() => setPopupOpen(false)} className="cancel-btn">Cancel</button>
                            <button
                                onClick={() => setConfirmOpen(true)}
                                className="confirm-btn"
                                disabled={!selectedEmployee}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation popup */}
            {confirmOpen && selectedEmployee && selectedRecommendation && (
                <ConfirmationPopup
                    message={`Do you really want to send this HAZOP recommendation to ${selectedEmployee.empCode}?`}
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={() => {
                        setConfirmOpen(false);
                        handleSendForVerification();
                    }}
                />
            )}
        </div>
    );
};

export default HazopAllRecommendations;
