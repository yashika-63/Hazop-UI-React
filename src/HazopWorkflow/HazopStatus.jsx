import React, { useEffect, useState } from "react";
import { FaHome, FaUser, FaProjectDiagram, FaFileArchive, FaFileAlt, FaList, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import "./Workflow.css";
 
export default function HazopWorkflow() {
  const [status, setStatus] = useState(null);
 
  useEffect(() => {
    fetch("http://localhost:5559/api/hazop/status/26")
      .then((res) => res.json())
      .then((data) => setStatus(data));
  }, []);
 
  const steps = [
    { key: "registration", label: "Create New HAZOP", color: "#1abc9c", icon: <FaHome /> },
    { key: "teamCreated", label: "Select Team & Management", color: "#3498db", icon: <FaUser /> },
    { key: "nodesCreated", label: "Add Nodes & Details", color: "#f39c12", icon: <FaProjectDiagram /> },
    { key: "nodeDetailsCreated", label: "Submit Node Details", color: "#9b59b6", icon: <FaFileArchive /> },
    { key: "recommendationsCreated", label: "Add Recommendations", color: "#e67e22", icon: <FaFileAlt /> },
    { key: "recommendationsAssigned", label: "Assign Responsibility", color: "#e74c3c", icon: <FaList /> },
    { key: "recommendationsCompleted", label: "Verify Details", color: "#2ecc71", icon: <FaCheckCircle /> },
    { key: "hazopFinalCompleted", label: "Close the HAZOP", color: "#34495e", icon: <FaTimesCircle /> },
  ];
 
  if (!status) return <div className="loading-screen">Loading HAZOP Workflow...</div>;
 
  return (
    <div className="workflow-container">
      <h2 className="workflow-title">HAZOP Workflow Progress</h2>
 
      <div className="workflow-horizontal">
        {steps.map((step, i) => {
          const completed = status[step.key];
          return (
            <div key={i} className="workflow-step-horizontal">
              <div
                className={`step-circle ${completed ? "completed" : "pending"}`}
                style={{ borderColor: step.color, backgroundColor: completed ? step.color : "#fff" }}
              >
                {React.cloneElement(step.icon, { color: completed ? "#fff" : step.color, size: 24 })}
              </div>
              <div className="step-label">{step.label}</div>
 
              {i < steps.length - 1 && (
                <div
                  className="connector"
                  style={{ backgroundColor: completed ? step.color : "#ddd" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}