import React from "react";
import { FaTimes } from "react-icons/fa";

const RiskLevelPopup = ({ onClose }) => {
  // Read CSS variable colors directly
  const root = document.documentElement;
  const trivial = getComputedStyle(root).getPropertyValue("--trivial").trim();
  const tolerable = getComputedStyle(root).getPropertyValue("--tolerable").trim();
  const moderate = getComputedStyle(root).getPropertyValue("--moderate").trim();
  const substantial = getComputedStyle(root).getPropertyValue("--substantial").trim();
  const intolerable = getComputedStyle(root).getPropertyValue("--intolerable").trim();

  // Color mapping for each risk set
  const riskRows = [
    {
      sr: "1",
      risk: "1, 2, 3, 4, 5",
      level: "Trivial",
      color: trivial,
      action:
        "No action required and no documentary records need to be kept.",
    },
    {
      sr: "2",
      risk: "6, 8, 9, 10",
      level: "Tolerable",
      color: tolerable,
      action:
        "No additional controls are required. Consider a more cost-effective improvement if needed. Monitoring is required to ensure controls are maintained.",
    },
    {
      sr: "3",
      risk: "12, 15",
      level: "Moderate",
      color: moderate,
      action:
        "Efforts should be made to reduce the risk. Costs should be justified. Risk reduction measures should be implemented.",
    },
    {
      sr: "4",
      risk: "16, 18",
      level: "Substantial",
      color: substantial,
      action:
        "Work should not start until the risk has been reduced. Considerable resources may be required. If work is ongoing, urgent action is needed.",
    },
    {
      sr: "5",
      risk: "20, 25",
      level: "Intolerable",
      color: intolerable,
      action:
        "Work must not start or continue until risk is reduced. If risk cannot be controlled even with unlimited resources, the work must remain prohibited.",
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <h2 className="modal-header">Risk Levels Information</h2>
        </div>

        <div className="table-section">
          <div className="card table-card">
            <table>
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th style={{ width: "10%"}}>Risk</th>
                  <th>Risk Level</th>
                  <th>Action and Time Scale</th>
                </tr>
              </thead>

              <tbody>
                {riskRows.map((row) => (
                  <tr
                    key={row.sr}
                    style={{
                      borderLeft: `8px solid ${row.color}`, 
                    }}
                  >
                    <td>{row.sr}</td>
                    <td>{row.risk}</td>
                    <td>
                      <strong style={{ color: row.color }}>{row.level}</strong>
                    </td>
                    <td>{row.action}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskLevelPopup;
