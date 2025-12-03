import React, { useEffect, useState } from "react";
import axios, { formToJSON } from "axios";
import "./HazopPage.css";
import HazopRegistration from "./HazopRegistration";
import { FaEllipsisV, FaEye, FaEdit, FaTrash, FaTimes, FaLightbulb } from "react-icons/fa";
import AddHazopTeamPopup from "./AddHazopTeamPopup";
import { strings } from "../string";
import "../styles/global.css";
import { formatDate } from "../CommonUI/CommonUI";
import NodePage from "../AddNodeScreen/NodePage";
import { useNavigate } from "react-router-dom";
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
  const [hazopData, setHazopData] = useState(null); // Store the selected HAZOP data
  const [hazopTeam, setHazopTeam] = useState([]); // Store the selected team's members
  const [showNodePopup, setShowNodePopup] = useState(false); // Store the selected team's members
const navigate = useNavigate();
    const [newRegistered, setNewRegistered] = useState([]);
    const [pending, setPending] = useState([]);
    const [completed, setCompleted] = useState([]);
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [activeTab, setActiveTab] = useState("NewCreated");
    const openPopup = () => setShowPopup(true);
    const closePopup = () => setShowPopup(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showAddTeamPopup, setShowAddTeamPopup] = useState(false);
    const [hazopTeam, setHazopTeam] = useState([]);
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [selectedHazopForUpdate, setSelectedHazopForUpdate] = useState(null);

    const [selectedHazopForRecommendation, setSelectedHazopForRecommendation] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  const fetchColumns = async () => {
    try {
      const col1 = await axios.get(
        `http://${strings.localhost}/api/hazopRegistration/filter?companyId=1&status=true&completionStatus=true&sendForVerification=false`
      );
      console.log("response,", col1);
      const col2 = await axios.get(
        `http://localhost:5559/api/hazopRegistration/filter?companyId=1&status=true&completionStatus=true&sendForVerification=false`
      );
    const fetchColumns = async () => {
        try {
            const col1 = await axios.get(
                `http://${strings.localhost}/api/hazopRegistration/filter?companyId=1&status=true&completionStatus=false&sendForVerification=false`
            );
            console.log("response,", col1);
            const col2 = await axios.get(
                `http://${strings.localhost}/api/hazopRegistration/filter?companyId=1&status=true&completionStatus=false&sendForVerification=true`
            );

      const col3 = await axios.get(
        `http://localhost:5559/api/hazopRegistration/filter?companyId=1&status=true&completionStatus=true&sendForVerification=false`
      );
            const col3 = await axios.get(
                `http://${strings.localhost}/api/hazopRegistration/filter?companyId=1&status=true&completionStatus=true&sendForVerification=false`
            );

      setNewRegistered(col1.data);
      setPending(col2.data);
      setCompleted(col3.data);
    } catch (err) {
      console.error("Error loading HAZOP data:", err);
    }
  };

  const handleUpdate = (item) => {
    setHazopData(item);
    setHazopTeam(item.team || []);
    setShowAddTeamPopup(true);
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
  navigate(`/NodePage`, { state: { hazopData: item, hazopTeam: item.team || [] } });
};

   const closeNodePopup = (item) => {
    setShowNodePopup(false);
  };
  const closeAddTeamPopup = () => {
    setShowAddTeamPopup(false);
  };
    const handleRecommendation = (hazop) => {
        sessionStorage.setItem("hazopId", hazop.id);
        navigate('/RecommandationHandler'); // no id in URL
    };


  const renderDropdown = (item) => (
    <div className="dropdown">
      <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
        <FaEllipsisV />
      </button>

      {openDropdown === item.id && (
        <div className="dropdown-content">
          <button type="button" onClick={() => handleUpdate(item)}>
            <FaEdit /> Update
          </button>
          <button type="button" onClick={() => handleDelete(item)}>
            <FaTrash /> Delete
          </button>
          <button type="button" onClick={() => handleOpenNode(item)}>
            <FaTrash /> Open Node
          </button>
        </div>
      )}
    </div>
  );
            {openDropdown === item.id && (
                <div className="dropdown-content">
                    <button type="button" onClick={() => handleUpdate(item)}>
                        <FaEdit /> Update
                    </button>
                    <button type="button" onClick={() => handleRecommendation(item)}>
                        <FaLightbulb /> Recommendation
                    </button>
                </div>
            )}
        </div>
    );

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <h1>Hazop</h1>
        <div className="rightbtn-controls">
          <button className="create-btn" onClick={openPopup}>
            {" "}
            + Create Hazop{" "}
          </button>
        </div>
        <div className="kanban-container">
          <div className="kanban-column">
            <div
              className={`column-header menu-item ${
                activeTab === "NewCreated" ? "active" : ""
              }`}
              onClick={() => setActiveTab("NewCreated")}
            >
              New Registered
            </div>
            {newRegistered.map((item, idx) => (
              <div className="kanban-card" key={idx}>
                {renderDropdown(item)}
                <div className="card-title">{item.site || "Untitled"}</div>
                <div className="card-sub">{item.description}</div>
                <div className="dateBadge">
                  {formatDate(item.hazopCreationDate)}
                </div>
              </div>
            ))}
          </div>
    return (
        <div className="page-wrapper">
            <div className="page-card">
                <div className="form-title">Hazop</div>
                <div className="rightbtn-controls">
                    <button className="create-btn" onClick={openPopup}> + Create Hazop </button>
                </div>
                <div className="kanban-container">
                    <div className="kanban-column">
                        <div
                            className={`column-header menu-item ${activeTab === "NewCreated" ? "active" : ""}`}
                            onClick={() => setActiveTab("NewCreated")}
                        >
                            New Registered
                        </div>
                        {newRegistered.map((item, idx) => (
                            <div className="kanban-card" key={idx}>
                                 <div className="top-header"> {renderDropdown(item)}</div>
                                <div className="card-title">{item.site || "Untitled"}</div>
                                <div className="card-sub">{item.description}</div>
                                <div className="dateBadge">{formatDate(item.hazopCreationDate)}</div>
                            </div>
                        ))}
                    </div>

          <div className="kanban-column">
            <div
              className="column-header menu-item"
              onClick={() => setActiveTab("Pending")}
            >
              Pending
            </div>
            {pending.map((item, idx) => (
              <div className="kanban-card" key={idx}>
                {renderDropdown(item)}
                <div className="card-title">{item.site || "Untitled"}</div>
                <div className="card-sub">{item.description}</div>
                <div className="dateBadge">
                  {formatDate(item.hazopCreationDate)}
                </div>
              </div>
            ))}
          </div>
                    <div className="kanban-column">
                        <div
                            className="column-header menu-item"
                            onClick={() => setActiveTab("Pending")}
                        >
                            Pending
                        </div>
                        {pending.map((item, idx) => (
                            <div className="kanban-card" key={idx}>
                             <div className="top-header"> {renderDropdown(item)}</div>
                                <div className="card-title">{item.site || "Untitled"}</div>
                                <div className="card-sub">{item.description}</div>
                                <div className="dateBadge">{formatDate(item.hazopCreationDate)}</div>
                            </div>
                        ))}
                    </div>

          <div className="kanban-column">
            <div
              className={`column-header menu-item ${
                activeTab === "Completed" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Completed")}
            >
              Completed
            </div>
            {completed.map((item, idx) => (
              <div className="kanban-card" key={idx}>
                {renderDropdown(item)}
                <div className="card-title">{item.site || "Untitled"}</div>
                <div className="card-sub">{item.description}</div>
                <div className="dateBadge">
                  {formatDate(item.hazopCreationDate)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
                    <div className="kanban-column">
                        <div
                            className={`column-header menu-item ${activeTab === "Completed" ? "active" : ""}`}
                            onClick={() => setActiveTab("Completed")}
                        >
                            Completed
                        </div>
                        {completed.map((item, idx) => (
                            <div className="kanban-card" key={idx}>
                                <div className="top-header"> {renderDropdown(item)}</div>
                                <div className="card-title">{item.site || "Untitled"}</div>
                                <div className="card-sub">{item.description}</div>
                                <div className="dateBadge">{formatDate(item.hazopCreationDate)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

      {showPopup && (
        <div className="modal-overlay">
          <div className="modal-box">
            <HazopRegistration closePopup={closePopup} />
          </div>
        </div>
      )}

      {showAddTeamPopup && (
        <div className="modal-overlay">
          <div className="modal-box">
            <AddHazopTeamPopup
              closePopup={closeAddTeamPopup}
              hazopData={hazopData}
              existingTeam={hazopTeam}
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
    </div>
  );
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

        </div>
    );
};

export default HazopPage;
