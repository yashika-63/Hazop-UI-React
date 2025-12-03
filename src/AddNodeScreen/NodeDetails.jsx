import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import NodeDetailsPopup from "./NodeDetailsPopup";
import { formatDate } from "../CommonUI/CommonUI";
import NodeDetailsUpdatePopup from "./NodeDetailsUpdatePopup";
import { FaEdit, FaEllipsisV } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";

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

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

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
    if (id) fetchDetails();
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

function ShowMoreText({ text, previewLength = 250 }) {
  const [expanded, setExpanded] = useState(false);

  const preview = text?.slice(0, previewLength);

  return (
    <div>
      <div className="showmore-text">
        {expanded ? text : preview + (text.length > previewLength ? "..." : "")}
      </div>

      {text.length > previewLength && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="showmore-btn btn-container"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}

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
            {node?.temperature}
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

      <div className="btn-container">
        <button className="add-btn" onClick={() => setShowDetailPopup(true)}>
          + Create Node Detail
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
              <div key={d.id} className="nd-detail-card">
                {renderDropdown(d)}
                <div className="nd-detail-header">
                  <div>
                    <h2>General Parameter: {d.generalParameter}</h2>
                    <p>Specific Parameter: {d.specificParameter}</p>
                    <p>Guide Word: {d.guidWord}</p>
                  </div>
                  <span className="nd-detail-tag">
                    Risk Rating: {d.riskRating || "-"}
                  </span>
                  <span className="nd-detail-tag">
                    Additional Risk Rating: {d.additionalRiskRating || "-"}
                  </span>
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
                    />
                  </div>
                  <div className="existing-metrics">
                    <div className="form-group">
                      <label>Probability</label>
                      <input value={d.existineProbability || "-"} />
                    </div>
                    <div className="form-group">
                      <label>Severity</label>
                      <input value={d.existingSeverity || "-"} />
                    </div>
                    <div className="form-group">
                      <label>Risk Rating</label>
                      <input value={d.riskRating || "-"} />
                    </div>
                  </div>
                </div>

                <div className="grid-row">
                  <div className="form-group existing-control">
                    <label>Additional Control</label>
                    <ShowMoreText text={d.additionalControl} />
                  </div>
                  <div className="existing-metrics">
                    <div className="form-group">
                      <label>Probability</label>
                      <input value={d.additionalProbability || "-"} />
                    </div>
                    <div className="form-group">
                      <label>Severity</label>
                      <input value={d.additionalSeverity || "-"} />
                    </div>
                    <div className="form-group">
                      <label>Additional Risk Rating</label>
                      <input value={d.additionalRiskRating || "-"} />
                    </div>
                  </div>
                </div>
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
    </div>
  );
};

export default NodeDetails;
