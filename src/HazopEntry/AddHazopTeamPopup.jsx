import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaSearch, FaTimes, FaUserTie, FaUser, FaFileAlt, FaEye } from "react-icons/fa";
import { showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";
import HazopDocumentUpload from "./HazopDocumentUpload";

const AddHazopTeamPopup = ({ closePopup, hazopData, existingTeam }) => {
    const [teamSearch, setTeamSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [hazopTeam, setHazopTeam] = useState(existingTeam || []);
    const [loading, setLoading] = useState(false);
    const [confirmPopup, setConfirmPopup] = useState(null);
    const [originalTeam, setOriginalTeam] = useState([]);
    const [removeConfirmationPopup, setRemoveConfirmationPopup] = useState(null);

    // Document States
    const [existingDocuments, setExistingDocuments] = useState([]);
    const [showDocumentUploader, setShowDocumentUploader] = useState(false);

    // Refs
    const documentUploadRef = useRef(); // For calling child method
    const scrollRef = useRef(null);     // For auto-scrolling

    const companyId = localStorage.getItem("companyId");

    useEffect(() => {
        if (hazopData && hazopData.id) {
            fetchExistingTeam(hazopData.id);
            loadDocuments(hazopData.id);
        }
    }, [hazopData]);

    // --- AUTO SCROLL EFFECT ---
    useEffect(() => {
        if (showDocumentUploader && scrollRef.current) {
            setTimeout(() => {
                scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    }, [showDocumentUploader]);

    // --- FETCH EXISTING DOCUMENTS ---
    const loadDocuments = async (hazopId) => {
        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/javaHazopDocument/getByKeys`,
                {
                    params: {
                        companyId: localStorage.getItem("companyId") || 1,
                        primeryKey: "HAZOPFIRSTPAGEID",
                        primeryKeyValue: hazopId,
                    },
                }
            );
            setExistingDocuments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error loading HAZOP documents:", err);
        }
    };

    const fetchExistingTeam = async (hazopId) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://${strings.localhost}/api/hazopTeam/teamByHazop/${hazopId}?status=true`
            );

            // Map response to ensure we use 'role' for display in frontend
            // If backend sends 'hazopRole', we map it to 'role' for the UI
            const mappedData = (response.data || []).map(member => ({
                ...member,
                role: member.hazopRole || member.role || "Team Member" // Fallback to ensure UI shows something
            }));

            setHazopTeam(mappedData);
            setOriginalTeam(mappedData);
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
        // Default role for new members is "Team Member" (Display Name)
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
                    if (teamMemberId && originalTeam.some((m) => m.empCode === empCode)) {
                        await axios.put(
                            `http://${strings.localhost}/api/hazopTeam/updateStatusToFalse?id=${teamMemberId}`
                        );
                        showToast("Team member removed from backend!", "success");
                    } else {
                        showToast("Team member removed!", "success");
                    }
                   
                    // --- FIX IS HERE ---
                    // 1. Remove from visible list
                    setHazopTeam(hazopTeam.filter((m) => m.empCode !== empCode));
                   
                    // 2. ALSO Remove from 'originalTeam' so if added back, they are treated as new
                    setOriginalTeam(originalTeam.filter((m) => m.empCode !== empCode));
 
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
        // Calculate changes
        const newMembers = hazopTeam.filter(
            (m) => !originalTeam.some((o) => o.empCode === m.empCode)
        );

        // Simple check if roles changed or members added/removed
        const isTeamChanged = !(newMembers.length === 0 && JSON.stringify(hazopTeam) !== JSON.stringify(originalTeam));
        const isUploadVisible = showDocumentUploader;

        // If no logic changes and no upload, warn user
        if (!isTeamChanged && !isUploadVisible && newMembers.length === 0) {
            showToast("No changes to save.", "warn");
            return;
        }

        if (hazopTeam.length === 0) {
            showToast("Please add at least one team member.", "warn");
            return;
        }

        setConfirmPopup({
            message: "Do you want to save changes?",
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

            // 1. Save New Team Members (Bulk add)
            if (newMembers.length > 0) {
                await axios.post(
                    `http://${strings.localhost}/api/hazopTeam/saveTeam/${hazopId}`,
                    newMembers.map((m) => m.empCode)
                );
            }

            // 2. Save Roles (Iterate and update roles)
            for (const member of hazopTeam) {
                // LOGIC: Check UI role. If 'Team Lead', send 'Team Lead'. 
                // For anything else (including 'Team Member'), send 'Team Member'.
                const roleToSend = member.role === "Team Lead" ? "Team Lead" : "Team Member";

                await axios.post(
                    `http://${strings.localhost}/api/hazopTeamRole/save?companyId=${companyId}&empCode=${member.empCode}&hazopRole=${roleToSend}&hazopId=${hazopId}`
                );
            }

            // 3. Upload New Documents (if any)
            if (documentUploadRef.current) {
                await documentUploadRef.current.uploadDocuments(hazopId);
            }

            showToast("HAZOP updated successfully!", "success");
            closePopup();
        } catch (err) {
            console.error("Error saving HAZOP:", err);
            showToast("Failed to update.", "error");
        }

        setLoading(false);
    };

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

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <div className="modal-header">
                Manage Team & Documents
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

                <div style={{ float: 'right' }}>
                    <button
                        type="button"
                        className="add-btn"
                        onClick={() => setShowDocumentUploader(!showDocumentUploader)}
                        disabled={loading}
                    >
                        {showDocumentUploader ? "Hide Upload Section" : "+ Upload New Document"}
                    </button>
                </div>

                {/* --- TEAM TABLE SECTION --- */}
                {hazopTeam.length > 0 && (
                    <div className="table-wrapper">
                        <table className="team-table">
                            <thead>
                                <tr>
                                    <th>Emp Code</th>
                                    <th>Employee Name</th>
                                    <th>Role</th> {/* Showing as 'Role' in UI */}
                                    <th>Role Action</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hazopTeam.map((member) => (
                                    <tr key={member.empCode}>
                                        <td>{member.empCode}</td>
                                        <td>{member.firstName} {member.lastName}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            {/* Displaying 'role' from state */}
                                            <span className={`role-badge ${member.role === "Team Lead" ? "role-lead" : "role-member"}`}>
                                                {member.role === "Team Lead" ? <FaUserTie style={{ marginRight: 5 }} /> : <FaUser style={{ marginRight: 5 }} />}
                                                {member.role}
                                            </span>
                                        </td>
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

                {/* --- EXISTING DOCUMENTS LIST SECTION --- */}
                {existingDocuments.length > 0 && (
                    <div className="existing-documents-section" style={{ marginTop: '20px' }}>
                        <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Attached Documents</h4>
                        <ul className="document-list" style={{ listStyle: 'none', padding: 0 }}>
                            {existingDocuments.map((doc) => {
                                const fileName = doc.filePath ? doc.filePath.split(/[\\/]/).pop() : "Unnamed Document";
                                return (
                                    <li key={doc.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                                        <FaFileAlt style={{ color: '#555', marginRight: '10px' }} />
                                        <a
                                            href={`http://${strings.localhost}/api/javaHazopDocument/view/${doc.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ flexGrow: 1, textDecoration: 'none', color: '#007bff' }}
                                        >
                                            {fileName}
                                        </a>
                                        <a
                                            href={`http://${strings.localhost}/api/javaHazopDocument/view/${doc.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="view-icon-btn"
                                            title="View"
                                        >
                                            <FaEye />
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {/* --- DRAG AND DROP UPLOADER COMPONENT --- */}
                <div
                    ref={scrollRef}
                    style={{
                        marginTop: '15px',
                        display: showDocumentUploader ? 'block' : 'none'
                    }}
                >
                    <HazopDocumentUpload
                        ref={documentUploadRef}
                        hazopId={hazopData.id} 
                        disabled={loading}
                    />
                </div>

                {confirmPopup && (
                    <ConfirmationPopup
                        message={confirmPopup.message}
                        onConfirm={confirmPopup.yes}
                        onCancel={confirmPopup.no}
                    />
                )}
                {removeConfirmationPopup && (
                    <ConfirmationPopup
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
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddHazopTeamPopup;