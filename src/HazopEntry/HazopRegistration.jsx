import React, { useState } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import './HazopRegistration.css';
import { showToast } from "../CommonUI/CommonUI";


const HazopRegistration = ({ closePopup }) => {
  const [formData, setFormData] = useState({
    hazopDate: "",
    site: "",
    department: "",
    description: "",
    verificationStatus: false,
    verificationComplitionStatus: false,
    completionStatus: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Team search state
  const [teamSearch, setTeamSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hazopTeam, setHazopTeam] = useState([]);
  const [showTeamSearch, setShowTeamSearch] = useState(false);

  // -------------------------------
  // VALIDATION RULES
  // -------------------------------
  const validate = () => {
    const newErrors = {};

    if (!formData.hazopDate) {
      newErrors.hazopDate = "Date is required.";
      showToast("Date is required", "warn");
    }
    if (!formData.site.trim()) {
      newErrors.site = "Site is required.";
    } else if (!/^[A-Za-z0-9\s,-]+$/.test(formData.site)) {
      newErrors.site = "Only letters, numbers, commas & hyphens allowed.";
    }
    if (!formData.department.trim()) {
      newErrors.department = "Department is required.";
    } else if (!/^[A-Za-z\s]+$/.test(formData.department)) {
      newErrors.department = "Only alphabets allowed.";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------------
  // ON INPUT CHANGE
  // -------------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // -------------------------------
  // TEAM SEARCH
  // -------------------------------
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
      console.error("Team search failed:", err);
    }
  };

  const addTeamMember = (member) => {
    if (!hazopTeam.some((m) => m.id === member.id)) {
      setHazopTeam([...hazopTeam, member]);
    }
    setTeamSearch("");
    setSearchResults([]);
  };

  const removeTeamMember = (id) => {
    setHazopTeam(hazopTeam.filter((m) => m.id !== id));
  };

  // -------------------------------
  // SAVE API CALL
  // -------------------------------
  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // 1️⃣ Save HAZOP entry
      const hazopResponse = await axios.post(
        "http://localhost:5559/api/hazopRegistration/saveByCompany/1",
        formData
      );

      const hazopId = hazopResponse.data.id; // Assuming API returns id

      // 2️⃣ Save team
      if (hazopTeam.length > 0) {
        await axios.post(
          `http://localhost:5559/api/hazopTeam/saveTeam/1`,
          {
            hazopId,
            team: hazopTeam.map((m) => ({ employeeId: m.id })),
          }
        );
      }

      showToast("HAZOP saved successfully!", "success");
      closePopup();
    } catch (err) {
      console.error("Save failed:", err);
      showToast("Failed to save HAZOP", "error");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="modal-header">
        HAZOP Registration
        <button className="close-btn" onClick={closePopup}>
          <FaTimes />
        </button>
      </div>

      <div className="modal-content">
        {/* HAZOP Form */}
        <label>HAZOP Date *</label>
        <input
          type="date"
          name="hazopDate"
          value={formData.hazopDate}
          onChange={handleChange}
        />
        {errors.hazopDate && <p className="error">{errors.hazopDate}</p>}

        <label>Site *</label>
        <input
          type="text"
          name="site"
          placeholder="e.g., Mumbai Refinery Unit 3"
          value={formData.site}
          onChange={handleChange}
        />
        {errors.site && <p className="error">{errors.site}</p>}

        <label>Department *</label>
        <input
          type="text"
          name="department"
          placeholder="e.g., Process Safety"
          value={formData.department}
          onChange={handleChange}
        />
        {errors.department && <p className="error">{errors.department}</p>}

        <label>Description *</label>
        <textarea
          name="description"
          placeholder="Write HAZOP description..."
          value={formData.description}
          onChange={handleChange}
        ></textarea>
        {errors.description && <p className="error">{errors.description}</p>}

        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              name="verificationStatus"
              checked={formData.verificationStatus}
              onChange={handleChange}
            />
            Verification Status
          </label>

          <label>
            <input
              type="checkbox"
              name="verificationComplitionStatus"
              checked={formData.verificationComplitionStatus}
              onChange={handleChange}
            />
            Verification Completion Status
          </label>

          <label>
            <input
              type="checkbox"
              name="completionStatus"
              checked={formData.completionStatus}
              onChange={handleChange}
            />
            Completion Status
          </label>
        </div>

        {/* --------------------- HAZOP TEAM --------------------- */}
        <div style={{ marginTop: "20px" }}>
          <button
            type="button"
            className="outline-btn"
            onClick={() => setShowTeamSearch(!showTeamSearch)}
          >
            Add HAZOP Team
          </button>

          {showTeamSearch && (
            <div className="team-search-wrapper">
              <input
                type="text"
                placeholder="Search employee..."
                value={teamSearch}
                onChange={handleTeamSearchChange}
              />
              <ul className="search-results">
                {searchResults.map((user) => (
                  <li key={user.id} onClick={() => addTeamMember(user)}>
                    {user.name} ({user.email || user.username})
                  </li>
                ))}
              </ul>

              {/* Team table */}
              {hazopTeam.length > 0 && (
                <table className="team-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email/Username</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hazopTeam.map((member) => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.email || member.username}</td>
                        <td>
                          <button onClick={() => removeTeamMember(member.id)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* --------------------- Footer Buttons --------------------- */}
        <div className="center-controls" style={{ marginTop: "20px" }}>
          <button type="button" className="outline-btn" onClick={closePopup}>
            Close
          </button>

          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HazopRegistration;
