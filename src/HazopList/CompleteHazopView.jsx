import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../string";
import "../styles/global.css";
import { formatDate, showToast } from "../CommonUI/CommonUI";
import { useNavigate } from "react-router-dom";

const CompleteHazopView = ({
  hazopId,
  onClose,
  mode = "approval",
  approvalRequestId,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [hazop, setHazop] = useState({});
  const [team, setTeam] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [nodeDetails, setNodeDetails] = useState({});
  const [nodeRecommendations, setNodeRecommendations] = useState({});
  const [allRecommendations, setAllRecommendations] = useState([]);
  const [teamComments, setTeamComments] = useState([]);

  const [assignData, setAssignData] = useState({
    rejected: [],
    accepted: [],
    assigned: [],
    notAssigned: [],
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [verificationRecords, setVerificationRecords] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const loadStep1 = async () => {
      setLoading(true);
      try {
        const [hRes, tRes] = await Promise.all([
          axios.get(
            `http://${strings.localhost}/api/hazopRegistration/by-id?hazopId=${hazopId}`
          ),
          axios.get(
            `http://${strings.localhost}/api/hazopTeam/teamByHazop/${hazopId}?status=true`
          ),
        ]);
        setHazop(hRes.data || {});
        setTeam(Array.isArray(tRes.data) ? tRes.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStep1();
  }, [hazopId]);

  const loadNodes = async () => {
    setLoading(true);
    try {
      const nRes = await axios.get(
        `http://${strings.localhost}/api/hazopNode/by-registration-status?registrationId=${hazopId}&status=true`
      );
      const fetchedNodes = Array.isArray(nRes.data) ? nRes.data : [];
      setNodes(fetchedNodes);

      const dMap = {};
      await Promise.all(
        fetchedNodes.map(async (node) => {
          const detailsRes = await axios
            .get(
              `http://${strings.localhost}/api/hazopNodeDetail/node/${node.id}`
            )
            .then((res) => (Array.isArray(res.data) ? res.data : []))
            .catch(() => []);
          dMap[node.id] = detailsRes;
        })
      );
      setNodeDetails(dMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadNodeRecommendations = async () => {
    setLoading(true);
    try {
      const recMap = {};
      await Promise.all(
        nodes.map(async (node) => {
          const recsPerDetail = await Promise.all(
            (nodeDetails[node.id] || []).map(async (detail) => {
              const recs = await axios
                .get(
                  `http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${detail.id}`
                )
                .then((res) => (Array.isArray(res.data) ? res.data : []))
                .catch(() => []);
              return recs;
            })
          );
          recMap[node.id] = recsPerDetail;
        })
      );
      setNodeRecommendations(recMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllRecommendations = async () => {
    setLoading(true);
    try {
      const [allRecRes, assignRes] = await Promise.all([
        axios.get(
          `http://${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`
        ),
        axios.get(
          `http://${strings.localhost}/api/recommendation/assign/getAllByRegistration/${hazopId}`
        ),
      ]);
      setAllRecommendations(
        Array.isArray(allRecRes.data) ? allRecRes.data : []
      );
      setAssignData({
        rejected: Array.isArray(assignRes.data?.rejected)
          ? assignRes.data.rejected
          : [],
        accepted: Array.isArray(assignRes.data?.accepted)
          ? assignRes.data.accepted
          : [],
        assigned: Array.isArray(assignRes.data?.assigned)
          ? assignRes.data.assigned
          : [],
        notAssigned: Array.isArray(assignRes.data?.notAssigned)
          ? assignRes.data.notAssigned
          : [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationRecords = async () => {
    try {
      const res = await axios.get(
        `http://${strings.localhost}/api/nodeRecommendation/getVerificationActionRecords/${hazopId}`
      );
      setVerificationRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading verification action records:", err);
    }
  };
  const loadTeamComments = async () => {
    try {
      const res = await axios.get(`http://localhost:5559/api/team-comments/getByHazop/${hazopId}`);
      setTeamComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading team comments:", err);
    }
  };

  const handleNext = async () => {
    if (step === 1) await loadNodes();
    if (step === 2) await loadNodeRecommendations();
    if (step === 3) {
      await loadAllRecommendations();
      await loadVerificationRecords();
    }
    if (step === 4) {
      await loadTeamComments(); // Load comments for last page
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleApprovalSubmit = async (enteredComment) => {
    if (!approvalAction) return;

    const empCode = localStorage.getItem("empCode");
    const approvedBy = localStorage.getItem("fullName");
    const approve = approvalAction === "accept"; // true or false

    try {
      if (mode === "approval") {
        // Existing Approval API
        await axios.post(
          `http://${strings.localhost}/hazopApproval/action`,
          null,
          {
            params: {
              approvalRequestId,
              empCode,
              actionTaken: approve,
              approvedBy,
              comment: enteredComment,
            },
          }
        );
      } else if (mode === "confirmation") {
        // NEW Confirmation API
        await axios.put(
          `http://${strings.localhost}/api/hazopRegistration/verify`,
          null,
          {
            params: {
              id: hazopId,
              verificationEmpCode: approvedBy,
              approve,
            },
          }
        );
      }

      showToast(`Successfully ${approve ? "Approved" : "Rejected"}`, "success");

      setShowConfirm(false);
      onClose();
      setComment("");
      setApprovalAction(null);
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.error || "Something went wrong";
      showToast(errorMessage, "error");
    }
  };

  const ConfirmationPopup = ({ message, onConfirm, onCancel, disableYes }) => {
    const [localComment, setLocalComment] = useState("");
    return (
      <div className="confirm-overlay">
        <div className="confirm-box">
          {/* <h4>Confirmation</h4> */}
          <p>{message}</p>
          {mode === "approval" && (
            <textarea
              placeholder="Enter comment..."
              value={localComment}
              onChange={(e) => setLocalComment(e.target.value)}
              className="comment-input"
            ></textarea>
          )}
          <div className="confirm-buttons">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(localComment)}
              className="confirm-btn"
              disabled={disableYes}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getRiskClass = (risk) => {
    if (!risk) return "risk-default";

    const r = Number(risk);

    if ([1, 2, 3, 4, 5].includes(r)) return "risk-trivial-text";
    if ([6, 8, 9, 10].includes(r)) return "risk-tolerable-text";
    if ([12, 15].includes(r)) return "risk-moderate-text";
    if ([16, 18].includes(r)) return "risk-substantial-text";
    if ([20, 25].includes(r)) return "risk-intolerable-text";

    return "risk-default";
  };

  return (
    <div>
      <div className="hazop-view-page">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        {!loading && (
          <>
            {step === 1 && (
              <div>
                <button className="nd-back-btn" onClick={() => navigate(-1)}>
                  ← Back{" "}
                </button>
                <h2>HAZOP Info</h2>
                <p>
                  <strong>Description:</strong> {hazop.description}
                </p>
                <p>
                  <strong>Title:</strong> {hazop.hazopTitle}
                </p>
                <p>
                  <strong>Site:</strong> {hazop.site}
                </p>
                <p>
                  <strong>Department:</strong> {hazop.department}
                </p>
                <p>
                  <strong>Revision:</strong> {hazop.hazopRevisionNo}
                </p>

                <h3>Team Members</h3>
                {team.length === 0 ? (
                  <p>No team members assigned.</p>
                ) : (
                  <table className="confirm-table-custom">
                    <thead>
                      <tr>
                        <th>Employee Code</th>
                        <th>Email</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.map((m) => (
                        <tr key={m.id}>
                          <td>{m.empCode}</td>
                          <td>{m.emailId}</td>
                          <td>
                            {m.firstName || "-"} {m.lastName || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2>Nodes</h2>
                {nodes.map((node) => (
                  <div key={node.id} className="node-card">
                    <p>
                      <strong>
                        Node #{node.nodeNumber} - {node.hazopTitle}
                      </strong>
                    </p>
                    <p>
                      <strong>Design Intent:</strong> {node.designIntent}
                    </p>
                    <p>
                      <strong>Equipment:</strong> {node.equipment}
                    </p>
                    <p>
                      <strong>Controls:</strong> {node.controls}
                    </p>
                    <p>
                      <strong>Temperature:</strong> {node.temprature}
                    </p>
                    <p>
                      <strong>Pressure:</strong> {node.pressure}
                    </p>
                    <p>
                      <strong>Flow/Quantity:</strong> {node.quantityFlowRate}
                    </p>
                    <p>
                      <strong>Chemical & Utilities:</strong>{" "}
                      {node.chemicalAndUtilities}
                    </p>
                    <p>
                      <strong>Completion Status:</strong>{" "}
                      {node.completionStatus ? "Completed" : "Pending"}
                    </p>
                    <p>
                      <strong>Completion Date:</strong>{" "}
                      {formatDate(node.completionDate || "-")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2>Discussions & Recommendations</h2>
                {nodes.map((node) => {
                  const details = nodeDetails[node.id] || [];
                  const recsMap = nodeRecommendations[node.id] || [];

                  if (details.length === 0 && recsMap.length === 0) return null;

                  return (
                    <div key={node.id} className="node-card">
                      <div className="node-header">
                        <h3>
                          Node #{node.nodeNumber} - {node.hazopTitle || "-"}
                        </h3>
                      </div>

                      {details.length > 0 &&
                        details.map((detail, idx) => (
                          <div key={detail.id} className="node-detail-section">
                            <div className="node-detail-label">
                              {idx + 1}. Node Discussion
                            </div>
                            <div className="table-wrapper">
                              <table className="node-details-table">
                                <thead>
                                  <tr>
                                    <th>General Param</th>
                                    <th>Specific Param</th>
                                    <th>Guid Word</th>
                                    <th>Existing Probability</th>
                                    <th>Existing Severity</th>
                                    <th>Risk Rating</th>
                                    <th>Additional Probability</th>
                                    <th>Additional Severity</th>
                                    <th>Additional Risk Rating</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(nodeDetails[node.id] || []).map(
                                    (detail) => (
                                      <tr key={detail.id}>
                                        <td>{detail.generalParameter}</td>
                                        <td>{detail.specificParameter}</td>
                                        <td>{detail.guidWord}</td>

                                        <td>{detail.existineProbability}</td>
                                        <td>{detail.existingSeverity}</td>
                                        <td
                                          className={getRiskClass(
                                            detail.riskRating
                                          )}
                                        >
                                          {detail.riskRating}
                                        </td>

                                        <td>{detail.additionalProbability}</td>
                                        <td>{detail.additionalSeverity}</td>
                                        <td
                                          className={getRiskClass(
                                            detail.additionalRiskRating
                                          )}
                                        >
                                          {detail.additionalRiskRating}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>

                              <div>
                                <div className="input-row">
                                  <div className="form-group">
                                    <span>Deviation</span>
                                    <textarea
                                      className="textareaFont"
                                      value={detail.deviation}
                                      readOnly
                                      rows={10}
                                    ></textarea>
                                  </div>

                                  <div className="form-group">
                                    <span>Causes</span>
                                    <textarea
                                      className="textareaFont"
                                      value={detail.causes}
                                      readOnly
                                      rows={10}
                                    ></textarea>
                                  </div>

                                  <div className="form-group">
                                    <span>Consequences</span>
                                    <textarea
                                      className="textareaFont"
                                      value={detail.consequences}
                                      readOnly
                                      rows={10}
                                    ></textarea>
                                  </div>
                                  <div className="form-group">
                                    <span>Existing Control</span>
                                    <textarea
                                      className="textareaFont"
                                      value={detail.existineControl}
                                      readOnly
                                      rows={10}
                                    ></textarea>
                                  </div>

                                  <div className="form-group">
                                    <span>Additional Control</span>
                                    <textarea
                                      className="textareaFont"
                                      value={detail.additionalControl}
                                      readOnly
                                      rows={10}
                                    ></textarea>
                                  </div>
                                </div>


                              </div>
                            </div>

                            {recsMap[idx] && recsMap[idx].length > 0 && (
                              <div className="node-recommendations">
                                <div className="rec-label">
                                  Recommendations:
                                </div>
                                <ul>
                                  {recsMap[idx].map((rec) => (
                                    <li key={rec.id}>{rec.recommendation}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}

                      {/* If node has no details but recommendations */}
                      {details.length === 0 &&
                        recsMap.length > 0 &&
                        recsMap.map(
                          (recs, i) =>
                            recs.length > 0 && (
                              <div key={i} className="node-recommendations">
                                <div className="rec-label">
                                  Recommendations:
                                </div>
                                <ul>
                                  {recs.map((r) => (
                                    <li key={r.id}>
                                      <span className="recommendation-text">
                                        {r.recommendation}
                                      </span>
                                      {r.remarkbyManagement && (
                                        <span className="remark-by-management">
                                          {" "}
                                          — Remark: {r.remarkbyManagement}
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )
                        )}
                    </div>
                  );
                })}
              </div>
            )}

            {step === 4 && (
              <div>
                <h2>All Recommendations</h2>

                <div className="recommendation-card">
                  <h3>All Recommendations</h3>

                  <div className="table-wrapper">
                    <table className="node-details-table">
                      <thead>
                        <tr>
                          <th>Recommendation</th>
                          <th>Remark</th>
                          <th>Responsibility</th>
                          <th>Department</th>
                          <th>Completion Status</th>
                          <th>Completion Date</th>


                        </tr>
                      </thead>

                      <tbody>
                        {allRecommendations.map((rec) => (
                          <tr key={rec.id}>
                            <td>{rec.recommendation || "-"}</td>

                            <td>{rec.remarkbyManagement || "-"}</td>

                            <td>{rec.responsibility || "-"}</td>
                            <td>{rec.department || "-"}</td>

                            <td>
                              {rec.completionStatus ? (
                                <span
                                  style={{ color: "green", fontWeight: "600" }}
                                >
                                  Completed
                                </span>
                              ) : (
                                <span
                                  style={{ color: "red", fontWeight: "600" }}
                                >
                                  Pending
                                </span>
                              )}
                            </td>

                            <td>
                              {rec.completionDate
                                ? formatDate(rec.completionDate)
                                : "-"}
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="recommendation-card">
                  <h3>Assignments Summary</h3>

                  {["notAssigned", "assigned", "accepted", "rejected"].map(
                    (type) => (
                      <div key={type}>
                        <h4>{type.charAt(0).toUpperCase() + type.slice(1)}</h4>

                        {assignData[type].length === 0 ? (
                          <p>No data</p>
                        ) : (
                          <div className="table-wrapper">
                            <table className="node-details-table">
                              <thead>
                                <tr>
                                  <th>Recommendation</th>
                                  <th>Remark</th>
                                  <th>Assigned To</th>
                                  <th>Assigned By</th>
                                  <th>Assigned Date</th>
                                  <th>Completion Status</th>
                                  <th>Completion Date</th>
                                  <th>Acceptance Status</th>
                                  <th>Accepted By</th>


                                </tr>
                              </thead>

                              <tbody>
                                {assignData[type].map((a) => {
                                  const rec =
                                    a.javaHazopNodeRecommendation || a;

                                  return (
                                    <tr key={a.id}>
                                      <td>{rec.recommendation || "-"}</td>
                                      <td>{rec.remarkbyManagement || "-"}</td>
                                      <td>{a.assignToEmpCode || "-"}</td>
                                      <td>
                                        {a.createdByName ||
                                          a.createdByEmpCode ||
                                          "-"}
                                      </td>
                                      <td>
                                        {formatDate(a.assignWorkDate) || "-"}
                                      </td>
                                      <td
                                        style={{
                                          fontWeight: 600,
                                          color: a.completionStatus
                                            ? "green"
                                            : "red",
                                        }}
                                      >
                                        {a.completionStatus
                                          ? "Completed"
                                          : "Pending"}
                                      </td>
                                      <td>
                                        {a.completionDate
                                          ? formatDate(a.completionDate)
                                          : "-"}
                                      </td>
                                      <td>
                                        {a.assignworkAcceptance
                                          ? "Accepted"
                                          : a.assignWorkSendForAcceptance
                                            ? "Waiting for Acceptance"
                                            : "Not Sent"}
                                      </td>

                                      <td>{a.acceptedByEmployeeName || "-"}</td>


                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div className="recommendation-card">
                  <h3>Verification Action Records</h3>

                  {verificationRecords.length === 0 ? (
                    <p>No verification actions found.</p>
                  ) : (
                    <table className="node-details-table">
                      <thead>
                        <tr>
                          <th>Recommendation</th>
                          <th>Remark</th>
                          <th>Completion Status</th>
                          <th>Send for Verification</th>
                          <th>Verification Action</th>
                          <th>Verification Status</th>
                          <th>Verified By</th>
                          <th>Email</th>
                          <th>Verification Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verificationRecords.map((r) => (
                          <tr key={r.id}>
                            <td>{r.recommendation || "-"}</td>

                            <td>{r.remarkbyManagement || "-"}</td>

                            {/* Completion Status */}
                            <td>
                              {r.completionStatus ? (
                                <span
                                  style={{ color: "green", fontWeight: "600" }}
                                >
                                  Completed
                                </span>
                              ) : (
                                <span
                                  style={{ color: "red", fontWeight: "600" }}
                                >
                                  Pending
                                </span>
                              )}
                            </td>

                            {/* Send for verification */}
                            <td>{r.sendForVerification ? "Yes" : "No"}</td>

                            {/* Was verification action triggered */}
                            <td>
                              {r.sendForVerificationAction ? (
                                <span style={{ color: "blue" }}>
                                  Action Taken
                                </span>
                              ) : (
                                <span>No Action</span>
                              )}
                            </td>

                            {/* Status of verification action */}
                            <td>
                              {r.sendForVerificationActionStatus ? (
                                <span
                                  style={{ color: "green", fontWeight: "600" }}
                                >
                                  Approved
                                </span>
                              ) : (
                                <span
                                  style={{ color: "red", fontWeight: "600" }}
                                >
                                  Rejected
                                </span>
                              )}
                            </td>

                            <td>
                              {r.verificationResponsibleEmployeeName || "-"}
                            </td>

                            <td>
                              {r.verificationResponsibleEmployeeEmail || "-"}
                            </td>

                            <td>{formatDate(r.verificationDate) || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* APPROVAL BUTTONS */}
                <div className="confirm-buttons">
                  <button
                    className="approveBtn"
                    onClick={() => {
                      setApprovalAction("accept");
                      setShowConfirm(true);
                    }}
                  >
                    Approve
                  </button>

                  <button
                    className="rejectBtn"
                    onClick={() => {
                      setApprovalAction("reject");
                      setShowConfirm(true);
                    }}
                  >
                    Reject
                  </button>

                  <button className="cancel-btn" onClick={onClose}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {step === 5 && (
              <div>
                <h2>Team Comments</h2>
                {teamComments.length === 0 ? (
                  <p>No comments available.</p>
                ) : (
                  <table className="node-details-table">
                    <thead>
                      <tr>
                        <th>Team Member</th>
                        <th>Comment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamComments.map((comment) => (
                        <tr key={comment.id}>
                          <td>{comment.empCode || "-"}</td>
                          <td>{comment.comment || "-"}</td>
                          <td>{formatDate(comment.commentDate) || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            <div className="modal-actions">
              {step > 1 && <button onClick={handlePrev}>Previous</button>}
              {step < 5 && <button onClick={handleNext}>Next</button>}
            </div>
          </>
        )}
        {showConfirm && (
          <ConfirmationPopup
            message={`Are you sure you want to ${approvalAction === "accept" ? "Approve" : "Reject"
              }?`}
            onConfirm={(enteredComment) => handleApprovalSubmit(enteredComment)}
            onCancel={() => {
              setShowConfirm(false);
              setApprovalAction(null);
            }}
            mode="approval"
          />
        )}
      </div>
    </div>
  );
};

export default CompleteHazopView;
