import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaTimes } from "react-icons/fa";
import "./HazopRegistration.css";
import { showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { useLocation } from "react-router-dom";

const HazopRegistration = ({ closePopup, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    hazopDate: "",
    site: "",
    hazopTitle: '',
    department: "",
    description: "",
    verificationStatus: false,
    verificationComplitionStatus: false,
    completionStatus: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hazopTeam, setHazopTeam] = useState([]);
  const [showTeamSearch, setShowTeamSearch] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(null);
  const location = useLocation();
  const hazopId = location.state?.hazopId;

  useEffect(() => {
    if (hazopId) {
      // Fetch the single HAZOP data for editing
      fetchHazopById(hazopId);
    }
  }, [hazopId]);
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    if (loading) {
      document.body.classList.add("loading");
    } else {
      document.body.classList.remove("loading");
    }
  }, [loading]);

  const validate = () => {
    const newErrors = {};

    if (!formData.hazopDate) {
      newErrors.hazopDate = "Date is required.";
      showToast("Date is required", "warn");
    }
    if (!formData.site.trim()) {
      newErrors.site = "Site is required.";
      showToast("Site is required.", "warn");
    } else if (!/^[A-Za-z0-9\s,-]+$/.test(formData.site)) {
      newErrors.site = "Only letters, numbers, commas & hyphens allowed.";
    }
    if (!formData.hazopTitle.trim()) {
      newErrors.hazopTitle = "Title is required.";
      showToast("Title is required.", "warn");
    } else if (!/^[A-Za-z0-9\s,-]+$/.test(formData.hazopTitle)) {
      newErrors.hazopTitle = "Only letters, numbers, commas & hyphens allowed.";
    }
    if (!formData.department.trim()) {
      newErrors.department = "Department is required.";
      showToast("Department is required.", "warn");
    } else if (!/^[A-Za-z\s]+$/.test(formData.department)) {
      newErrors.department = "Only alphabets allowed.";
      showToast("Only alphabets are allowed in department.", "warn");
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
      showToast("Description is required.", "warn");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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
      console.error("Team search failed:", err);
    }
  };

  const addTeamMember = (member) => {
    if (!hazopTeam.some((m) => m.empCode === member.empCode)) {
      setHazopTeam([...hazopTeam, member]);
    }
    setTeamSearch("");
    setSearchResults([]);
  };

  const removeTeamMember = (empCode) => {
    setHazopTeam(hazopTeam.filter((m) => m.empCode !== empCode));
  };


  const handleSave = async () => {
    if (!validate()) return;

    // CASE 1: No team selected
    if (hazopTeam.length === 0) {
      setConfirmPopup({
        message: "You have not added any team for this HAZOP. Do you want to proceed without adding a team?",
        yes: async () => {
          setConfirmPopup(null);
          await saveHazop();
        },
        no: () => {
          setConfirmPopup(null);
          showToast("Please click on Add HAZOP Team and proceed", "warn");
        }
      });
      return;
    }

    // CASE 2: Team is present → ask confirmation before saving
    setConfirmPopup({
      message: "Do you want to save this HAZOP entry?",
      yes: async () => {
        setConfirmPopup(null);
        await saveHazop();
      },
      no: () => setConfirmPopup(null)
    });
  };

  const saveHazop = async () => {
    setLoading(true);

    try {
      const createdBy = localStorage.getItem("fullName") || "";
      const empCode = localStorage.getItem("empCode") || "";
      const createdByEmail = localStorage.getItem("email") || "";

      const payload = {
        ...formData,
        createdBy,
        empCode,
        createdByEmail
      };

      const hazopResponse = await axios.post(
        `http://${strings.localhost}/api/hazopRegistration/saveByCompany/${companyId}`,
        payload
      );

      const hazopId = hazopResponse.data.id;

      if (hazopTeam.length > 0) {
        await axios.post(
          `http://${strings.localhost}/api/hazopTeam/saveTeam/${hazopId}`,
          hazopTeam.map((m) => m.empCode)
        );
      }

      showToast("HAZOP saved successfully!", "success");

      if (onSaveSuccess) onSaveSuccess(); 
      closePopup();

    } catch (err) {
      console.error("Save failed:", err);
      showToast("Failed to save HAZOP", "error");
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

  return (
    <div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div className="modal-header">
        HAZOP Registration
        <button className="close-btn" onClick={closePopup} disabled={loading}>
          <FaTimes />
        </button>
      </div>

      <div className="modal-content">
        <div className="input-row">
          <div className="form-group">
            <span className="required-marker">*</span>
            <label>HAZOP Date</label>
            <input
              type="date"
              name="hazopDate"
              value={formData.hazopDate}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <span className="required-marker">*</span>
            <label>Title</label>
            <input
              type="text"
              name="hazopTitle"
              value={formData.hazopTitle}
              onChange={handleChange}
              disabled={loading}
            maxLength={1000}
                  />
                  <small
                    className={`char-count ${
                      formData.hazopTitle.length >= 1000 ? "limit-reached" : ""
                    }`}
                  >
                    {formData.hazopTitle.length}/1000
                  </small>
          </div>
          <div className="form-group">
            <span className="required-marker">*</span>
            <label>Site</label>
            <input
              type="text"
              name="site"
              value={formData.site}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <span className="required-marker">*</span>
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="input-row">
          <div className="form-group">
            <span className="required-marker">*</span>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={6}
              className="textareaFont"
            maxLength={5000}
                  />
                  <small
                    className={`char-count ${
                      formData.description.length >= 5000 ? "limit-reached" : ""
                    }`}
                  >
                    {formData.description.length}/5000
                  </small>
          </div>
        </div>

        <div className="rightbtn-controls">
          <button
            type="button"
            className="add-btn"
            onClick={() => setShowTeamSearch(!showTeamSearch)}
            disabled={loading}
          >
            + Add HAZOP Team
          </button>
        </div>

        {showTeamSearch && (
          <div className="Search-container">
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
                    {user.empCode}- ({user.emailId || "NA"}) ({user.department || 'NA'})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {hazopTeam.length > 0 && (
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
                  <td>
                    {member.firstName} {member.lastName}
                  </td>
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
        )}
        {confirmPopup && (
          <ConfirmationPopup
            message={confirmPopup.message}
            onConfirm={confirmPopup.yes}
            onCancel={confirmPopup.no}
          />
        )}

        {/* Footer Buttons */}
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
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HazopRegistration;
