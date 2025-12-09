import React, { useEffect, useState } from "react";
import axios, { formToJSON } from "axios";
import "./HazopPage.css";
import HazopRegistration from "./HazopRegistration";
import { FaEllipsisV, FaEye, FaEdit, FaTrash, FaTimes, FaLightbulb, FaSearch, FaCheckCircle } from "react-icons/fa";
import AddHazopTeamPopup from "./AddHazopTeamPopup";
import { strings } from "../string";
import "../styles/global.css";
import { formatDate, showToast } from "../CommonUI/CommonUI";
import NodePage from "../AddNodeScreen/NodePage";
import { useNavigate } from "react-router-dom";

const HazopPage = () => {
  const [newRegistered, setNewRegistered] = useState([]);
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("NewCreated");
  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showAddTeamPopup, setShowAddTeamPopup] = useState(false);
  const [hazopData, setHazopData] = useState(null);
  const [hazopTeam, setHazopTeam] = useState([]);
  const [showNodePopup, setShowNodePopup] = useState(false);
  const navigate = useNavigate();
  const [selectedHazopForUpdate, setSelectedHazopForUpdate] = useState(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(null);
  const [showSendCompletionPopup, setShowSendCompletionPopup] = useState(false);
  const [selectedHazopForSend, setSelectedHazopForSend] = useState(null);
  const [teamSearch, setTeamSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const companyId = localStorage.getItem("companyId");
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };


  const [expanded, setExpanded] = useState({
    newRegistered: true,
    pending: true,
    completed: true
  });

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  const fetchColumns = async () => {
    try {
      const col1 = await axios.get(
        `http://${strings.localhost}/api/hazopRegistration/filter?companyId=${companyId}&status=true&completionStatus=false&sendForVerification=false`
      );
      console.log("response,", col1);
      const col2 = await axios.get(
        `http://${strings.localhost}/api/hazopRegistration/filter?companyId=${companyId}&status=true&completionStatus=false&sendForVerification=true`
      );

      const col3 = await axios.get(
        `http://${strings.localhost}/api/hazopRegistration/filter?companyId=${companyId}&status=true&completionStatus=true&sendForVerification=false`
      );
      const col1WithCount = await Promise.all(
        col1.data.map(async (item) => ({
          ...item,
          peopleCount: await fetchTeamCount(item.id)
        }))
      );

      const col2WithCount = await Promise.all(
        col2.data.map(async (item) => ({
          ...item,
          peopleCount: await fetchTeamCount(item.id)
        }))
      );

      const col3WithCount = await Promise.all(
        col3.data.map(async (item) => ({
          ...item,
          peopleCount: await fetchTeamCount(item.id)
        }))
      );

      setNewRegistered(col1WithCount);
      setPending(col2WithCount);
      setCompleted(col3WithCount);

    } catch (err) {
      console.error("Error loading HAZOP data:", err);
    }
  };


  const handleUpdate = (hazop) => {
    setSelectedHazopForUpdate(hazop);
    setShowUpdatePopup(true);
    setOpenDropdown(null);
    setHazopTeam(hazop.team || []);
  };

  const closeUpdatePopup = () => {
    setSelectedHazopForUpdate(null);
    setShowUpdatePopup(false);
  };

  const handleOpenNode = (item) => {
    navigate(`/NodePage`, {
      state: { hazopData: item, hazopTeam: item.team || [] },
    });
  };

  const closeNodePopup = (item) => {
    setShowNodePopup(false);
  };
  const closeAddTeamPopup = () => {
    setShowAddTeamPopup(false);
  };
  const handleRecommendation = (hazop) => {
    sessionStorage.setItem("hazopId", hazop.id);
    navigate('/RecommandationHandler');
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
  const addTeamMember = (user) => {
    setSelectedEmployee(user);
    setSearchResults([]);
    setTeamSearch(`${user.empCode}`);
  };

  const openSendCompletionPopup = (hazop) => {
    setSelectedHazopForSend(hazop);
    setShowSendCompletionPopup(true);
    setSelectedEmployee(null);
    setTeamSearch("");
  };


  const sendForCompletion = async () => {
    if (!selectedEmployee || !selectedHazopForSend) return;

    setLoading(true);
    try {
      await axios.post(
        `http://${strings.localhost}/api/hazopRegistration/hazop/sendForVerification/${selectedHazopForSend.id}/${encodeURIComponent(selectedEmployee.empCode)}`
      );

      setShowConfirmPopup(false);
      setShowSendCompletionPopup(false);
      showToast("Hazop Send for Completion Successfully.", 'success');
      fetchColumns();
    } catch (err) {
      console.error("Send completion error:", err);
      showToast("Error While sending hazop.", 'error');
    } finally {
      setLoading(false);
    }
  };


  const fetchTeamCount = async (hazopId) => {
    try {
      const res = await axios.get(
        `http://${strings.localhost}/api/hazopTeam/count/${hazopId}`
      );

      return Number(res.data) || 0;  // API returns raw number
    } catch (err) {
      console.error("Error fetching team count:", err);
      return 0;
    }
  };


  const renderDropdown = (item, isNewRegistered) => (
    <div className="dropdown">
      <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
        <FaEllipsisV />
      </button>

      {openDropdown === item.id && (
        <div className="dropdown-content">
          <button type="button" onClick={() => handleOpenNode(item)}>
            <FaEye /> Open Node
          </button>
          <button type="button" onClick={() => handleUpdate(item)}>
            <FaEdit /> Add Team
          </button>
          <button type="button" onClick={() => handleRecommendation(item)}>
            <FaLightbulb /> Recommendation
          </button>
          {isNewRegistered && (
            <button type="button" onClick={() => openSendCompletionPopup(item)}>
              <FaEye /> Send for Completion
            </button>
          )}
        </div>
      )}
    </div>
  );

  const truncateWords = (text, wordLimit = 4) => {
    if (!text) return "-";
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };


  const getInitial = (name) => {
    if (!name || typeof name !== "string") return null;

    return name.trim().charAt(0).toUpperCase();
  };


  const refreshHazopData = () => {
    fetchColumns(); // This already fetches all columns
  };

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <div className="rightbtn-controls">
          <button className="add-btn" onClick={openPopup}> + Create Hazop </button>
        </div>
        <div className="kanban-container">

          {/* New Registered */}
          <div className="kanban-column new-col">
            <div className="column-header">
              New Registered
              <span className="toggle-btn" onClick={() => toggleExpand("newRegistered")}>
                {expanded.new ? "_" : "+"}
              </span>
            </div>

            {expanded.newRegistered &&
              newRegistered.map((item, idx) => (
                <div
                  className={`kanban-card priority-${item.priority?.toLowerCase() || "medium"}`}
                  key={idx}
                >
                  <div className="card-top">
                    {item.verificationActionTaken === true && (
                      <span className="verified-badge"><FaCheckCircle /> Verified</span>
                    )}
                    <span className="card-date">{formatDate(item.hazopCreationDate)}</span>
                    {renderDropdown(item, true)}
                  </div>

                  <div className="card-title">{truncateWords(item.hazopTitle || "Untitled", 4)}</div>
                  <div className="card-sub">{truncateWords(item.description, 6)}</div>

                  <div className="card-footer">
                    <span className="people-count">👥 {item.peopleCount || 0} working</span>

                    <div className="avatar-group">
                      {(() => {
                        const initials = [];

                        const createdInitial = getInitial(item.createdBy);
                        const verifierInitial = getInitial(item.verificationemployeeName);

                        if (createdInitial) initials.push(createdInitial);
                        if (verifierInitial) initials.push(verifierInitial);

                        return initials.length > 0 ? (
                          initials.map((i, index) => (
                            <span className="avatar" key={index}>{i}</span>
                          ))
                        ) : null;
                      })()}
                    </div>

                  </div>
                </div>
              ))}
          </div>

          {/* Pending */}
          <div className="kanban-column pending-col">
            <div className="column-header">
              OnGoing
              <span className="toggle-btn" onClick={() => toggleExpand("pending")}>
                {expanded.pending ? "_" : "+"}
              </span>
            </div>

            {expanded.pending &&
              pending.map((item, idx) => (
                <div className="kanban-card priority-pending" key={idx}>
                  <div className="card-top">
                    {item.verificationActionTaken === true && (
                      <span className="verified-badge"><FaCheckCircle /> Verified</span>
                    )}
                    <span className="card-date">{formatDate(item.hazopCreationDate)}</span>
                    {renderDropdown(item, false)}
                  </div>

                  <div className="card-title">{truncateWords(item.hazopTitle, 4)}</div>
                  <div className="card-sub">{truncateWords(item.description, 6)}</div>

                  <div className="card-footer">
                    <span className="people-count">👥 {item.peopleCount || 0} working</span>
                    <div className="avatar-group">
                      {(() => {
                        const initials = [];

                        const createdInitial = getInitial(item.createdBy);
                        const verifierInitial = getInitial(item.verificationemployeeName);

                        if (createdInitial) initials.push(createdInitial);
                        if (verifierInitial) initials.push(verifierInitial);

                        return initials.length > 0 ? (
                          initials.map((i, index) => (
                            <span className="avatar" key={index}>{i}</span>
                          ))
                        ) : null;
                      })()}
                    </div>

                  </div>
                </div>
              ))}
          </div>

          {/* Completed */}
          <div className="kanban-column completed-col">
            <div className="column-header">
              Completed
              <span className="toggle-btn" onClick={() => toggleExpand("completed")}>
                {expanded.completed ? "_" : "+"}
              </span>
            </div>

            {expanded.completed &&
              completed.map((item, idx) => (
                <div className="kanban-card priority-low" key={idx}>
                  <div className="card-top">
                    {item.verificationActionTaken === true && (
                      <span className="verified-badge"><FaCheckCircle />  Verified</span>
                    )}
                    <span className="card-date">{formatDate(item.hazopCreationDate)}</span>
                    {renderDropdown(item, false)}
                  </div>

                  <div className="card-title">{truncateWords(item.hazopTitle, 4)}</div>
                  <div className="card-sub">{truncateWords(item.description, 6)}</div>

                  <div className="card-footer">
                    <span className="people-count">👥 {item.peopleCount || 0} working</span>
                    <div className="avatar-group">
                      {(() => {
                        const initials = [];

                        const createdInitial = getInitial(item.createdBy);
                        const verifierInitial = getInitial(item.verificationemployeeName);

                        if (createdInitial) initials.push(createdInitial);
                        if (verifierInitial) initials.push(verifierInitial);

                        return initials.length > 0 ? (
                          initials.map((i, index) => (
                            <span className="avatar" key={index}>{i}</span>
                          ))
                        ) : null;
                      })()}
                    </div>

                  </div>
                </div>
              ))}
          </div>

        </div>

      </div>

      {showPopup && (
        <div className="modal-overlay">
          <div className="modal-box">
            <HazopRegistration closePopup={closePopup} onSaveSuccess={refreshHazopData} />
          </div>
        </div>
      )}

      {showUpdatePopup && selectedHazopForUpdate && (
        <div className="modal-overlay">
          <div className="modal-box">
            <AddHazopTeamPopup
              closePopup={closeUpdatePopup}
              hazopData={selectedHazopForUpdate}
              existingTeam={selectedHazopForUpdate.team || []}
            />
          </div>
        </div>
      )}

      {showNodePopup && (
        <NodePage
          closePopup={closeNodePopup}
          hazopData={hazopData}
          existingTeam={hazopTeam}
        />
      )}
      {showUpdatePopup && selectedHazopForUpdate && (
        <div className="modal-overlay">
          <div className="modal-box">
            <AddHazopTeamPopup
              closePopup={closeUpdatePopup}
              hazopData={selectedHazopForUpdate}
              existingTeam={selectedHazopForUpdate.team || []}
            />
          </div>
        </div>
      )}
      {showConfirmPopup && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            <h3>Are you sure?</h3>
            <p>Do you want to send {selectedHazopForSend.hazopTitle}HAZOP for completion?</p>
            <div className="confirm-buttons">
              <button className="cancel-btn" onClick={() => setShowConfirmPopup(false)}>No</button>
              <button className="confirm-btn" onClick={sendForCompletion}>Yes</button>
            </div>
          </div>
        </div>
      )}
      {showSendCompletionPopup && (
        <div className="modal-overlay">
          <div className="modal-body">

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
                      {user.empCode} - ({user.emailId || "NA"}) ({user.department || "NA"})
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
                  <span className="value">{selectedEmployee.firstName} {selectedEmployee.middleName} {selectedEmployee.lastName}</span>
                </div>
                <div className="details-row">
                  <span className="label">Email:</span>
                  <span className="value">{selectedEmployee.emailId}</span>
                </div>
                <div className="details-row">
                  <span className="label">Employee Code:</span>
                  <span className="value">{selectedEmployee.empCode}</span>
                </div>
                <span className="value selected-employee-value">
                  <FaTimes
                    onClick={() => setSelectedEmployee(null)}
                    className="remove-icon"
                  />
                </span>
              </div>
            )}
            <div className="confirm-buttons">
              <button className="cancel-btn" onClick={() => setShowSendCompletionPopup(false)}> Cancel </button>

              <button
                className="confirm-btn"
                disabled={!selectedEmployee}
                onClick={() => setShowConfirmPopup(true)}
              >
                Send for Completion
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default HazopPage;
