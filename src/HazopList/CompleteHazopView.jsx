import React, { useEffect, useState } from "react";
import axios from "axios";
import { strings } from "../string";
import '../styles/global.css';
import { showToast } from "../CommonUI/CommonUI";

const CompleteHazopView = ({ hazopId, onClose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [hazop, setHazop] = useState({});
    const [team, setTeam] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [nodeDetails, setNodeDetails] = useState({});
    const [nodeRecommendations, setNodeRecommendations] = useState({});
    const [allRecommendations, setAllRecommendations] = useState([]);
    const [assignData, setAssignData] = useState({ rejected: [], accepted: [], assigned: [], notAssigned: [] });
    const [showConfirm, setShowConfirm] = useState(false);
    const [approvalAction, setApprovalAction] = useState(null); // "accept" or "reject"
    const [comment, setComment] = useState("");

    useEffect(() => {
        const loadStep1 = async () => {
            setLoading(true);
            try {
                const [hRes, tRes] = await Promise.all([
                    axios.get(`http://${strings.localhost}/api/hazopRegistration/by-id?hazopId=${hazopId}`),
                    axios.get(`http://${strings.localhost}/api/hazopTeam/teamByHazop/${hazopId}?status=true`)
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
            const nRes = await axios.get(`http://${strings.localhost}/api/hazopNode/by-registration-status?registrationId=${hazopId}&status=true`);
            const fetchedNodes = Array.isArray(nRes.data) ? nRes.data : [];
            setNodes(fetchedNodes);

            const dMap = {};
            await Promise.all(
                fetchedNodes.map(async (node) => {
                    const detailsRes = await axios.get(`http://${strings.localhost}/api/hazopNodeDetail/node/${node.id}`)
                        .then(res => Array.isArray(res.data) ? res.data : [])
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
            await Promise.all(nodes.map(async (node) => {
                const recsPerDetail = await Promise.all(
                    (nodeDetails[node.id] || []).map(async (detail) => {
                        const recs = await axios.get(`http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${detail.id}`)
                            .then(res => Array.isArray(res.data) ? res.data : [])
                            .catch(() => []);
                        return recs;
                    })
                );
                recMap[node.id] = recsPerDetail;
            }));
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
                axios.get(`http://${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`),
                axios.get(`http://${strings.localhost}/api/recommendation/assign/getAllByRegistration/${hazopId}`)
            ]);
            setAllRecommendations(Array.isArray(allRecRes.data) ? allRecRes.data : []);
            setAssignData({
                rejected: Array.isArray(assignRes.data?.rejected) ? assignRes.data.rejected : [],
                accepted: Array.isArray(assignRes.data?.accepted) ? assignRes.data.accepted : [],
                assigned: Array.isArray(assignRes.data?.assigned) ? assignRes.data.assigned : [],
                notAssigned: Array.isArray(assignRes.data?.notAssigned) ? assignRes.data.notAssigned : []
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (step === 1) await loadNodes();
        if (step === 2) await loadNodeRecommendations();
        if (step === 3) await loadAllRecommendations();
        setStep(prev => prev + 1);
    };

    const handlePrev = () => {
        if (step > 1) setStep(prev => prev - 1);
    };



    const handleApprovalSubmit = async () => {
        if (!approvalAction) return;

        const empCode = localStorage.getItem('empCode');
        const approvedBy = localStorage.getItem("fullName");

        const actionTaken = approvalAction === "accept";

        try {
            await axios.post(
                `http://${strings.localhost}/hazopApproval/action`,
                null,
                {
                    params: {
                        empCode,
                        actionTaken,
                        approvedBy,
                        comment
                    }
                }
            );

            showToast(`Successfully ${approvalAction === "accept" ? "Approved" : "Rejected"}`, 'success');
            setShowConfirm(false);
            setComment("");
            setApprovalAction(null);
        } catch (err) {
            console.error(err);
            showToast("Something went wrong", 'error');
        }
    };
    const ConfirmationPopup = ({ message, onConfirm, onCancel, disableYes }) => {
        return (
            <div className="confirm-overlay">
                <div className="confirm-box">
                    <h4>Confirmation</h4>
                    <p>{message}</p>

                    <textarea
                        placeholder="Enter comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="comment-input"
                    ></textarea>

                    <div className="confirm-buttons">
                        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
                        <button
                            type="button"
                            onClick={onConfirm}
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


    return (
        <div className="modal-container">
            <div className="modal-content1">
                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}

                {!loading && (
                    <>
                        {step === 1 && (
                            <div>
                                <h2>HAZOP Info</h2>
                                <p><strong>Description:</strong> {hazop.description}</p>
                                <p><strong>Site:</strong> {hazop.site}</p>
                                <p><strong>Department:</strong> {hazop.department}</p>
                                <p><strong>Revision:</strong> {hazop.hazopRevisionNo}</p>

                                <h3>Team Members</h3>
                                {team.length === 0 ? <p>No team members assigned.</p> : (
                                    <table className="confirm-table-custom">
                                        <thead>
                                            <tr>
                                                <th>Employee Code</th>
                                                <th>Email</th>
                                                <th>Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {team.map(m => (
                                                <tr key={m.id}>
                                                    <td>{m.empCode}</td>
                                                    <td>{m.emailId}</td>
                                                    <td>{m.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2>Nodes & Details</h2>
                                {nodes.map(node => (
                                    <div key={node.id} className="node-card">
                                        <p><strong>Node #{node.nodeNumber}</strong></p>
                                        {(nodeDetails[node.id] || []).length === 0 ? (
                                            <p>No details available</p>
                                        ) : (
                                            <table className="node-details-table">
                                                <thead>
                                                    <tr>
                                                        <th>Param</th>
                                                        <th>Deviation</th>
                                                        <th>Causes</th>
                                                        <th>Consequences</th>
                                                        <th>Existing Control</th>
                                                        <th>Risk</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(nodeDetails[node.id] || []).map(d => (
                                                        <tr key={d.id}>
                                                            <td>{d.generalParameter}/{d.specificParameter}</td>
                                                            <td>{d.deviation}</td>
                                                            <td>{d.causes}</td>
                                                            <td>{d.consequences}</td>
                                                            <td>{d.existineControl}</td>
                                                            <td>{d.riskRating}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2>Node Recommendations</h2>
                                {nodes.map(node => (
                                    <div key={node.id} className="node-card">
                                        <p><strong>Node #{node.nodeNumber}</strong></p>
                                        {(nodeRecommendations[node.id] || []).map((recs, idx) => (
                                            <ul key={idx}>
                                                {recs.map(r => <li key={r.id}>{r.recommendation}</li>)}
                                            </ul>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 4 && (
                            <div>
                                <h2>All Recommendations & Assignments</h2>

                                <div className="recommendation-card">
                                    <h3>Recommendations</h3>
                                    <table className="confirm-table-custom">
                                        <thead>
                                            <tr>
                                                <th>Recommendation</th>
                                                <th>Remark</th>
                                                <th>Responsibility</th>
                                                <th>Status</th>
                                                <th>Verification</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allRecommendations.map(rec => (
                                                <tr key={rec.id}>
                                                    <td>{rec.recommendation || "-"}</td>
                                                    <td>{rec.remarkbyManagement || "-"}</td>
                                                    <td>{rec.responsibility || "-"}</td>
                                                    <td>{rec.completionStatus ? "Completed" : "Pending"}</td>
                                                    <td>{rec.verificationResponsibleEmployeeName || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="recommendation-card">
                                    <h3>Assignments Summary</h3>
                                    {["assigned", "accepted", "rejected", "notAssigned"].map(type => (
                                        <div key={type}>
                                            <h4>{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                                            {assignData[type].length === 0 ? <p>No data</p> :
                                                <table className="assignment-table-custom">
                                                    <thead>
                                                        <tr>
                                                            <th>Assigned To</th>
                                                            <th>Assigned Date</th>
                                                            <th>Completion Date</th>
                                                            <th>Acceptance</th>
                                                            <th>Recommendation</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {assignData[type].map(a => (
                                                            <tr key={a.id}>
                                                                <td>{a.assignToEmpCode || "-"}</td>
                                                                <td>{a.assignWorkDate || "-"}</td>
                                                                <td>{a.completionDate || "-"}</td>
                                                                <td>{a.assignworkAcceptance ? "Accepted" : "Pending"}</td>
                                                                <td>{a.javaHazopNodeRecommendation?.recommendation || "-"}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            }
                                        </div>
                                    ))}
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


                        <div className="modal-actions">
                            {step > 1 && <button onClick={handlePrev}>Previous</button>}
                            {step < 4 && <button onClick={handleNext}>Next</button>}
                        </div>
                    </>
                )}
                {showConfirm && (
                    <ConfirmationPopup
                        message={`Are you sure you want to ${approvalAction === "accept" ? "Approve" : "Reject"}?`}
                        onConfirm={handleApprovalSubmit}
                        onCancel={() => {
                            setShowConfirm(false);
                            setComment("");
                            setApprovalAction(null);
                        }}
                        disableYes={comment.trim().length === 0}
                    />
                )}

            </div>
        </div>
    );
};

export default CompleteHazopView;
