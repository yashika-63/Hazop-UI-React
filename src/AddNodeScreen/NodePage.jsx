import React, { useState, useEffect } from "react";
import "./Node.css";
import NodePopup from "./NodePopup";
import { formatDate, showToast } from "../CommonUI/CommonUI";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { strings } from "../string";

const NodePage = ({ hazopData: propHazopData, hazopTeam: propHazopTeam }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const navigate = useNavigate();
     const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { hazopData } = location.state || {
    hazopData: propHazopData,
    hazopTeam: [],
  };
  const [showFullDescription, setShowFullDescription] = useState(false);
const [hazopTeam, setHazopTeam] = useState([]);
    const [originalTeam, setOriginalTeam] = useState([]);

  useEffect(() => {
    console.log("hazopTeam:", hazopTeam);
  }, [hazopTeam]);

  // Fetch nodes from API on component mount
  useEffect(() => {
    const fetchNodes = async () => {
      if (!hazopData?.id) return;
      try {
        const response = await fetch(
          `http://localhost:5559/api/hazopNode/by-registration-status?registrationId=${hazopData.id}&status=true`
          `http://${strings.localhost}/api/hazopNode/by-registration-status?registrationId=1&status=true`
        );
        const data = await response.json();
        setNodes(data);
      } catch (error) {
        console.error("Error fetching nodes:", error);
      }
    };

    fetchNodes();
  }, [hazopData]);

  const handleSaveNode = (node) => {
    setNodes([...nodes, node]);
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
      `http://localhost:5559/api/hazopTeam/teamByHazop/${hazopId}?status=true`
    );
    setHazopTeam(response.data || []); // Use setHazopTeam, not hazopTeam
    setOriginalTeam(response.data || []);
  } catch (err) {
    console.error("Error fetching team:", err);
    showToast("Failed to load existing team.", "error");
  }
  setLoading(false);
};

  return (
    <div>
      {/* HAZOP INFO CARD */}
      <div>
        <h1>Hazop Information</h1>

        <div className="hazop-info">
          {hazopData ? (
            <div className="hazop-info-grid">
              <div>
                <strong>ID:</strong> {hazopData.id}
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
                {hazopData.completionStatus ? "Completed" : "Pending"}
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
              <div className="full-width">
                <strong>Description:</strong>
                <div
                  className={
                    showFullDescription
                      ? "description-full"
                      : "description-clamp"
                  }
                >
                  {hazopData.description}
                </div>
                {hazopData.description &&
                  hazopData.description.length > 100 && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
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

          <div className="roghtbtn-controls">
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
                                        <td>{m.firstName} {m.lastName}</td>
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
        </div>
      </div>

      {/* BUTTON + TABLE */}
      <div className="table-section">
        <div className="table-header">
          <h1>Nodes</h1>
          <button className="add-btn" onClick={() => setShowPopup(true)}>
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
                <th>Title</th>
                <th>Equipment</th>
                <th>Controls</th>
                <th>Temperature</th>
                <th>Pressure</th>
                <th>Quantity Flow Rate</th>
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
                    <td>{n.title}</td>
                    <td>{n.equipment}</td>
                    <td>{n.controls}</td>
                    <td>{n.temperature}</td>
                    <td>{n.pressure}</td>
                    <td>{n.quantityFlowRate}</td>
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
                        {n.completionStatus === true ? "Completed" : "Pending"}
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
        />
      )}
    </div>
  );
};

export default NodePage;
