import React, { useState } from "react";
import "./Node.css";
import NodePopup from "./NodePopup";
import { formatDate } from "../CommonUI/CommonUI";

const NodePage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [showAllMembers, setShowAllMembers] = useState(false);

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

  const handleSaveNode = (node) => {
    setNodes([...nodes, node]);
    setShowPopup(false);
  };

  return (
    <div className="">
      {/* HAZOP INFO CARD */}
      <div className="card hazop-info-card">
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

<div className={`members-table-wrapper ${showAllMembers ? "expanded" : ""}`}>
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
                <th>Node No.</th>
                <th>Date</th>
                <th>Design Intent</th>
                <th>P&ID</th>
                <th>Title</th>
                <th>Equipment</th>
                <th>Chemicals</th>
                <th>Temperature</th>
                <th>Pressure</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {nodes.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data">
                    No nodes added yet.
                  </td>
                </tr>
              ) : (
                nodes.map((n, idx) => (
                  <tr key={idx}>
                    <td>{n.nodeNumber}</td>
                    <td>{n.date}</td>
                    <td>{n.designIntent}</td>
                    <td>{n.pandID}</td>
                    <td>{n.title}</td>
                    <td>{n.equipment}</td>
                    <td>{n.chemicals}</td>
                    <td>{n.temperature}</td>
                    <td>{n.pressure}</td>
                    <td>{n.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button className="save-btn">Save All Nodes</button>
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
