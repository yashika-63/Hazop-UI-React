import React, { useState, useEffect } from "react";
import "./Node.css";
import { formatDate, showToast } from "../CommonUI/CommonUI";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { strings } from "../string";
import { FaEllipsisV } from "react-icons/fa";
import { FaSquareCheck } from "react-icons/fa6";
import NodePopup from "./NodePopup";

const NodePage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [hazopTeam, setHazopTeam] = useState([]);
  const [originalTeam, setOriginalTeam] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mocDetails, setMocDetails] = useState(null);
  const [hasMoc, setHasMoc] = useState(false);
  const [hazopData , setHazopData] = useState();
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const setSelectedRevisionId = (id) => {
    console.log("Selected revision ID:", id);
    // Add your completion logic here later
  };




  
  useEffect(() => {
    // Retrieve the data from localStorage
    const storedHazopData = localStorage.getItem("hazopData");
    const storedHazopTeam = localStorage.getItem("hazopTeam");

    if (storedHazopData) {
      setHazopData(JSON.parse(storedHazopData));
    }

    if (storedHazopTeam) {
      setHazopTeam(JSON.parse(storedHazopTeam));
    }
  }, []);

  // useEffect(() => {
  //   if (stateTeam) {
  //     setHazopTeam(stateTeam);
  //     setOriginalTeam(stateTeam);
  //   }
  // }, [stateTeam]);

  const fetchNodes = async () => {
    if (!hazopData?.id) {
      console.error("No hazopData or hazopData.id available");
      return;
    }
    try {
      const response = await axios.get(
        `http://${strings.localhost}/api/hazopNode/by-registration-status?registrationId=${hazopData.id}&status=true`
      );
      setNodes(response.data);
    } catch (error) {
      console.error("Error fetching nodes:", error);
    }
  };


  useEffect(() => {
    if (!hazopData?.id) {
      console.log("No hazopData or hazopData.id is missing");
      return;
    }
      fetchNodes();
  }, [hazopData]);
  
  const handleSaveNode = async () => {
    await fetchNodes();
    setShowPopup(false);
  };

  useEffect(() => {
    setShowFullDescription(false);
  }, [hazopData]);

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

  const renderDropdown = (item) => (
    <div className="dropdown">
      <button
        className="dots-button"
        onClick={(e) => {
          toggleDropdown(item.id);
        }}
      >
        <FaEllipsisV />
      </button>

      {openDropdown === item.id && (
        <div className="dropdown-content">
          <button
            type="button"
            onClick={(e) => {
              setSelectedRevisionId(item.id);
            }}
          >
            <FaSquareCheck /> Complete
          </button>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (!hazopData?.id) return;

    const fetchMocDetails = async () => {
      try {
        const res = await axios.get(
          `http://${strings.localhost}/api/moc-reference/by-hazop?hazopRegistrationId=${hazopData.id}`
        );

        setMocDetails(res.data);
        setHasMoc(true);
      } catch (err) {
        console.error("MOC Error:", err);

        setHasMoc(false);
        setMocDetails(null);
      }
    };

    fetchMocDetails();
  }, [hazopData]);

  return (
    <div>
      <div className="node-header">
        <button className="nd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Hazop Information</h1>
      </div>
      <div className="hazop-info">
        {hazopData ? (
          <div className="hazop-info-grid">
            <div>
              <strong>ID:</strong> {hazopData.id}
            </div>
            <div>
              <strong>Title:</strong> {hazopData.hazopTitle}
            </div>
            <div>
              <strong>Site:</strong> {hazopData.site}
            </div>
            <div>
              <strong>Department:</strong> {hazopData.department}
            </div>
            <div>
              <strong>HAZOP Date:</strong> {formatDate(hazopData.hazopDate)}
            </div>
            <div>
              <strong>Completion Status:</strong>{" "}
              <span
                className={
                  hazopData?.completionStatus === true
                    ? "status-completed"
                    : "status-pending"
                }
              >
                {hazopData.completionStatus ? "Completed" : "Ongoing"}
              </span>
            </div>
            <div>
              <strong>Status:</strong>{" "}
              {hazopData.status ? "Active" : "Inactive"}
            </div>
            <div>
              <strong>Send for Verification:</strong>{" "}
              {hazopData.sendForVerification ? "Yes" : "No"}
            </div>
            <div>
              <strong>Created By:</strong> {hazopData.createdBy || "N/A"}
            </div>
            <div>
              <strong>Email:</strong> {hazopData.createdByEmail || "N/A"}
            </div>
            {hazopData.hazopRevisionNo && (
              <div>
                <strong>Hazop Revision No.:</strong> {hazopData.hazopRevisionNo}
              </div>
            )}
            <div className="full-width">
              <strong>Description:</strong>
              <div
                className={
                  showFullDescription ? "description-full" : "description-clamp"
                }
              >
                {hazopData.description}
              </div>
              {hazopData.description && hazopData.description.length > 100 && (
                <button
                  type="button"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="read-more-btn"
                >
                  {showFullDescription ? "Read Less" : "Read More"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <p>No HAZOP data available.</p>
        )}

        <div className="rightbtn-controls">
          <h6
            style={{ cursor: "pointer" }}
            onClick={() => setShowAllMembers(!showAllMembers)}
          >
            View Total Group Members: {hazopTeam.length}
          </h6>
        </div>

        {showAllMembers && (
          <div className="table-section">
            <div className="card table-card">
              <table>
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Employee Code</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Email Id</th>
                  </tr>
                </thead>
                <tbody>
                  {hazopTeam.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="no-data">
                        No members added yet.
                      </td>
                    </tr>
                  ) : (
                    hazopTeam.map((m, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{m.empCode}</td>
                        <td>
                          {m.firstName} {m.lastName}
                        </td>
                        <td>{m.dimension1}</td>
                        <td>{m.emailId}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {hasMoc && mocDetails && (
          <div>
            <h1>MOC Details</h1>

            {mocDetails.length > 0 ? (
              mocDetails.map((moc, index) => (
                <div key={moc.id} className="hazop-info-grid">
                  <div>
                    <strong>MOC ID:</strong> {moc.id}
                  </div>
                  <div>
                    <strong>MOC No.:</strong> {moc.mocNo}
                  </div>
                  <div>
                    <strong>Register Date:</strong>{" "}
                    {formatDate(moc.registerDate)}
                  </div>
                  <div>
                    <strong>MOC Date:</strong> {formatDate(moc.mocDate)}
                  </div>
                  <div>
                    <strong>Title:</strong> {moc.mocTitle}
                  </div>
                  <div>
                    <strong>Plant:</strong> {moc.mocPlant}
                  </div>
                </div>
              ))
            ) : (
              <p>No MOC details available.</p>
            )}
          </div>
        )}
      </div>

      <div className="table-section">
        <div className="table-header">
          <h1>Nodes</h1>
          <button
            type="button"
            className="add-btn"
            onClick={() => {
              console.log("Add Node clicked");
              setShowPopup(true);
            }}
          >
            + Add Node
          </button>

        </div>

        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Node No.</th>
                <th>Registration Date</th>
                <th>Design Intent</th>
                <th>Completion Status</th>
              </tr>
            </thead>
            <tbody>
              {nodes.length === 0 ? (
                <tr>
                  <td colSpan="11" className="no-data">
                    No nodes added yet.
                  </td>
                </tr>
              ) : (
                nodes.map((n, idx) => (
                  <tr
                    key={n.id}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/NodeDetails`, { state: { id: n.id } })
                    }
                  >
                    <td>{idx + 1}</td>
                    <td>{n.nodeNumber}</td>
                    <td>{formatDate(n.registrationDate)}</td>
                    <td>{n.designIntent}</td>
                    <td>
                      <span
                        className={
                          n.completionStatus === true
                            ? "status-completed"
                            : n.completionStatus === false
                              ? "status-pending"
                              : "status-pending"
                        }
                      >
                        {n.completionStatus === true ? "Completed" : "Ongoing"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPopup && (
        <NodePopup
          onClose={() => setShowPopup(false)}
          onSave={handleSaveNode}
          hazopData={hazopData}
        />
      )}
    </div>
  );
};

export default NodePage;
