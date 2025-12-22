import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { formatDate, showToast } from "../CommonUI/CommonUI";
import { FaEdit, FaEllipsisV, FaTrash } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import RiskLevelPopup from "./RiskLevelPopup";
import { strings } from "../string";
import CreateNodeDetails from "./CreateNodeDetails";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";
import SequenceUpdatePopup from "./SequenceUpdatePopup";

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
  const [sequenceUpdatePopup, setSequenceUpdatePopup] = useState(false);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [recommendationsMap, setRecommendationsMap] = useState({});
  const [expandedDetailId, setExpandedDetailId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

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
    <div className="dropdown top-header">
      <button className="dots-button" onClick={() => toggleDropdown(item.id)}>
        <FaEllipsisV />
      </button>

      {openDropdown === item.id && (
        <div className="dropdown-content">
          <button
            onClick={() =>
              navigate("/CreateNodeDetails", {
                state: { detail: item, nodeID: id },
              })
            }
            disabled={node?.completionStatus}
            style={{
              cursor: node?.completionStatus ? "not-allowed" : "pointer",
              opacity: node?.completionStatus ? 0.6 : 1,
            }}
          >
            <FaEdit /> Update
          </button>
        </div>
      )}
    </div>
  );

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
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

  const handleUpdateDetail = async () => {
    await fetchNode();
    await fetchDetails();
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

  const getRiskTextClass = (risk) => {
    const r = Number(risk);

    if ([1, 2, 3, 4, 5].includes(r)) return "risk-badge risk-trivial";
    if ([6, 8, 9, 10].includes(r)) return "risk-badge risk-tolerable";
    if ([12, 15].includes(r)) return "risk-badge risk-moderate";
    if ([16, 18].includes(r)) return "risk-badge risk-substantial";
    if ([20, 25].includes(r)) return "risk-badge risk-intolerable";

    return "risk-badge risk-default";
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const updateSequenceToBackend = async (newList) => {
    try {
      const payload = newList.map((item, index) => ({
        id: item.id,
        nodeDetailNumber: index + 1,
      }));

      const response = await fetch(
        `http://${strings.localhost}/api/hazopNodeDetail/updateSequenceById/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        showToast("Failed to update sequence", "error");
        return;
      }

      showToast("Sequence Updated Successfully!", "success");
    } catch (error) {
      console.error("Sequence update error:", error);
      showToast("Something went wrong", "error");
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedList = reorder(
      details,
      result.source.index,
      result.destination.index
    );

    setDetails(reorderedList);
    updateSequenceToBackend(reorderedList);
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.index === destination.index) return;

    const reordered = Array.from(details);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    setDetails(reordered);

    // backend expects ONLY list of IDs in correct order
    const payload = reordered.map((item) => item.id);

    try {
      await axios.put(
        `http://${strings.localhost}/api/hazopNodeDetail/updateSequenceById/${id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      showToast("Sequence updated!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update sequence", "error");
    }
  };

  function ShowMoreText({ text = "", previewLength = 250, borderClass }) {
    const [expanded, setExpanded] = useState(false);

    const safeText = text || "";

    const preview = safeText.slice(0, previewLength);

    return (
      <div>
        <div className={`showmore-text ${borderClass}`}>
          {expanded
            ? safeText
            : preview + (safeText.length > previewLength ? "..." : "")}
        </div>

        {safeText.length > previewLength && (
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
      setLoading(true);
      const response = await fetch(
        `http://${strings.localhost}/api/hazopNode/${id}`
      );
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
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteNode = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://${strings.localhost}/api/hazopNode/complete/${id}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        showToast("Failed to complete node", "error");
        return;
      }

      showToast("Node marked as complete!", "success");
      setShowCompletePopup(false);
    } catch (error) {
      console.error("Error:", error);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (detailId) => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${detailId}`
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
    } finally {
      setLoading(false);
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

  const handleDeleteNode = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://${strings.localhost}/api/hazopNode/delete/${id}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        showToast("Failed to delete node", "error");
        return;
      }

      showToast("Node deleted successfully!", "success");
      navigate(-1); // go back to previous page
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
      setShowDeletePopup(false);
    }
  };

  return (
    <div>
      <div className="node-header">
        <button className="nd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Node {node?.nodeNumber || id} Deviation</h1>
      </div>

      <div className="hazop-info">
        <div className="input-row">
          <div>
            <strong>Node No.: </strong> {node?.nodeNumber}
          </div>
          <div>
            <strong>Registration Date: </strong>
            {node?.registrationDate && formatDate(node.registrationDate)}
          </div>
          <div>
            <strong>Completion Status: </strong>
            <span
              className={
                node?.completionStatus === true
                  ? "status-completed"
                  : "status-pending"
              }
            >
              {node?.completionStatus ? "Completed" : "Ongoing"}
            </span>
          </div>
        </div>
        <div>
          <strong>Design Intent: </strong>
          {node?.designIntent}
        </div>
      </div>

      <div className="rightbtn-controls">
        <button className="add-btn" onClick={() => setShowRiskPopup(true)}>
          View Risk Matrix
        </button>

        {!node?.completionStatus && details.length > 0 && (
          <button
            className="add-btn"
            onClick={() => setShowCompletePopup(true)}
          >
            Complete Node
          </button>
        )}

        {!node?.completionStatus && details.length > 0 && (
          <button
            className="add-btn"
            onClick={() => setSequenceUpdatePopup(true)}
          >
            Update Deviation Sequence
          </button>
        )}

        {/* Show Add Discussion button only if node is not completed */}
        {!node?.completionStatus && (
          <button
            className="add-btn"
            onClick={() =>
              navigate("/CreateNodeDetails", {
                state: { nodeID: id },
              })
            }
          >
            + Add Deviation
          </button>
        )}
      </div>

      <div className="nd-details-wrapper">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="details">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {details.length === 0 ? (
                  <p className="error-text">
                    No node details created yet. Click "Add Deviation" to add
                    one.
                  </p>
                ) : (
                  details.map((d, index) => (
                    <Draggable
                      key={d.id}
                      draggableId={String(d.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`nd-detail-card ${getRiskClass(
                            d.riskRating || d.additionalRiskRating
                          )} ${snapshot.isDragging ? "dragging" : ""}`}
                        >
                          {renderDropdown(d)}

                          <div className="nd-detail-header">
                            <div>
                              <h2>General Parameter: {d.generalParameter}</h2>
                              <p>Specific Parameter: {d.specificParameter}</p>
                              <p>Guide Word: {d.guidWord}</p>
                              <p>Team Members: {d.discussionContributors}</p>
                            </div>

                            <div className="nd-detail-badges">
                              <span
                                className={`risk-badge ${getRiskClass(
                                  d.riskRating
                                )}`}
                              >
                                Initial Risk Rating: {d.riskRating || "-"} (
                                {getRiskLevelText(d.riskRating)})
                              </span>

                              <span
                                className={`risk-badge ${getRiskClass(
                                  d.additionalRiskRating
                                )}`}
                              >
                                Final Risk Rating:{" "}
                                {d.additionalRiskRating || "-"} (
                                {getRiskLevelText(d.additionalRiskRating)})
                              </span>
                            </div>
                          </div>

                          <div className="input-row-node">
                            <div className="form-group">
                              <span>Deviation</span>
                              <ShowMoreText
                                text={d.deviation}
                                previewLength={600}
                              />
                            </div>

                            <div className="form-group">
                              <span>Consequences</span>
                              <ShowMoreText
                                text={d.consequences}
                                previewLength={600}
                              />
                            </div>

                            <div className="form-group">
                              <span>Causes</span>
                              <ShowMoreText
                                text={d.causes}
                                previewLength={600}
                              />
                            </div>

                            <div>
                              <div className="form-group existing-control">
                                <label>Existing control</label>
                                <ShowMoreText
                                  text={d.existineControl}
                                  borderClass={getBorderClass(d.riskRating)}
                                  previewLength={250}
                                />
                              </div>

                              <div className="metric-row">
                                <div className="form-group">
                                  <label>P</label>
                                  <input
                                    value={d.existineProbability || "-"}
                                    style={{
                                      borderColor: getBorderColor(d.riskRating),
                                      borderWidth: "2px",
                                      borderStyle: "solid",
                                      width: "80%",
                                      borderLeft: `5px solid ${getBorderColor(
                                        d.riskRating
                                      )}`,
                                    }}
                                    readOnly
                                  />
                                </div>

                                <div className="form-group">
                                  <label>S</label>
                                  <input
                                    value={d.existingSeverity || "-"}
                                    style={{
                                      borderColor: getBorderColor(d.riskRating),
                                      borderWidth: "2px",
                                      borderStyle: "solid",
                                      width: "80%",
                                      borderLeft: `5px solid ${getBorderColor(
                                        d.riskRating
                                      )}`,
                                    }}
                                    readOnly
                                  />
                                </div>

                                <div className="form-group">
                                  <label>R</label>
                                  <input
                                    value={d.riskRating || "-"}
                                    style={{
                                      borderColor: getBorderColor(d.riskRating),
                                      borderWidth: "2px",
                                      borderStyle: "solid",
                                      width: "90%",
                                      borderLeft: `5px solid ${getBorderColor(
                                        d.riskRating
                                      )}`,
                                    }}
                                    readOnly
                                  />
                                </div>
                              </div>

                              <small
                                className={`risk-text ${getRiskTextClass(
                                  d.riskRating
                                )} metric-single`}
                                style={{ textAlign: "center" }}
                              >
                                {getRiskLevelText(d.riskRating)}
                              </small>
                            </div>

                            {/* Additional Control */}
                            <div>
                              <div className="form-group existing-control">
                                <label>Additional Control</label>
                                <ShowMoreText
                                  text={d.additionalControl}
                                  borderClass={getBorderClass(
                                    d.additionalRiskRating
                                  )}
                                  previewLength={250}
                                />
                              </div>

                              <div className="metric-row">
                                <div className="form-group">
                                  <label>P</label>
                                  <input
                                    value={d.additionalProbability || "-"}
                                    style={{
                                      borderColor: getBorderColor(
                                        d.additionalRiskRating
                                      ),
                                      borderWidth: "2px",
                                      borderStyle: "solid",
                                      width: "80%",
                                      borderLeft: `5px solid ${getBorderColor(
                                        d.additionalRiskRating
                                      )}`,
                                    }}
                                    readOnly
                                  />
                                </div>

                                <div className="form-group">
                                  <label>S</label>
                                  <input
                                    value={d.additionalSeverity || "-"}
                                    style={{
                                      borderColor: getBorderColor(
                                        d.additionalRiskRating
                                      ),
                                      borderWidth: "2px",
                                      borderStyle: "solid",
                                      width: "80%",
                                      borderLeft: `5px solid ${getBorderColor(
                                        d.additionalRiskRating
                                      )}`,
                                    }}
                                    readOnly
                                  />
                                </div>

                                <div className="form-group">
                                  <label>R</label>
                                  <input
                                    value={d.additionalRiskRating || "-"}
                                    style={{
                                      borderColor: getBorderColor(
                                        d.additionalRiskRating
                                      ),
                                      borderWidth: "2px",
                                      borderStyle: "solid",
                                      width: "90%",
                                      borderLeft: `5px solid ${getBorderColor(
                                        d.additionalRiskRating
                                      )}`,
                                    }}
                                    readOnly
                                  />
                                </div>
                              </div>

                              <small
                                className={`risk-text ${getRiskTextClass(
                                  d.additionalRiskRating
                                )} metric-single`}
                                style={{ textAlign: "center" }}
                              >
                                {getRiskLevelText(d.additionalRiskRating)}
                              </small>
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

                          {/* ---------- YOUR ORIGINAL CARD CONTENT END ---------- */}
                        </div>
                      )}
                    </Draggable>
                  ))
                )}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="center-controls">
          <button
            type="button"
            className="rejectBtn"
            disabled={loading}
            onClick={() => setShowDeletePopup(true)}
          >
            <FaTrash /> {loading ? "Deleting Node..." : "Delete Node"}
          </button>
        </div>
      </div>

      {/* {showDetailPopup && (
        <CreateNodeDetails
          onClose={() => setShowDetailPopup(false)}
          onSave={handleSaveDetail}
          nodeID={id}
        />
      )} */}

      {showDetailPopup && (
        <CreateNodeDetails
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

      {sequenceUpdatePopup && (
        <SequenceUpdatePopup
          onClose={() => setSequenceUpdatePopup(false)}
          nodeId={id}
        />
      )}

      {showCompletePopup && (
        <ConfirmationPopup
          message="Are you sure you want to mark this node as completed?"
          onConfirm={handleCompleteNode}
          onCancel={() => setShowCompletePopup(false)}
        />
      )}

      {showDeletePopup && (
        <ConfirmationPopup
          message="Are you sure you want to delete this node?"
          onConfirm={handleDeleteNode}
          onCancel={() => setShowDeletePopup(false)}
        />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default NodeDetails;
