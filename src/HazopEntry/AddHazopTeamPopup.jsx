import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaTimes } from "react-icons/fa";
import { showToast } from "../CommonUI/CommonUI";

const AddHazopTeamPopup = ({ closePopup, hazopData, existingTeam }) => {
    const [teamSearch, setTeamSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [hazopTeam, setHazopTeam] = useState(existingTeam || []); // Use existing team if passed
    const [loading, setLoading] = useState(false);
    const [confirmPopup, setConfirmPopup] = useState(null); // State for confirmation popup
    const [originalTeam, setOriginalTeam] = useState([]);

    // Fetch existing team members on mount
    useEffect(() => {
        if (hazopData && hazopData.id) {
            fetchExistingTeam(hazopData.id);
        }
    }, [hazopData]);

    // Function to fetch the existing team from the API
    const fetchExistingTeam = async (hazopId) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5559/api/hazopTeam/teamByHazop/${hazopId}`
            );
            setHazopTeam(response.data || []);
            setOriginalTeam(response.data || []);
        } catch (err) {
            console.error("Error fetching team:", err);
            showToast("Failed to load existing team.", "error");
        }
        setLoading(false);
    };

    const handleTeamSearchChange = async (e) => {
        const value = e.target.value;
        setTeamSearch(value);

        if (value.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:5559/api/employee/search?search=${encodeURIComponent(value)}`
            );
            setSearchResults(response.data || []);
        } catch (err) {
            console.error("Error fetching team members:", err);
        }
    };

    const addTeamMember = (member) => {
        if (hazopTeam.some((m) => m.empCode === member.empCode)) {
            showToast("This employee is already added.", "warn");
            return;
        }
        setHazopTeam([...hazopTeam, member]);
        setTeamSearch("");
        setSearchResults([]);
    };

    const removeTeamMember = (empCode) => {
        // Show confirmation popup
        setConfirmPopup({
            message: "Do you want to remove this team member?",
            yes: async () => {
                setConfirmPopup(null);
                setLoading(true);
                try {
                    await axios.put(
                        `http://localhost:5559/api/hazopTeam/updateStatusToFalse?id=${hazopData.id}`

                    );
                    setHazopTeam(hazopTeam.filter((m) => m.empCode !== empCode));
                    showToast("Team member removed!", "success");
                } catch (err) {
                    console.error("Error removing team member:", err);
                    showToast("Failed to remove team member.", "error");
                }
                setLoading(false);
            },
            no: () => setConfirmPopup(null)
        });
    };


    const handleSave = () => {

        const newMembers = hazopTeam.filter(
            (m) => !originalTeam.some((o) => o.empCode === m.empCode)
        );

        if (newMembers.length === 0) {
            showToast("No new team member to add.", "warn");
            return;
        }

        if (hazopTeam.length === 0) {
            showToast("Please add at least one team member.", "warn");
            return;
        }

        // Show confirmation before saving the HAZOP team
        setConfirmPopup({
            message: "Do you want to save this HAZOP team?",
            yes: async () => {
                setConfirmPopup(null);
                await saveHazop(newMembers);
            },
            no: () => setConfirmPopup(null),
        });
    };

    const saveHazop = async (newMembers) => {
        setLoading(true);

        try {
            const hazopId = hazopData.id;

            if (hazopTeam.length > 0) {
                await axios.post(
                    `http://localhost:5559/api/hazopTeam/saveTeam/${hazopId}`,
                    newMembers.map((m) => m.empCode)
                );
            }

            showToast("HAZOP updated with new team!", "success");
            closePopup();
        } catch (err) {
            console.error("Error saving HAZOP with new team:", err);
            showToast("Failed to update team.", "error");
        }

        setLoading(false);
    };

    // Confirmation Popup component
    const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
        return (
            <div className="confirm-overlay">
                <div className="confirm-box">
                    <p>{message}</p>
                    <div className="confirm-buttons">
                        <button onClick={onCancel} className="cancel-btn">No</button>
                        <button onClick={onConfirm} className="confirm-btn">Yes</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <div className="modal-header">
                Add Team Members to HAZOP
                <button className="close-btn" onClick={closePopup} disabled={loading}>
                    <FaTimes />
                </button>
            </div>
            <div className="modal-content">
                <div className="hazop-info">
                    <h3>HAZOP Details</h3>
                    {hazopData ? (
                        <div className="hazop-info-grid">
                            <div><strong>ID:</strong> {hazopData.id}</div>
                            <div><strong>Site:</strong> {hazopData.site}</div>
                            <div><strong>Department:</strong> {hazopData.department}</div>
                            <div><strong>HAZOP Date:</strong> {hazopData.hazopDate}</div>
                            <div><strong>Completion Status:</strong> {hazopData.completionStatus ? "Completed" : "Pending"}</div>
                            <div><strong>Status:</strong> {hazopData.status ? "Active" : "Inactive"}</div>
                            <div><strong>Send for Verification:</strong> {hazopData.sendForVerification ? "Yes" : "No"}</div>
                            <div><strong>Created By:</strong> {hazopData.createdBy || "N/A"}</div>
                            <div><strong>Email:</strong> {hazopData.createdByEmail || "N/A"}</div>
                            <div className="full-width"><strong>Description:</strong> {hazopData.description}</div>
                        </div>
                    ) : (
                        <p>No HAZOP data available.</p>
                    )}
                </div>


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

                {hazopTeam.length > 0 && (
                    <div className="table-wrapper">
                        <table className="team-table">
                            <thead>
                                <tr>
                                    <th>Employee Code</th>
                                    <th>Employee Name</th>
                                    <th>Email Id</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hazopTeam.map((member) => (
                                    <tr key={member.empCode}>
                                        <td>{member.empCode}</td>
                                        <td>{member.firstName} {member.lastName}</td>
                                        <td>{member.emailId || "NA"}</td>
                                        <td>
                                            <button
                                                onClick={() => removeTeamMember(member.empCode)}
                                                disabled={loading}
                                            >
                                                Remove
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {confirmPopup && (
                    <ConfirmationPopup
                        message={confirmPopup.message}
                        onConfirm={confirmPopup.yes}
                        onCancel={confirmPopup.no}
                    />
                )}

                <div className="center-controls">
                    <button
                        type="button"
                        className="outline-btn"
                        onClick={closePopup}
                        disabled={loading}
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        className="save-btn"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Team"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddHazopTeamPopup;
