import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HazopPage.css";
import { FaPlusCircle, FaSpinner, FaCheckCircle, FaSearch, FaTimes } from "react-icons/fa";
import AddHazopTeamPopup from "./AddHazopTeamPopup";
import { strings } from "../string";
import "../styles/global.css";
import { showToast } from "../CommonUI/CommonUI";
import NodePage from "../AddNodeScreen/NodePage";
import { useNavigate } from "react-router-dom";
import HazopRegistration from "./HazopRegistration";
import HazopCard from "./HazopCard";

const HazopPage = () => {
  // Data States
  const [newRegistered, setNewRegistered] = useState([]);
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  
  // UI States
  const [showPopup, setShowPopup] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showNodePopup, setShowNodePopup] = useState(false);
  const [showSendCompletionPopup, setShowSendCompletionPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  
  // Selection States
  const [hazopData, setHazopData] = useState(null);
  const [hazopTeam, setHazopTeam] = useState([]);
  const [selectedHazopForUpdate, setSelectedHazopForUpdate] = useState(null);
  const [selectedHazopForSend, setSelectedHazopForSend] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Search/Loading States
  const [teamSearch, setTeamSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const companyId = localStorage.getItem("companyId");

  const [expanded, setExpanded] = useState({
    newRegistered: true,
    pending: true,
    completed: true
  });

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  useEffect(() => {
    fetchColumns();
  }, []);

  // --- OPTIMIZED FETCH: Only fetches the list, not the details ---
  const fetchColumns = async () => {
    setLoading(true);
    try {
      const [col1Res, col2Res, col3Res] = await Promise.allSettled([
        axios.get(`http://${strings.localhost}/api/hazopRegistration/filter?companyId=${companyId}&status=true&completionStatus=false&sendForVerification=false`),
        axios.get(`http://${strings.localhost}/api/hazopRegistration/filter?companyId=${companyId}&status=true&completionStatus=false&sendForVerification=true`),
        axios.get(`http://${strings.localhost}/api/hazopRegistration/recent-top-10?companyId=${companyId}&status=true&completionStatus=true`)
      ]);

      if (col1Res.status === "fulfilled") setNewRegistered(col1Res.value.data || []);
      if (col2Res.status === "fulfilled") setPending(col2Res.value.data || []);
      if (col3Res.status === "fulfilled") setCompleted(col3Res.value.data || []);

    } catch (err) {
      console.error("Error fetching columns:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
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
    localStorage.setItem("hazopData", JSON.stringify(item));
    localStorage.setItem("hazopTeam", JSON.stringify(item.team || []));
    navigate(`/NodePage`);
  };

  const closeNodePopup = () => setShowNodePopup(false);
  
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
      const response = await axios.get(`http://${strings.localhost}/api/employee/search?search=${encodeURIComponent(value)}`);
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

  const handleNavigate = (item) => navigate(`/HazopWorkflow/${item.id}`);
  
  const handleViewHazop = (item) => {
    localStorage.setItem("hazopId", item.id);
    navigate("/HazopView");
  };

  const handleViewDashboard = (item) => {
    localStorage.setItem("hazopId", item.id);
    navigate("/Dashboard");
  };

  const refreshHazopData = () => fetchColumns();



  const getFullName = (user) =>
  [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <div className="rightbtn-controls">
          <button className="add-btn" onClick={openPopup}> + Create Hazop </button>
        </div>
        <div className="kanban-wrapper">
          <div className="kanban-titles">
            <div className="kanban-title"><FaPlusCircle style={{ marginRight: 6 }} /> New Registered</div>
            <div className="kanban-title"><FaSpinner style={{ marginRight: 6 }} /> OnGoing</div>
            <div className="kanban-title"><FaCheckCircle style={{ marginRight: 6 }} /> Completed</div>
          </div>
          
          <div className="kanban-container">
            {/* New Registered */}
            <div className="kanban-column new-col">
              <div className="column-header">
                <span className="toggle-btn" onClick={() => toggleExpand("newRegistered")}>
                  {expanded.newRegistered ? "+" : "-"}
                </span>
              </div>
              {expanded.newRegistered && newRegistered.map((item, idx) => (
                <HazopCard
                    key={item.id}
                    item={item}
                    columnType="new"
                    openDropdown={openDropdown}
                    toggleDropdown={toggleDropdown}
                    handleOpenNode={handleOpenNode}
                    handleUpdate={handleUpdate}
                    handleRecommendation={handleRecommendation}
                    openSendCompletionPopup={openSendCompletionPopup}
                    handleNavigate={handleNavigate}
                    handleViewDashboard={handleViewDashboard}
                    handleViewHazop={handleViewHazop}
                />
              ))}
            </div>

            {/* Pending */}
            <div className="kanban-column pending-col">
              <div className="column-header">
                <span className="toggle-btn" onClick={() => toggleExpand("pending")}>
                  {expanded.pending ? "+" : "-"}
                </span>
              </div>
              {expanded.pending && pending.map((item, idx) => (
                <HazopCard 
                    key={item.id}
                    item={item}
                    columnType="pending"
                    openDropdown={openDropdown}
                    toggleDropdown={toggleDropdown}
                    handleViewDashboard={handleViewDashboard}
                    handleViewHazop={handleViewHazop}
                />
              ))}
            </div>

            {/* Completed */}
            <div className="kanban-column completed-col">
              <div className="column-header">
                <span className="toggle-btn" onClick={() => toggleExpand("completed")}>
                  {expanded.completed ? "+" : "-"}
                </span>
              </div>
              {expanded.completed && completed.map((item, idx) => (
                <HazopCard 
                    key={item.id}
                    item={item}
                    columnType="completed"
                    openDropdown={openDropdown}
                    toggleDropdown={toggleDropdown}
                    handleViewDashboard={handleViewDashboard}
                    handleViewHazop={handleViewHazop}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
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

      {showConfirmPopup && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            <h3>Are you sure?</h3>
            <p>Do you want to send {selectedHazopForSend?.hazopTitle} HAZOP for completion?</p>
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
                      {getFullName(user)} ({user.empCode}) – ({user.emailId || "NA"}) ({user.department || "NA"})
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
                  <FaTimes onClick={() => setSelectedEmployee(null)} className="remove-icon" />
                </span>
              </div>
            )}
            <div className="confirm-buttons">
              <button className="cancel-btn" onClick={() => setShowSendCompletionPopup(false)}> Cancel </button>
              <button className="confirm-btn" disabled={!selectedEmployee} onClick={() => setShowConfirmPopup(true)}>
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