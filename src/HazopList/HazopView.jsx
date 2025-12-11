import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../string";
import "../styles/global.css";
import { formatDate, getBorderColor, getRiskClass, getRiskLevelText, getRiskTextClass, showToast } from "../CommonUI/CommonUI";
import { useNavigate } from "react-router-dom";
import '../AddNodeScreen/Node.css';
import './HazopView.css';

const HazopView = ({ onClose, mode = "view-only" }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [hazop, setHazop] = useState({});
    const [team, setTeam] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [teamComments, setTeamComments] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [mocReferences, setMocReferences] = useState([]);

    const [nodeDetails, setNodeDetails] = useState({});
    const [nodeRecommendations, setNodeRecommendations] = useState({});
    const [allRecommendations, setAllRecommendations] = useState([]);
    const [assignData, setAssignData] = useState({
        rejected: [],
        accepted: [],
        assigned: [],
        notAssigned: [],
    });
    const [verificationRecords, setVerificationRecords] = useState([]);
    const hazopId = localStorage.getItem("hazopId");

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
                await loadMocReferences();
                await loadDocuments();
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
            const res = await axios.get(`http://${strings.localhost}/api/team-comments/getByHazop/${hazopId}`);
            setTeamComments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error loading team comments:", err);
        }
    };

    const loadDocuments = async () => {
        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/javaHazopDocument/getByKeys`,
                {
                    params: {
                        companyId: localStorage.getItem("companyId") || 1,
                        primeryKey: "HAZOPFIRSTPAGEID",
                        primeryKeyValue: hazopId
                    }
                }
            );
            setDocuments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error loading HAZOP documents:", err);
        }
    };


    const loadMocReferences = async () => {
        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/moc-reference/by-hazop`,
                {
                    params: { hazopRegistrationId: hazopId }
                }
            );
            setMocReferences(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error loading MOC references:", err);
            showToast("Failed to load MOC references", "error");
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

                                {mocReferences.length > 0 && (
                                    <div>
                                        <h3>MOC Details</h3>
                                        <table className="hazop-table">
                                            <thead>
                                                <tr>
                                                    <th>MOC No</th>
                                                    <th>Title</th>
                                                    <th>Plant</th>
                                                    <th>Department</th>
                                                    <th>MOC Date</th>
                                                    <th>Registered Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mocReferences.map((moc) => (
                                                    <tr key={moc.id}>
                                                        <td>{moc.mocNo}</td>
                                                        <td>{moc.mocTitle}</td>
                                                        <td>{moc.mocPlant}</td>
                                                        <td>{moc.mocDepartment}</td>
                                                        <td>{moc.mocDate}</td>
                                                        <td>{moc.registerDate}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}


                                {documents.length > 0 && (
                                    <div>
                                        <h3>Documents</h3>
                                        <ul className="document-list">
                                            {documents.map((doc) => {
                                                const fileName = doc.filePath.split("\\").pop(); 
                                                return (
                                                    <li key={doc.id}>
                                                        <a
                                                            href={`http://${strings.localhost}/api/javaHazopDocument/view/${doc.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {fileName || "Unnamed Document"}
                                                        </a>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

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

                                        <div>
                                            <strong>Design Intent:</strong> {node.designIntent}
                                        </div>

                                        <div className="input-row">
                                            <div>
                                                <strong>Equipment:</strong> {node.equipment}
                                            </div>
                                            <div>
                                                <strong>Controls:</strong> {node.controls}
                                            </div>
                                        </div>

                                        <div className="input-row">
                                            <div>
                                                <strong>Temperature:</strong> {node.temprature}
                                            </div>
                                            <div>
                                                <strong>Pressure:</strong> {node.pressure}
                                            </div>

                                        </div>

                                        <div className="input-row">
                                            <div>
                                                <strong>Chemical & Utilities:</strong>{" "}
                                                {node.chemicalAndUtilities}
                                            </div>
                                            <div>
                                                <strong>Flow/Quantity:</strong> {node.quantityFlowRate}
                                            </div>

                                        </div>
                                        <div className="input-row">
                                            <div>
                                                <strong>Completion Status:</strong>{" "}
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

                                            <div>
                                                <strong>Completion Date:</strong>{" "}
                                                {formatDate(node.completionDate || "-")}                                            </div>
                                        </div>

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
                                                            {idx + 1}. Discussion
                                                        </div>
                                                        <div >


                                                            <div>
                                                                <div className="input-row">
                                                                    <div className="form-group">
                                                                        <label>General Parameter</label>
                                                                        <textarea
                                                                            className="textareaFont"
                                                                            value={detail.generalParameter}
                                                                            readOnly
                                                                            rows={3}
                                                                        />
                                                                    </div>

                                                                    <div className="form-group">
                                                                        <label>Specific Parameter</label>
                                                                        <textarea
                                                                            className="textareaFont"
                                                                            value={detail.specificParameter}
                                                                            readOnly
                                                                            rows={3}
                                                                        />
                                                                    </div>

                                                                    <div className="form-group">
                                                                        <label>Guide Word</label>
                                                                        <textarea
                                                                            className="textareaFont"
                                                                            value={detail.guidWord}
                                                                            readOnly
                                                                            rows={3}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="input-row">
                                                                    <div className="form-group">
                                                                        <label>Deviation</label>
                                                                        <textarea
                                                                            className="textareaFont"
                                                                            value={detail.deviation}
                                                                            readOnly
                                                                            rows={10}
                                                                        />
                                                                    </div>

                                                                    <div className="form-group">
                                                                        <label>Causes</label>
                                                                        <textarea
                                                                            className="textareaFont"
                                                                            value={detail.causes}
                                                                            readOnly
                                                                            rows={10}
                                                                        />
                                                                    </div>

                                                                    <div className="form-group">
                                                                        <label>Consequences</label>
                                                                        <textarea
                                                                            className="textareaFont"
                                                                            value={detail.consequences}
                                                                            readOnly
                                                                            rows={10}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <div className="form-group">
                                                                            <label>Existing Control</label>
                                                                            <textarea
                                                                                className="textareaFont"
                                                                                value={detail.existineControl}
                                                                                readOnly
                                                                                rows={5}
                                                                            />
                                                                        </div>

                                                                        <div className="metric-row">
                                                                            <div className="form-group">
                                                                                <label>Probability</label>
                                                                                <input
                                                                                    className={`readonly ${getRiskClass(detail.existineProbability)}`}
                                                                                    value={detail.existineProbability}
                                                                                    readOnly
                                                                                    style={{ borderColor: getBorderColor(detail.existineProbability), width: '80px' }}
                                                                                />
                                                                            </div>

                                                                            <div className="form-group">
                                                                                <label>Severity</label>
                                                                                <input
                                                                                    className={`readonly ${getRiskClass(detail.existingSeverity)}`}
                                                                                    value={detail.existingSeverity}
                                                                                    readOnly
                                                                                    style={{ borderColor: getBorderColor(detail.existingSeverity), width: '80px' }}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="form-group metric-single">
                                                                            <label>Risk Rating</label>
                                                                            <input
                                                                                className={`readonly ${getRiskClass(detail.riskRating)}`}
                                                                                value={detail.riskRating}
                                                                                readOnly
                                                                                style={{ borderColor: getBorderColor(detail.riskRating) }}
                                                                            />
                                                                            <small
                                                                                className={`risk-text ${getRiskTextClass(
                                                                                    detail.riskRating
                                                                                )} center-controls`} style={{ textAlign: 'center' }}
                                                                            >
                                                                                {getRiskLevelText(detail.riskRating)}
                                                                            </small>
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <div className="form-group">
                                                                            <label>Additional Control</label>
                                                                            <textarea
                                                                                className="textareaFont"
                                                                                value={detail.additionalControl}
                                                                                readOnly
                                                                                rows={5}
                                                                            />
                                                                        </div>

                                                                        <div className="metric-row">
                                                                            <div className="form-group">
                                                                                <label>Probability</label>
                                                                                <input
                                                                                    className={`readonly ${getRiskClass(detail.additionalProbability)}`}
                                                                                    value={detail.additionalProbability}
                                                                                    readOnly
                                                                                    style={{ borderColor: getBorderColor(detail.additionalProbability), width: '80px' }}
                                                                                />
                                                                            </div>

                                                                            <div className="form-group">
                                                                                <label>Severity</label>
                                                                                <input
                                                                                    className={`readonly ${getRiskClass(detail.additionalSeverity)}`}
                                                                                    value={detail.additionalSeverity}
                                                                                    readOnly
                                                                                    style={{ borderColor: getBorderColor(detail.additionalSeverity), width: '80px' }}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="form-group metric-single">
                                                                            <label>Additional Risk Rating</label>
                                                                            <input
                                                                                className={`readonly ${getRiskClass(detail.additionalRiskRating)}`}
                                                                                value={detail.additionalRiskRating}
                                                                                readOnly
                                                                                style={{ borderColor: getBorderColor(detail.additionalRiskRating) }}
                                                                            />
                                                                            <small
                                                                                className={`risk-text ${getRiskTextClass(
                                                                                    detail.additionalRiskRating
                                                                                )} center-controls`} style={{ textAlign: 'center' }}
                                                                            >
                                                                                {getRiskLevelText(detail.additionalRiskRating)}
                                                                            </small>
                                                                        </div>
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
                                                        )
                                                        }
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

            </div>
        </div >
    );
};

export default HazopView;
