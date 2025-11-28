import React, { useState } from "react";
import "./Hazop.css";
import NodePopup from "./NodePopup";

const HazopPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [nodes, setNodes] = useState([]);

  // sample group members
  const groupMembers = [
    { name: "John Doe", email: "john@example.com", department: "Safety" },
    { name: "Priya Verma", email: "priya@example.com", department: "Operations" },
    { name: "Amit Shah", email: "amit@example.com", department: "Engineering" },
    { name: "Sara Ali", email: "sara@example.com", department: "Quality" },
    { name: "Vikram Rao", email: "vikram@example.com", department: "Maintenance" },
     { name: "John Doe", email: "john@example.com", department: "Safety" },
    { name: "Priya Verma", email: "priya@example.com", department: "Operations" },
    { name: "Amit Shah", email: "amit@example.com", department: "Engineering" },
    { name: "Sara Ali", email: "sara@example.com", department: "Quality" },
    { name: "Vikram Rao", email: "vikram@example.com", department: "Maintenance" },
  ];

  const hazopInfo = {
    id: "HZP-1023",
    date: "2025-01-12",
    site: "Main Plant A",
    department: "Production",
    description: "Hazop study for distillation unit & allied sections.",
  };

  const handleSaveNode = (node) => {
    setNodes([...nodes, node]);
    setShowPopup(false);
  };

  return (
    <div className="coreContainer">

      {/* HAZOP INFO CARD */}
      <div className="card hazop-info-card">
        <h2>HAZOP Information</h2>

        <div className="info-tiles-row">
  <div className="info-tile id">ID: {hazopInfo.id}</div>
  <div className="info-tile date">Date: {hazopInfo.date}</div>
  <div className="info-tile site">Site: {hazopInfo.site}</div>
  <div className="info-tile department">Department: {hazopInfo.department}</div>
</div>

        <div className="description">
          <strong>Description:</strong>
          <p>{hazopInfo.description}</p>
        </div>

        <h3>Group Members</h3>
        <div className="members-list">
  {groupMembers.map((m, idx) => (
    <div key={idx} className="member-card">
      <span className="label">Name:</span> {m.name}
      <span className="sep">|</span>
      <span className="label">Department:</span> {m.department}
      <span className="sep">|</span>
      <span className="label">Email:</span> {m.email}
    </div>
  ))}
</div>
      </div>

      {/* BUTTON + TABLE */}
      <div className="table-section">

        <div className="table-header">
          <h2>Nodes</h2>
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
                  <td colSpan="10" className="no-data">No nodes added yet.</td>
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

      {showPopup && <NodePopup onClose={() => setShowPopup(false)} onSave={handleSaveNode} />}

    </div>
  );
};

export default HazopPage;
