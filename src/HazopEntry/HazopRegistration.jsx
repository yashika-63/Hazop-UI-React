import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaTimes } from "react-icons/fa";
import "./HazopRegistration.css";
import { fetchDataByKey, fetchSitesByDepartment, showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { useLocation } from "react-router-dom";
import _ from "lodash";
const HazopRegistration = ({ closePopup, onSaveSuccess, moc }) => {
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
  const location = useLocation();
  const hazopId = location.state?.hazopId;
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);



  useEffect(() => {
    if (hazopId) {
      // Fetch the single HAZOP data for editing
      fetchHazopById(hazopId);
    }
  }, [hazopId]);
  const companyId = localStorage.getItem("companyId");


  useEffect(() => {
    if (moc) {
      setFormData({
        hazopDate: moc.MOCDate ? moc.MOCDate.split("T")[0] : "", // YYYY-MM-DD
        hazopTitle: moc.MOCTitle || "",
        department: moc.Department || "",
        site: moc.Plant || "",
        description: "",
        verificationStatus: false,
        verificationComplitionStatus: false,
        completionStatus: false,
      });
    }
  }, [moc]);

  const refs = {
    hazopDate: React.createRef(),
    department: React.createRef(),
    site: React.createRef(),
    hazopTitle: React.createRef(),
    description: React.createRef()
  };


  const validate = () => {
    const newErrors = {};
    let firstErrorField = null;

    const setErr = (field, message) => {
      newErrors[field] = message;
      if (!firstErrorField) firstErrorField = field;
    };

    if (!formData.hazopDate) {
      setErr("hazopDate", "Date is required.");
      showToast("Date is required.", "warn");
    }

    if (!formData.department.trim()) {
      setErr("department", "Department is required.");
      showToast("Department is required.", "warn");
    }

    if (!formData.site.trim()) {
      setErr("site", "Site is required.");
      showToast("Site is required.", "warn");
    }

    if (!formData.hazopTitle.trim()) {
      setErr("hazopTitle", "Title is required.");
      showToast("Title is required.", "warn");
    }

    if (!formData.description.trim()) {
      setErr("description", "Description is required.");
      showToast("Description is required.", "warn");
    }

    setErrors(newErrors);

    return { isValid: Object.keys(newErrors).length === 0, firstErrorField };
  };




  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const deptData = await fetchDataByKey("department"); // only fetch departments initially
        setDepartmentOptions(deptData);

        // If moc has department, fetch sites for that department
        if (moc && moc.Department) {
          fetchSitesByDepartment(moc.Department, setSiteOptions);
        }
      } catch (err) {
        console.error("Error fetching dropdown data", err);
      }
    };

    fetchDropdowns();
  }, [moc]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Fetch sites when department changes and reset site field
    if (name === "department") {
      setFormData((prev) => ({ ...prev, site: "" })); // Reset site field when department changes
      fetchSitesByDepartment(value, setSiteOptions);
    }
  };



  const handleTeamSearchChange = (e) => {
    const value = e.target.value;
    setTeamSearch(value);
    debouncedFetch(value);
  };

  const debouncedFetch = _.debounce(async (value) => {
    if (value.length < 2) return setSearchResults([]);

    try {
      const response = await axios.get(
        `http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`
      );
      setSearchResults(response.data || []);
    } catch (err) {
      console.error("Team search failed:", err);
    }
  }, 400);


  const addTeamMember = (member) => {
    if (!hazopTeam.some((m) => m.empCode === member.empCode)) {
      setHazopTeam([...hazopTeam, { ...member, role: "Team Member" }]);
    }
    setTeamSearch("");
    setSearchResults([]);
  };

  const toggleRole = (empCode) => {
    setHazopTeam(hazopTeam.map((member) =>
      member.empCode === empCode ?
        { ...member, role: member.role === "Team Member" ? "Team Lead" : "Team Member" } :
        member
    ));
  };


  const removeTeamMember = (empCode) => {
    setHazopTeam(hazopTeam.filter((m) => m.empCode !== empCode));
  };


  const handleSave = async () => {
    const { isValid, firstErrorField } = validate();

    if (!isValid) {
      if (firstErrorField && refs[firstErrorField]?.current) {
        refs[firstErrorField].current.scrollIntoView({ behavior: "smooth", block: "center" });
        refs[firstErrorField].current.focus();
      }
      return;
    }
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
      // Step 1: Save HAZOP
      const hazopResponse = await axios.post(
        `http://${strings.localhost}/api/hazopRegistration/saveByCompany/${companyId}`,
        payload
      );

      const hazopId = hazopResponse.data.id;

      // Step 2: Save the HAZOP team (only if there are team members)
      if (hazopTeam.length > 0) {
        await axios.post(
          `http://${strings.localhost}/api/hazopTeam/saveTeam/${hazopId}`,
          hazopTeam.map((m) => m.empCode)
        );

        // Save roles for each member
        for (const member of hazopTeam) {
          await axios.post(
            `http://${strings.localhost}/api/hazopTeamRole/save?companyId=${companyId}&empCode=${member.empCode}&hazopRole=${member.role}`
          );
        }
      }
      // Step 3: Save MOC Reference after HAZOP is successfully saved
      await saveMocReference(hazopId);

      showToast("HAZOP saved successfully!", "success");

      if (onSaveSuccess) onSaveSuccess();
      closePopup();

    } catch (err) {
      console.error("Save failed:", err);
      showToast("Failed to save HAZOP", "error");
    }

    setLoading(false);
  };


  const saveMocReference = async (hazopId) => {
    try {
      await axios.post(
        `http://${strings.localhost}/api/moc-reference/save`,
        null,
        {
          params: {
            mocId: moc.MOCID, // mocId comes from the prop
            hazopRegistrationId: hazopId, // hazopId comes from HAZOP save response
            companyId
          }
        }
      );

      showToast("MOC Saved Successfully!", 'success');

      // Close the popup after MOC is saved
      closePopup();

    } catch (err) {
      const apiMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error saving MOC";

      showToast(apiMessage, "error");

      // Close the popup even if the MOC save fails
      closePopup();
    }
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



  const TeamTable = React.memo(({ hazopTeam, toggleRole, removeTeamMember, loading }) => (
    <table className="team-table">
      <thead>
        <tr>
          <th>Employee Code</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
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
              {member.role}
              <button
                type="button"
                onClick={() => toggleRole(member.empCode)}
                disabled={loading}
                className="role-change-btn"
              >
                {member.role === "Team Lead" ? "✔ Team Lead" : "Set as Team Lead"}
              </button>
            </td>
            <td>
              <button
                className="remove-button"
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
  ));


  return (
    <div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div className="modal-header">
        HAZOP Registration
        <button type="button" className="close-btn" onClick={closePopup} disabled={loading}>
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
              ref={refs.hazopDate}
              className={errors.hazopDate ? "error-input" : ""}
              name="hazopDate"
              value={formData.hazopDate}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <span className="required-marker">*</span>
            <label>Department</label>
            <select
              name="department"
              ref={refs.department}
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
              ref={refs.site}
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
            <span className="required-marker">*</span>
            <label>Title</label>
            <input
              type="text"
              ref={refs.hazopTitle}
              className={errors.hazopTitle ? "error-input" : ""}
              name="hazopTitle"
              value={formData.hazopTitle}
              onChange={handleChange}
              disabled={loading}
              maxLength={1000}
            />
            <small
              className={`char-count ${formData.hazopTitle.length >= 1000 ? "limit-reached" : ""}`}
            >
              {formData.hazopTitle.length}/1000
            </small>
          </div>
        </div>
        <div className="input-row">
          <div className="form-group">
            <span className="required-marker">*</span>
            <label>Description</label>
            <textarea
              name="description"
              ref={refs.description}
              className={`textareaFont ${errors.description ? "error-input" : ""}`}
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={6}
              maxLength={5000}
            />

            <small
              className={`char-count ${formData.description.length >= 5000 ? "limit-reached" : ""
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
          <TeamTable
            hazopTeam={hazopTeam}
            toggleRole={toggleRole}
            removeTeamMember={removeTeamMember}
            loading={loading}
          />
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
