import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaTimes, FaUserTie, FaUser } from "react-icons/fa"; // Added icons
import { showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";

const AddHazopTeamPopup = ({ closePopup, hazopData, existingTeam }) => {
    const [teamSearch, setTeamSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [hazopTeam, setHazopTeam] = useState(existingTeam || []);
    const [loading, setLoading] = useState(false);
    const [confirmPopup, setConfirmPopup] = useState(null);
    const [originalTeam, setOriginalTeam] = useState([]);
    const [removeConfirmationPopup, setRemoveConfirmationPopup] = useState(null);
    const companyId = localStorage.getItem("companyId");

    useEffect(() => {
        if (hazopData && hazopData.id) {
            fetchExistingTeam(hazopData.id);
        }
    }, [hazopData]);

    const fetchExistingTeam = async (hazopId) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/hazopTeam/teamByHazop/${hazopId}?status=true`
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
                `http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`
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
        // Default role is Team Member
        setHazopTeam([...hazopTeam, { ...member, role: "Team Member" }]);
        setTeamSearch("");
        setSearchResults([]);
    };

    const toggleRole = (empCode) => {
        setHazopTeam(hazopTeam.map((member) =>
            member.empCode === empCode
                ? { ...member, role: member.role === "Team Member" ? "Team Lead" : "Team Member" }
                : member
        ));
    };

    const removeTeamMember = (empCode, hazopId, teamMemberId) => {
        const member = hazopTeam.find(m => m.empCode === empCode);

        if (!member) {
            showToast("Member not found in the team.", "error");
            return;
        }

        setRemoveConfirmationPopup({
            message: `Do you want to remove ${member.firstName} ${member.lastName}?`,
            yes: async () => {
                setRemoveConfirmationPopup(null);
                setLoading(true);

                try {
                    if (originalTeam.some((m) => m.empCode === empCode)) {
                        await axios.put(
                            `http://${strings.localhost}/api/hazopTeam/updateStatusToFalse?empCode=${empCode}&id=${teamMemberId}`
                        );
                        showToast("Team member removed from backend!", "success");
                    } else {
                        showToast("Team member removed!", "success");
                    }
                    setHazopTeam(hazopTeam.filter((m) => m.empCode !== empCode));
                } catch (err) {
                    console.error("Error removing team member:", err);
                    showToast("Failed to remove team member.", "error");
                }

                setLoading(false);
            },
            no: () => setRemoveConfirmationPopup(null)
        });
    };

    const handleSave = () => {
        const newMembers = hazopTeam.filter(
            (m) => !originalTeam.some((o) => o.empCode === m.empCode)
        );

        // Allow saving if roles changed even if no new members added
        // (You might want to add a check for modified roles here if strictly needed, 
        // but for now, we follow your logic or just allow save)
        if (newMembers.length === 0 && JSON.stringify(hazopTeam) === JSON.stringify(originalTeam)) {
             showToast("No changes to save.", "warn");
             return;
        }

        if (hazopTeam.length === 0) {
            showToast("Please add at least one team member.", "warn");
            return;
        }
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

            if (newMembers.length > 0) {
                await axios.post(
                    `http://${strings.localhost}/api/hazopTeam/saveTeam/${hazopId}`,
                    newMembers.map((m) => m.empCode)
                );
            }

            for (const member of hazopTeam) {
                await axios.post(
                    `http://${strings.localhost}/api/hazopTeamRole/save?companyId=${companyId}&empCode=${member.empCode}&hazopRole=${member.role}&hazopId=${hazopId}`
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

    const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
        return (
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
    };

    const RemoveConfirmationPopup = ({ message, onConfirm, onCancel }) => {
        return (
            <div className="confirm-overlay">
                <div className="confirm-box">
                    <p>{message}</p>
                    <div className="confirm-buttons">
                        <button type="button" className="cancel-btn" onClick={onCancel}>No</button>
                        <button type="button" className="confirm-btn" onClick={onConfirm} >Yes</button>
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
                Create Team Members to HAZOP
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
                            <div><strong>Hazop Title:</strong> {hazopData.hazopTitle || '-'}</div>
                            <div><strong>Site:</strong> {hazopData.site}</div>
                            <div><strong>Department:</strong> {hazopData.department}</div>
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
                                    {user.empCode} - ({user.emailId || "NA"})({user.department || "NA"})
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
                                    <th>Role</th>
                                    <th>Action</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hazopTeam.map((member) => (
                                    <tr key={member.empCode}>
                                        <td>{member.empCode}</td>
                                        <td>{member.firstName} {member.lastName}</td>
                                        
                                        {/* 1. ROLE COLUMN WITH CONDITIONAL STYLING */}
                                        <td style={{textAlign:'center'}}>
                                            <span 
                                                className={`role-badge ${
                                                    member.role === "Team Lead" 
                                                    ? "role-lead" 
                                                    : "role-member"
                                                }`}
                                            >
                                                {member.role === "Team Lead" ? <FaUserTie style={{marginRight:5}}/> : <FaUser style={{marginRight:5}}/>}
                                                {member.role}
                                            </span>
                                        </td>

                                        {/* 2. ACTION COLUMN WITH TOGGLE BUTTON */}
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => toggleRole(member.empCode)}
                                                disabled={loading}
                                                className={`role-btn ${member.role === "Team Lead" ? "btn-revoke-lead" : "btn-make-lead"}`}
                                            >
                                                {member.role === "Team Lead" ? "Set as Member" : "Set as Team Lead"}
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="remove-button"
                                                onClick={() => removeTeamMember(member.empCode, hazopData.id, member.id)}
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
                {removeConfirmationPopup && (
                    <RemoveConfirmationPopup
                        message={removeConfirmationPopup.message}
                        onConfirm={removeConfirmationPopup.yes}
                        onCancel={removeConfirmationPopup.no}
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