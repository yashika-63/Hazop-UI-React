import React from "react";
import { FaTimes } from "react-icons/fa";

const RiskLevelPopup = ({ onClose }) => {
  const root = document.documentElement;
  const trivial = getComputedStyle(root).getPropertyValue("--trivial").trim();
  const tolerable = getComputedStyle(root)
    .getPropertyValue("--tolerable")
    .trim();
  const moderate = getComputedStyle(root).getPropertyValue("--moderate").trim();
  const substantial = getComputedStyle(root)
    .getPropertyValue("--substantial")
    .trim();
  const intolerable = getComputedStyle(root)
    .getPropertyValue("--intolerable")
    .trim();

  const riskRows = [
    {
      sr: "1",
      risk: "1, 2, 3, 4, 5",
      level: "Trivial",
      color: trivial,
      action: "No action required and no documentary records need to be kept.",
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
      risk: "16",
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

  const getColor = (num) => {
    if ([1, 2, 3, 4, 5].includes(num)) return trivial;
    if ([6, 8, 9, 10].includes(num)) return tolerable;
    if ([12, 15].includes(num)) return moderate;
    if ([16, 18].includes(num)) return substantial;
    if ([20, 25].includes(num)) return intolerable;
    return "#fff";
  };

  const severityLabels = [
    { p: "Slight injury", a: "Slight damage", e: "Slight effect" },
    { p: "Minor injury", a: "Minor damage", e: "Minor effect" },
    { p: "Major injury", a: "Localised damage", e: "Localised effect" },
    { p: "Single Fatality", a: "Major damage", e: "Major effect" },
    { p: "Multiple Fatalities", a: "Extensive damage", e: "Extensive effect" },
  ];

  const frequencyLabels = [
    "Once in 10 years",
    "Once in 5 years",
    "Once in a year",
    "Once a month",
    "Once a week",
  ];

  const matrixNumbers = [
    [1, 2, 3, 4, 5],
    [2, 4, 6, 8, 10],
    [3, 6, 9, 12, 15],
    [4, 8, 12, 16, 20],
    [5, 10, 15, 20, 25],
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
            <h4>Risk Matrix</h4>
            <table className="risk-matrix">
              <thead>
                {/* Top Frequency Header */}
                <tr>
                  <th colSpan={4} rowSpan={2} style={{ textAlign: "center" }}>
                    SEVERITY OF CONSEQUENCES - S
                  </th>
                  {frequencyLabels.map((freq, idx) => (
                    <th key={idx} rowSpan={3}>
                      <div style={{ fontWeight: "bold", textAlign: "center" }}>
                        {idx + 1}
                      </div>
                      <div style={{ fontSize: "13px" }}>{freq}</div>
                    </th>
                  ))}
                </tr>

                {/* Frequency Numbers row (merged already above, so no blanks) */}
                <tr></tr>

                {/* Column Labels */}
                <tr>
                  <th>Sr. No.</th>
                  <th>People (P)</th>
                  <th>Assets (A)</th>
                  <th>Environment (E)</th>
                </tr>
              </thead>

              <tbody>
                {matrixNumbers.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td style={{ fontWeight: "bold", textAlign: "center" }}>
                      {rowIndex + 1}
                    </td>
                    <td>{severityLabels[rowIndex].p}</td>
                    <td>{severityLabels[rowIndex].a}</td>
                    <td>{severityLabels[rowIndex].e}</td>

                    {row.map((num, colIndex) => (
                      <td
                        key={colIndex}
                        style={{
                          backgroundColor: getColor(num),
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {num}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-section">
          <div className="card table-card">
            <h4>Risk Levels Details</h4>
            <table>
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th style={{ width: "10%" }}>Risk</th>
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
