import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import NodeDetailsPopup from "./NodeDetailsPopup";
import { formatDate } from "../CommonUI/CommonUI";
import NodeDetailsUpdatePopup from "./NodeDetailsUpdatePopup";
import { FaEdit, FaEllipsisV } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import RiskLevelPopup from "./RiskLevelPopup";

const NodeDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { id } = location.state || {};

  const [node, setNode] = useState(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [details, setDetails] = useState([]);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showRiskPopup, setShowRiskPopup] = useState(false);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [recommendationsMap, setRecommendationsMap] = useState({});
  const [expandedDetailId, setExpandedDetailId] = useState(null);

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

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  const renderDropdown = (item) => (
    <div className="dropdown">
      <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
        <FaEllipsisV />
      </button>

      {openDropdown === item.id && (
        <div className="dropdown-content">
          <button onClick={() => openUpdatePopup(item)}>
            <FaEdit /> Update
          </button>
        </div>
      )}
    </div>
  );

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const response = await fetch(
        `http://localhost:5559/api/hazopNodeDetail/node/${id}`
      );
      if (!response.ok) {
        const text = await response.text();
        console.error("Failed to fetch node details:", text);
        setDetails([]); // fallback to empty
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON, got:", text);
        setDetails([]);
        return;
      }

      const data = await response.json();
      setDetails(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Error fetching node details:", error);
      setDetails([]);
    }
  };
  useEffect(() => {
    if (id) fetchNode();
    fetchDetails();
  }, [id]);

  const handleSaveDetail = (detail) => {
    setDetails((prev) => [...prev, detail]);
    setShowDetailPopup(false);
  };

  const handleUpdateDetail = (updated) => {
    setDetails((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setShowUpdatePopup(false);
  };

  const openUpdatePopup = (detail) => {
    setSelectedDetail(detail);
    setShowUpdatePopup(true);
  };

  const getBorderColor = (risk) => {
    const r = Number(risk);

    if ([1, 2, 3, 4, 5].includes(r)) return trivial; // trivial
    if ([6, 8, 9, 10].includes(r)) return tolerable; // tolerable
    if ([12, 15].includes(r)) return moderate; // moderate
    if ([16, 18].includes(r)) return substantial; // substantial
    if ([20, 25].includes(r)) return intolerable; // intolerable

    return "#ccc"; // default grey
  };

  // Determine card color based on risk rating
  const getRiskClass = (risk) => {
    if (!risk) return "risk-default";

    const r = Number(risk);

    if ([1, 2, 3, 4, 5].includes(r)) return "risk-trivial";
    if ([6, 8, 9, 10].includes(r)) return "risk-tolerable";
    if ([12, 15].includes(r)) return "risk-moderate";
    if ([16, 18].includes(r)) return "risk-substantial";
    if ([20, 25].includes(r)) return "risk-intolerable";

    return "risk-default";
  };

  const getRiskLevelText = (risk) => {
    const r = Number(risk);

    if ([1, 2, 3, 4, 5].includes(r)) return "Trivial";
    if ([6, 8, 9, 10].includes(r)) return "Tolerable";
    if ([12, 15].includes(r)) return "Moderate";
    if ([16, 18].includes(r)) return "Substantial";
    if ([20, 25].includes(r)) return "Intolerable";

    return "N/A";
  };

  function ShowMoreText({ text, previewLength = 250, borderClass }) {
    const [expanded, setExpanded] = useState(false);

    const preview = text?.slice(0, previewLength);

    return (
      <div className={`showmore-wrapper`}>
        <div className={`showmore-text ${borderClass} `}>
          {expanded
            ? text
            : preview + (text.length > previewLength ? "..." : "")}
        </div>

        {text.length > previewLength && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="showmore-btn rightbtn-controls"
          >
            {expanded ? "Read Less" : "Read More"}
          </button>
        )}
      </div>
    );
  }

  const getBorderClass = (risk) => {
    const base = getRiskClass(risk);
    return "border-" + base.replace("risk-", "");
  };

  const fetchNode = async () => {
    if (!id) return;
    try {
      const response = await fetch(`http://localhost:5559/api/hazopNode/${id}`);
      if (!response.ok) {
        const text = await response.text();
        console.error("Failed to fetch node:", text);
        setNode(null);
        return;
      }

      const data = await response.json();
      setNode(data);
    } catch (error) {
      console.error("Error fetching node:", error);
      setNode(null);
    }
  };

  const handleCompleteNode = async () => {
    try {
      const response = await fetch(
        `http://localhost:5559/api/hazopNode/complete/${id}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        alert("Failed to complete node");
        return;
      }

      alert("Node marked as complete!");
      setShowCompletePopup(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }
  };

  const fetchRecommendations = async (detailId) => {
    try {
      const response = await fetch(
        `http://localhost:5559/api/nodeRecommendation/getByDetailId/${detailId}`
      );

      if (!response.ok) {
        console.error("Failed to fetch recommendations");
        return;
      }

      const data = await response.json();

      setRecommendationsMap((prev) => ({
        ...prev,
        [detailId]: data || [],
      }));
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
    return (
      <div className="confirm-overlay">
        <div className="confirm-box">
          <p>{message}</p>
          <div className="confirm-buttons">
            <button type="button" onClick={onCancel} className="cancel-btn">
              No
            </button>
            <button type="button" onClick={onConfirm} className="confirm-btn">
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleToggleRecommendations = async (detailId) => {
    const isOpening = expandedDetailId !== detailId;

    if (isOpening) {
      await fetchRecommendations(detailId);
    }

    setExpandedDetailId(isOpening ? detailId : null);
  };

  const RecommendationTable = ({ recommendations }) => {
    return (
      <div className="table-section">
        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Sr. No</th>
                <th>Recommendation</th>
                <th>Remarks By Management</th>
                <th>Completion Date</th>
                <th>Department</th>
              </tr>
            </thead>

            <tbody>
              {recommendations?.length > 0 ? (
                recommendations.map((r, index) => (
                  <tr key={r.id}>
                    <td>{index + 1}</td>
                    <td>{r.recommendation}</td>
                    <td>{r.remarkbyManagement}</td>
                    <td>{formatDate(r.completionDate)}</td>
                    <td>{r.department}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No recommendations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="node-header">
        <button className="nd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Node {node?.nodeNumber || id} Details</h1>
      </div>

      <div className="hazop-info">
        <div className="hazop-info-grid">
          <div>
            <strong>Node No.:</strong> {node?.nodeNumber}
          </div>
          <div>
            <strong>Registration Date:</strong>
            {node?.registrationDate && formatDate(node.registrationDate)}
          </div>
          <div>
            <strong>Title:</strong>
            {node?.title}
          </div>
          <div>
            <strong>Design Intent:</strong>
            {node?.designIntent}
          </div>
          <div>
            <strong>Equipment:</strong>
            {node?.equipment}
          </div>
          <div>
            <strong>Controls:</strong>
            {node?.controls}
          </div>
          <div>
            <strong>Temperature:</strong>
            {node?.temprature}
          </div>
          <div>
            <strong>Pressure:</strong>
            {node?.pressure}
          </div>
          <div>
            <strong>Quantity/ Flow Rate:</strong>
            {node?.quantityFlowRate}
          </div>
        </div>
      </div>

      <div className="rightbtn-controls">
        <button className="add-btn" onClick={() => setShowDetailPopup(true)}>
          + Create Node Detail
        </button>
        <button className="add-btn" onClick={() => setShowRiskPopup(true)}>
          View Risk Levels
        </button>
        <button className="add-btn" onClick={() => setShowCompletePopup(true)}>
          Complete Node
        </button>
      </div>

      <div className="nd-details-wrapper">
        <div>
          {details.length === 0 ? (
            <p className="error-text">
              No node details created yet. Click “Create Node Detail” to add
              one.
            </p>
          ) : (
            details.map((d, index) => (
              <div
                key={d.id}
                className={`nd-detail-card ${getRiskClass(
                  d.riskRating || d.additionalRiskRating
                )}`}
              >
                {renderDropdown(d)}

                <div className="nd-detail-header">
                  <div>
                    <h2>General Parameter: {d.generalParameter}</h2>
                    <p>Specific Parameter: {d.specificParameter}</p>
                    <p>Guide Word: {d.guidWord}</p>
                  </div>

                  <div className="nd-detail-badges">
                    <span
                      className={`risk-badge ${getRiskClass(d.riskRating)}`}
                    >
                      Risk Rating: {d.riskRating || "-"} (
                      {getRiskLevelText(d.riskRating)})
                    </span>

                    <span
                      className={`risk-badge ${getRiskClass(
                        d.additionalRiskRating
                      )}`}
                    >
                      Additional Risk Rating: {d.additionalRiskRating || "-"} (
                      {getRiskLevelText(d.additionalRiskRating)})
                    </span>
                  </div>
                </div>
                <div className="input-row">
                  <div className="form-group">
                    <span>Causes</span>
                    <ShowMoreText text={d.causes} />
                  </div>
                  <div className="form-group">
                    <span>Consequences</span>
                    <ShowMoreText text={d.consequences} />
                  </div>
                  <div className="form-group">
                    <span>Deviation</span>
                    <ShowMoreText text={d.deviation} />
                  </div>
                </div>

                <div className="grid-row">
                  <div className="form-group existing-control">
                    <label>Existing control</label>
                    <ShowMoreText
                      text={d.existineControl}
                      borderClass={getBorderClass(d.riskRating)}
                    />
                  </div>
                  <div className="existing-metrics">
                    <div className="form-group">
                      <label>Existing Probability</label>
                      <input
                        value={d.existineProbability || "-"}
                        style={{
                          borderColor: getBorderColor(d.riskRating),
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderLeft: `5px solid ${getBorderColor(
                            d.riskRating
                          )}`,
                        }}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Existing Severity</label>
                      <input
                        value={d.existingSeverity || "-"}
                        style={{
                          borderColor: getBorderColor(d.riskRating),
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderLeft: `5px solid ${getBorderColor(
                            d.riskRating
                          )}`,
                        }}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Existing Risk Rating</label>
                      <input
                        value={d.riskRating || "-"}
                        style={{
                          borderColor: getBorderColor(d.riskRating),
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderLeft: `5px solid ${getBorderColor(
                            d.riskRating
                          )}`,
                        }}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="grid-row">
                  <div className="form-group existing-control">
                    <label>Additional Control</label>
                    <ShowMoreText
                      text={d.additionalControl}
                      borderClass={getBorderClass(d.riskRating)}
                    />
                  </div>
                  <div className="existing-metrics">
                    <div className="form-group">
                      <label>Additional Probability</label>
                      <input
                        value={d.additionalProbability || "-"}
                        style={{
                          borderColor: getBorderColor(d.riskRating),
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderLeft: `5px solid ${getBorderColor(
                            d.riskRating
                          )}`,
                        }}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Additional Severity</label>
                      <input
                        value={d.additionalSeverity || "-"}
                        style={{
                          borderColor: getBorderColor(d.riskRating),
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderLeft: `5px solid ${getBorderColor(
                            d.riskRating
                          )}`,
                        }}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Additional Risk Rating</label>
                      <input
                        value={d.additionalRiskRating || "-"}
                        style={{
                          borderColor: getBorderColor(d.riskRating),
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderLeft: `5px solid ${getBorderColor(
                            d.riskRating
                          )}`,
                        }}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="rightbtn-controls">
                  <h6
                    style={{ cursor: "pointer" }}
                    onClick={() => handleToggleRecommendations(d.id)}
                  >
                    {expandedDetailId === d.id
                      ? "Hide Recommendations"
                      : "View All Recommendations"}
                  </h6>
                </div>

                {expandedDetailId === d.id && (
                  <div className="recommendation-table-container">
                    <RecommendationTable
                      recommendations={recommendationsMap[d.id] || []}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showDetailPopup && (
        <NodeDetailsPopup
          onClose={() => setShowDetailPopup(false)}
          onSave={handleSaveDetail}
          nodeID={id}
        />
      )}

      {showUpdatePopup && selectedDetail && (
        <NodeDetailsUpdatePopup
          onClose={() => setShowUpdatePopup(false)}
          onSave={handleUpdateDetail}
          nodeID={id}
          detail={selectedDetail}
        />
      )}

      {showRiskPopup && (
        <RiskLevelPopup onClose={() => setShowRiskPopup(false)} />
      )}

      {showCompletePopup && (
        <ConfirmationPopup
          message="Are you sure you want to mark this node as completed?"
          onConfirm={handleCompleteNode}
          onCancel={() => setShowCompletePopup(false)}
        />
      )}
    </div>
  );
};

export default NodeDetails;
