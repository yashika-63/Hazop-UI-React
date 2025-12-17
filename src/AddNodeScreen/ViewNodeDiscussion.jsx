import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDate, getRiskClass, getRiskLevelText, getRiskTextClass, showToast } from "../CommonUI/CommonUI";
import { strings } from "../string";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/global.css"; 
import './Node.css'; 

// --- Helper Component: Show More Text ---
const ShowMoreText = ({ text = "", previewLength = 250, borderClass }) => {
    const [expanded, setExpanded] = useState(false);
    const safeText = text || "";
    const preview = safeText.slice(0, previewLength);
    return (
        <div>
            <div className={`showmore-text ${borderClass}`}>
                {expanded ? safeText : preview + (safeText.length > previewLength ? "..." : "")}
            </div>
            {safeText.length > previewLength && (
                <button onClick={() => setExpanded(!expanded)} className="showmore-btn rightbtn-controls">
                    {expanded ? "Read Less" : "Read More"}
                </button>
            )}
        </div>
    );
};

const ViewNodeDiscussion = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { nodeId, detailId } = location.state || {};

    const [node, setNode] = useState(null);
    const [detail, setDetail] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRecommendations, setShowRecommendations] = useState(false);

    // --- Helper: Get CSS Color Variables for Borders ---
    const root = document.documentElement;
    const trivial = getComputedStyle(root).getPropertyValue("--trivial").trim();
    const tolerable = getComputedStyle(root).getPropertyValue("--tolerable").trim();
    const moderate = getComputedStyle(root).getPropertyValue("--moderate").trim();
    const substantial = getComputedStyle(root).getPropertyValue("--substantial").trim();
    const intolerable = getComputedStyle(root).getPropertyValue("--intolerable").trim();

    const getBorderColor = (risk) => {
        const r = Number(risk);
        if ([1, 2, 3, 4, 5].includes(r)) return trivial;
        if ([6, 8, 9, 10].includes(r)) return tolerable;
        if ([12, 15].includes(r)) return moderate;
        if ([16, 18].includes(r)) return substantial;
        if ([20, 25].includes(r)) return intolerable;
        return "#ccc";
    };

    const getBorderClass = (risk) => {
        const base = getRiskClass(risk);
        return "border-" + base.replace("risk-", "");
    };

    useEffect(() => {
        if (!nodeId || !detailId) {
            console.warn("Missing State IDs:", location.state);
            showToast("Navigation data missing", "error");
            navigate(-1);
            return;
        }
        
        const loadData = async () => {
            setLoading(true);
            try {
                const nodeRes = await fetch(`http://${strings.localhost}/api/hazopNode/${nodeId}`);
                if (nodeRes.ok) setNode(await nodeRes.json());

                const detailRes = await fetch(`http://${strings.localhost}/api/hazopNodeDetail/node/${nodeId}`);
                if (detailRes.ok) {
                    const allDetails = await detailRes.json();
                    const found = allDetails.find(d => d.id === detailId);
                    setDetail(found);
                }

                const recRes = await fetch(`http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${detailId}`);
                if (recRes.ok) setRecommendations(await recRes.json());

            } catch (err) {
                console.error(err);
                showToast("Failed to load details", "error");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [nodeId, detailId, navigate]);

    if (loading) return <div className="loading-overlay"><div className="loading-spinner"></div></div>;
    if (!detail) return <div className="no-data1">Discussion detail not found.</div>;

    return (
        <div className="view-mode-container" style={{ padding: "20px" }}>
            <div className="node-header">
                <button className="nd-back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
                <h1>Discussion Details</h1>
            </div>

            <div className="hazop-info">
                <div className="input-row">
                    <div><strong>Node No.:</strong> {node?.nodeNumber}</div>
                    <div><strong>Parameter:</strong> {detail.generalParameter}</div>
                    <div><strong>Guide Word:</strong> {detail.guidWord}</div>
                </div>
                <div style={{marginTop: '10px'}}>
                    <strong>Design Intent:</strong> {node?.designIntent}
                </div>
            </div>

            {/* Added 'nd-details-wrapper' to match parent container styling */}
            <div className="nd-details-wrapper" style={{ marginTop: '20px' }}>
                <div className={`nd-detail-card ${getRiskClass(detail.riskRating || detail.additionalRiskRating)}`}>
                    
                    <div className="nd-detail-header">
                        <div>
                            <h2>General Parameter: {detail.generalParameter}</h2>
                            <p>Specific Parameter: {detail.specificParameter}</p>
                            <p>Guide Word: {detail.guidWord}</p>
                        </div>
                        <div className="nd-detail-badges">
                            <span className={`risk-badge ${getRiskClass(detail.riskRating)}`}>
                                Initial Risk Rating: {detail.riskRating || "-"} ({getRiskLevelText(detail.riskRating)})
                            </span>
                            <span className={`risk-badge ${getRiskClass(detail.additionalRiskRating)}`}>
                                Final Risk Rating: {detail.additionalRiskRating || "-"} ({getRiskLevelText(detail.additionalRiskRating)})
                            </span>
                        </div>
                    </div>

                    <div className="input-row-node">
                        <div className="form-group">
                            <span>Deviation</span>
                            <ShowMoreText text={detail.deviation} previewLength={600} />
                        </div>
                        <div className="form-group">
                            <span>Consequences</span>
                            <ShowMoreText text={detail.consequences} previewLength={600} />
                        </div>
                        <div className="form-group">
                            <span>Causes</span>
                            <ShowMoreText text={detail.causes} previewLength={600} />
                        </div>

                        <div>
                            <div className="form-group existing-control">
                                <label>Existing Control</label>
                                <ShowMoreText text={detail.existineControl} borderClass={getBorderClass(detail.riskRating)} />
                            </div>
                            <div className="metric-row">
                                <div className="form-group">
                                    <label>P</label>
                                    <input 
                                        value={detail.existineProbability || "-"} 
                                        readOnly 
                                        style={{
                                            borderLeft: `5px solid ${getBorderColor(detail.riskRating)}`,
                                            borderWidth: "2px", borderStyle: "solid", borderColor: getBorderColor(detail.riskRating),
                                            width: "80%"
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>S</label>
                                    <input 
                                        value={detail.existingSeverity || "-"} 
                                        readOnly 
                                        style={{
                                            borderLeft: `5px solid ${getBorderColor(detail.riskRating)}`,
                                            borderWidth: "2px", borderStyle: "solid", borderColor: getBorderColor(detail.riskRating),
                                            width: "80%"
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>R</label>
                                    <input 
                                        value={detail.riskRating || "-"} 
                                        readOnly 
                                        style={{
                                            borderLeft: `5px solid ${getBorderColor(detail.riskRating)}`,
                                            borderWidth: "2px", borderStyle: "solid", borderColor: getBorderColor(detail.riskRating),
                                            width: "90%"
                                        }}
                                    />
                                </div>
                            </div>
                            <small className={`risk-text ${getRiskTextClass(detail.riskRating)} metric-single`} style={{ textAlign: "center" }}>
                                {getRiskLevelText(detail.riskRating)}
                            </small>
                        </div>

                        <div>
                            <div className="form-group existing-control">
                                <label>Additional Control</label>
                                <ShowMoreText text={detail.additionalControl} borderClass={getBorderClass(detail.additionalRiskRating)} />
                            </div>
                            <div className="metric-row">
                                <div className="form-group">
                                    <label>P</label>
                                    <input 
                                        value={detail.additionalProbability || "-"} 
                                        readOnly 
                                        style={{
                                            borderLeft: `5px solid ${getBorderColor(detail.additionalRiskRating)}`,
                                            borderWidth: "2px", borderStyle: "solid", borderColor: getBorderColor(detail.additionalRiskRating),
                                            width: "80%"
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>S</label>
                                    <input 
                                        value={detail.additionalSeverity || "-"} 
                                        readOnly 
                                        style={{
                                            borderLeft: `5px solid ${getBorderColor(detail.additionalRiskRating)}`,
                                            borderWidth: "2px", borderStyle: "solid", borderColor: getBorderColor(detail.additionalRiskRating),
                                            width: "80%"
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>R</label>
                                    <input 
                                        value={detail.additionalRiskRating || "-"} 
                                        readOnly 
                                        style={{
                                            borderLeft: `5px solid ${getBorderColor(detail.additionalRiskRating)}`,
                                            borderWidth: "2px", borderStyle: "solid", borderColor: getBorderColor(detail.additionalRiskRating),
                                            width: "90%"
                                        }}
                                    />
                                </div>
                            </div>
                            <small className={`risk-text ${getRiskTextClass(detail.additionalRiskRating)} metric-single`} style={{ textAlign: "center" }}>
                                {getRiskLevelText(detail.additionalRiskRating)}
                            </small>
                        </div>
                    </div>

                    <div className="rightbtn-controls">
                        <h6 style={{ cursor: "pointer", color: '#319795', fontWeight: 'bold' }} onClick={() => setShowRecommendations(!showRecommendations)}>
                            {showRecommendations ? "Hide Recommendations" : "View Recommendations"}
                        </h6>
                    </div>

                    {showRecommendations && (
                        <div className="recommendation-table-container">
                            <div className="card table-card">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Sr. No</th>
                                            <th>Recommendation</th>
                                            <th>Remarks</th>
                                            <th>Date</th>
                                            <th>Dept</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recommendations.length > 0 ? (
                                            recommendations.map((r, i) => (
                                                <tr key={r.id}>
                                                    <td>{i + 1}</td>
                                                    <td>{r.recommendation}</td>
                                                    <td>{r.remarkbyManagement}</td>
                                                    <td>{formatDate(r.completionDate)}</td>
                                                    <td>{r.department}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="5" className="centerText">No recommendations found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewNodeDiscussion;