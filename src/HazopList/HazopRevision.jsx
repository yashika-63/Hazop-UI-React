import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaTimes } from "react-icons/fa";
import "../HazopEntry/HazopRegistration.css";
import { fetchDataByKey, fetchSitesByDepartment, showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";

const HazopRevision = ({ hazopId, onClose }) => {
  const [formData, setFormData] = useState({
    hazopDate: "",
    site: "",
    hazopTitle: "",
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
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);

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
    if (name === "department") {
      setFormData((prev) => ({ ...prev, site: "" })); // Reset site field when department changes
      fetchSitesByDepartment(value, setSiteOptions);
    }
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
        `http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(
          value
        )}`
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
        message:
          "You have not added any team for this HAZOP. Do you want to proceed without adding a team?",
        yes: async () => {
          setConfirmPopup(null);
          await saveHazop();
        },
        no: () => {
          setConfirmPopup(null);
          showToast("Please click on Create HAZOP Team and proceed", "warn");
        },
      });
      return;
    }
    setConfirmPopup({
      message: "Do you want to save this HAZOP entry?",
      yes: async () => {
        setConfirmPopup(null);
        await saveHazop();
      },
      no: () => setConfirmPopup(null),
    });
  };

  const saveHazop = async () => {
    setLoading(true);

    try {
      // 1️⃣ Save new HAZOP entry
      const hazopResponse = await axios.post(
        `http://${strings.localhost}/api/hazopRegistration/saveByCompany/${companyId}`,
        formData
      );

      const newHazopId = hazopResponse.data.id;   // newly created HAZOP ID
      const oldHazopId = hazopId;                 // passed from parent component

      if (hazopTeam.length > 0) {
        await axios.post(
          `http://${strings.localhost}/api/hazopTeam/saveTeam/${newHazopId}`,
          hazopTeam.map((m) => ({
            empCode: m.empCode
            // name: m.name
          }))
        );
      }

      await axios.post(
        `http://${strings.localhost}/revision/saveRevision?oldHazopId=${oldHazopId}&newHazopId=${newHazopId}`,
        { params: { oldHazopId, newHazopId } }
      );

      showToast("HAZOP Revision saved successfully!", "success");
      onClose();

    } catch (err) {
      console.error("Save failed:", err);
      showToast("Failed to save HAZOP Revision", "error");
    }

    setLoading(false);
  };

  const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
    return (
      <div className="confirm-overlay">
        <div className="confirm-box">
          <p>{message}</p>
          <div className="confirm-buttons">
            <button type="button" onClick={onCancel} className="cancel-btn">
              No
            </button>
            <button type="button" onClick={onConfirm} className="confirm-btn">
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };



  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const deptData = await fetchDataByKey("department");
        setDepartmentOptions(deptData);

      } catch (err) {
        console.error("Error fetching dropdown data", err);
      }
    };

    fetchDropdowns();
  }, []);
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        <div className="modal-header">
          Hazop Revision
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-content">
          <div className="input-row">
            <div className="form-group">
              <label> <span className="required-marker">*</span>
                Hazop Date</label>
              <input
                type="date"
                name="hazopDate"
                value={formData.hazopDate}
                onChange={handleChange}
                disabled={loading}
                max={new Date().toISOString().split("T")[0]}
                className={errors.hazopDate ? "error-input" : ""}
              />
            </div>

            <div className="form-group">
              <label><span className="required-marker">*</span>
                Title</label>
              <input
                type="text"
                name="hazopTitle"
                value={formData.hazopTitle}
                onChange={handleChange}
                disabled={loading}
                className={errors.hazopTitle ? "error-input" : ""}
              />
            </div>

            <div className="form-group">
              <span className="required-marker">*</span>
              <label>Department</label>
              <select
                name="department"
                className={errors.department ? "error-input" : ""}
                value={formData.department}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">-- Select Department --</option>
                {departmentOptions.map((option) => (
                  <option key={option.id} value={option.data}>
                    {option.data}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <span className="required-marker">*</span>
              <label>Site</label>
              <select
                name="site"
                className={errors.site ? "error-input" : ""}
                value={formData.site}
                onChange={handleChange}
                disabled={loading || !formData.department}
              >
                <option value="">-- Select Site --</option>
                {siteOptions.map((option) => (
                  <option key={option.id} value={option.data}>
                    {option.data}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-row">
            <div className="form-group">
              <label><span className="required-marker">*</span>
                Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                className={`textareaFont ${errors.description ? "error-input" : ""}`}
              ></textarea>
            </div>
          </div>

          <div className="rightbtn-controls">
            <button
              type="button"
              className="add-btn"
              onClick={() => setShowTeamSearch(!showTeamSearch)}
              disabled={loading}
            >
              + Create HAZOP Team
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
                      {user.empCode}- ({user.emailId || "NA"}) (
                      {user.department || "NA"})
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
              onClick={onClose}
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
    </div>
  );
};


export default HazopRevision;