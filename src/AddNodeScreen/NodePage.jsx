import React, { useState, useEffect } from "react";
import "./Node.css";
import NodePopup from "./NodePopup";
import { formatDate } from "../CommonUI/CommonUI";
import { useNavigate } from "react-router-dom";

const NodePage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const navigate = useNavigate();

  // sample group members
  const groupMembers = [
    { name: "John Doe", email: "john@example.com", department: "Safety" },
    {
      name: "Priya Verma",
      email: "priya@example.com",
      department: "Operations",
    },
    { name: "Amit Shah", email: "amit@example.com", department: "Engineering" },
    { name: "Sara Ali", email: "sara@example.com", department: "Quality" },
    {
      name: "Vikram Rao",
      email: "vikram@example.com",
      department: "Maintenance",
    },
    { name: "John Doe", email: "john@example.com", department: "Safety" },
    {
      name: "Priya Verma",
      email: "priya@example.com",
      department: "Operations",
    },
    { name: "Amit Shah", email: "amit@example.com", department: "Engineering" },
    { name: "Sara Ali", email: "sara@example.com", department: "Quality" },
    {
      name: "Vikram Rao",
      email: "vikram@example.com",
      department: "Maintenance",
    },
  ];

  const hazopInfo = {
    id: "HZP-1023",
    date: "2025-01-12",
    site: "Main Plant A",
    department: "Production",
    description:
      "Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections. Hazop study for distillation unit & allied sections.",
  };

  // Fetch nodes from API on component mount
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch(
          "http://localhost:5559/api/hazopNode/by-registration-status?registrationId=1&status=true"
        );
        const data = await response.json();
        setNodes(data); // Assuming API returns an array of nodes
      } catch (error) {
        console.error("Error fetching nodes:", error);
      }
    };

    fetchNodes();
  }, []);

  const handleSaveNode = (node) => {
    setNodes([...nodes, node]);
    setShowPopup(false);
  };

  return (
    <div>
      {/* HAZOP INFO CARD */}
      <div className="">
        <h1>Hazop Information</h1>

        <div className="hazop-info-card">
          <div className="info-grid">
            <div className="info-item">
              <span className="label">ID:</span>
              <span className="value">{hazopInfo.id}</span>
            </div>
            <div className="info-item">
              <span className="label">Date:</span>
              <span className="value">{formatDate(hazopInfo?.date)}</span>
            </div>
            <div className="info-item">
              <span className="label">Site:</span>
              <span className="value">{hazopInfo.site}</span>
            </div>
            <div className="info-item">
              <span className="label">Department:</span>
              <span className="value">{hazopInfo.department}</span>
            </div>
          </div>
          <div className="description">
            <strong>Description:</strong>
            <p>{hazopInfo.description}</p>
          </div>
        </div>

        <div className="members-header">
          <h2>Total Group Members: {groupMembers.length}</h2>
          <button
            className="view-btn"
            onClick={() => setShowAllMembers(!showAllMembers)}
          >
            {showAllMembers ? "Hide Members" : "View All Members"}
          </button>
        </div>

        <div
          className={`members-table-wrapper ${
            showAllMembers ? "expanded" : ""
          }`}
        >
          {showAllMembers && (
            <table className="members-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {groupMembers.map((m, idx) => (
                  <tr key={idx}>
                    <td>{m.name}</td>
                    <td>{m.department}</td>
                    <td>{m.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                      navigate(`/node/${n.id}`, { state: { node: n } })
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
