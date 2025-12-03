import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import NodeDetailsPopup from "./NodeDetailsPopup";
import { formatDate } from "../CommonUI/CommonUI";
import NodeDetailsUpdatePopup from "./NodeDetailsUpdatePopup";
import { FaEdit, FaEllipsisV } from "react-icons/fa";
import TextareaAutosize from 'react-textarea-autosize';
import { strings } from "../string";

const NodeDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const node = location.state?.node;

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

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(
          `http://${strings.localhost}/api/hazopNodeDetail/node/${id}`
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

  return (
    <div>
      <div>
        <button className="nd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Node {node?.nodeNumber || id} Details</h1>
      </div>

      <div className="hazop-info-card">
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Node No.</span>
            <span className="value">{node?.nodeNumber}</span>
          </div>
          <div className="info-item">
            <span className="label">Registration Date</span>
            <span className="value">
              {node?.registrationDate && formatDate(node.registrationDate)}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Title</span>
            <span className="value">{node?.title}</span>
          </div>
          <div className="info-item">
            <span className="label">Design Intent</span>
            <span className="value">{node?.designIntent}</span>
          </div>
          <div className="info-item">
            <span className="label">Equipment</span>
            <span className="value">{node?.equipment}</span>
          </div>
          <div className="info-item">
            <span className="label">Controls</span>
            <span className="value">{node?.controls}</span>
          </div>
          <div className="info-item">
            <span className="label">Temperature</span>
            <span className="value">{node?.temperature}</span>
          </div>
          <div className="info-item">
            <span className="label">Pressure</span>
            <span className="value">{node?.pressure}</span>
          </div>
          <div className="info-item">
            <span className="label">Quantity / Flow Rate</span>
            <span className="value">{node?.quantityFlowRate}</span>
          </div>
        </div>
      </div>

      <div class="btn-container">
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
              <div key={index} className="nd-detail-card">
                {renderDropdown(d)}
                <div className="nd-detail-header">
                    <div>
                  <h2>
                    General Parameter: {d.generalParameter}
                  </h2>
                  <p>
                      Specific Parameter: {d.specificParameter}
                      </p>
                      <p>
                      Guide Word: {d.guideWord}
                      </p>
                  </div>
                  <span className="nd-detail-tag">
                    Risk Rating: {d.riskRating || "-"}
                  </span>
                </div>

                <div className="input-row">
                    <div className="form-group">
                      <span>Causes</span>
                       <TextareaAutosize className="textareaFont" value={d.causes} />
                    </div>
                    <div className="form-group">
                      <span>Consequences</span>
                       <TextareaAutosize className="textareaFont" value={d.consequences} />
                    </div>
                    <div className="form-group">
                      <span>Deviation</span>
                       <TextareaAutosize className="textareaFont" value={d.deviation} />
                    </div>
                  </div>

                  <div className="nd-detail-col">
                    <h3 className="nd-section-title">Existing Controls</h3>
                    <div className="nd-row">
                      <span className="nd-label">Control</span>
                      <span className="nd-value">{d.existingControl}</span>
                    </div>
                    <div className="nd-prob-sev-row">
                      <div>
                        <span className="nd-label">Probability</span>
                        <span className="nd-chip">
                          {d.existingProbability || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="nd-label">Severity</span>
                        <span className="nd-chip">
                          {d.existingSeverity || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="nd-row">
                      <span className="nd-label">Risk Rating</span>
                      <span className="nd-chip nd-chip-primary">
                        {d.riskRating || "-"}
                      </span>
                    </div>

                  <div className="nd-detail-col">
                    <h3 className="nd-section-title">Additional Controls</h3>
                    <div className="nd-row">
                      <span className="nd-label">Control</span>
                      <span className="nd-value">{d.additionalControl}</span>
                    </div>
                    <div className="nd-prob-sev-row">
                      <div>
                        <span className="nd-label">Probability</span>
                        <span className="nd-chip">
                          {d.additionalProbability || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="nd-label">Severity</span>
                        <span className="nd-chip">
                          {d.additionalSeverity || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="nd-row">
                      <span className="nd-label">Additional Risk Rating</span>
                      <span className="nd-chip nd-chip-secondary">
                        {d.additionalRiskRating || "-"}
                      </span>
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
