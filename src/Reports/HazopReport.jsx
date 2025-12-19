import React, { useEffect, useState } from "react";
import axios from "axios";
import { PDFViewer } from "@react-pdf/renderer";
import { strings } from "../string";
import HazopPdfDocument from "./HazopPdfDocument";
import { generateHazopExcel } from "./hazopExcelGenerator";
import { generateHazopPdf } from "./hazopPdfGenerator";

const HazopReportPage = ({ hazopId, onClose }) => {

    // 1. Split loading into Data Loading and PDF Rendering
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isPdfRendering, setIsPdfRendering] = useState(true);

    // ... Data States ...
    const [hazop, setHazop] = useState({});
    const [team, setTeam] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [nodeDetails, setNodeDetails] = useState({});
    const [nodeRecommendations, setNodeRecommendations] = useState({});
    const [allRecommendations, setAllRecommendations] = useState([]);
    const [assignData, setAssignData] = useState({ rejected: [], accepted: [], assigned: [], notAssigned: [] });
    const [verificationData, setVerificationData] = useState([]);
    const [mocReferences, setMocReferences] = useState([]);
    const [registrationNodes, setRegistrationNodes] = useState([]);
    const [teamComments , setTeamComments ] = useState([]);

    // ✅ FIX: Use state so this date doesn't change on every re-render
    const [downloadDate] = useState(new Date().toLocaleString());
    useEffect(() => {
        if (!hazopId) return;

        const load = async () => {
            setIsDataLoading(true);
            setIsPdfRendering(true); // Reset PDF loading state on new fetch
            try {
                const [
                    fullRes,
                    allRecRes,
                    assignRes,
                    verificationRes,
                    mocRes,
                    regNodesRes,
                    teamCommentsRes
                ] = await Promise.all([
                    axios.get(`http://${strings.localhost}/api/hazopRegistration/${hazopId}/full-details`),
                    axios.get(`http://${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`).catch(() => ({ data: [] })),
                    axios.get(`http://${strings.localhost}/api/recommendation/assign/getAllByRegistration/${hazopId}`).catch(() => ({ data: {} })),
                    axios.get(`http://${strings.localhost}/api/nodeRecommendation/getVerificationActionRecords/${hazopId}`).catch(() => ({ data: [] })),
                    axios.get(`http://${strings.localhost}/api/moc-reference/by-hazop?hazopRegistrationId=${hazopId}`).catch(() => ({ data: [] })),
                    axios.get(`http://${strings.localhost}/api/hazopNode/by-registration-status?registrationId=${hazopId}&status=true`).catch(() => ({ data: [] })),
                    axios.get(`http://${strings.localhost}/api/team-comments/getByHazop/${hazopId}`).catch(() => ({ data: [] }))
                ]);

                const full = fullRes.data || {};
                setHazop(full.hazopInfo || {});
                setTeam(full.teamMembers || []);
                setNodes(full.nodes || []);
                setRegistrationNodes(regNodesRes.data || []);

                const detailsObj = {};
                (full.nodes || []).forEach(n => {
                    const nodeId = n.nodeInfo?.id;
                    if (nodeId) {
                        detailsObj[nodeId] = (n.details || []).map(d => ({
                            ...d.detailInfo,
                            recommendations: d.recommendations || []
                        }));
                    }
                });
                setNodeDetails(detailsObj);
                setAllRecommendations(allRecRes.data || []);
                setAssignData({
                    rejected: assignRes.data?.rejected || [],
                    accepted: assignRes.data?.accepted || [],
                    assigned: assignRes.data?.assigned || [],
                    notAssigned: assignRes.data?.notAssigned || []
                });
                setVerificationData(verificationRes.data || []);
                setMocReferences(mocRes.data || []);
                setTeamComments(teamCommentsRes.data || []);

            } catch (err) {
                console.error("Data loading error:", err);
            }
            // Data is ready, now we wait for PDF render
            setIsDataLoading(false);
        };

        load();
    }, [hazopId]);

    // Helper: Determine if we should show the spinner
    // We show it if Data is loading OR (Data is done but PDF is still rendering)
    // EXCEPTION: If there are no registrationNodes, the PDF won't mount, so we shouldn't wait for PDF render.
    const showSpinner = isDataLoading || (isPdfRendering && registrationNodes.length > 0);

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
        }}>
            <div style={{
                width: "90%",
                height: "95%",
                background: "#fff",
                borderRadius: 8,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative" // Needed for absolute positioning of spinner
            }}>

                {/* HEADER BUTTONS */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: 15,
                    borderBottom: "1px solid #ddd",
                    backgroundColor: "#f8f9fa"
                }}>
                    <button onClick={onClose}
                        style={{ backgroundColor: "#dc3545", color: "#fff", padding: "8px 16px", borderRadius: 4, border: "none", cursor: "pointer" }}>
                        Close
                    </button>

                    <div>
                        {/* Buttons only clickable when data is loaded */}
                        <button
                            disabled={showSpinner}
                            onClick={() => generateHazopExcel({
                                hazop, team, nodes, registrationNodes, nodeDetailsState: nodeDetails,
                                allRecommendations, mocReferences, verificationData, assignData, hazopId,teamComments
                            })}
                            style={{ backgroundColor: showSpinner ? "#94d3a2" : "#28a745", color: "#fff", padding: "8px 16px", borderRadius: 4, border: "none", cursor: "pointer", marginRight: 10 }}
                        >
                            Download Excel
                        </button>

                        <button
                            disabled={showSpinner}
                            onClick={() => generateHazopPdf({
                                hazop, team, nodes, nodeDetails, nodeDetailsState: nodeDetails,
                                nodeRecommendations, allRecommendations, verificationData, mocReferences,
                                assignData, downloadDate, hazopId
                            })}
                            style={{ backgroundColor: showSpinner ? "#94d3a2" : "#28a745", color: "#fff", padding: "8px 16px", borderRadius: 4, border: "none", cursor: "pointer" }}
                        >
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* PDF VIEWER CONTAINER */}
                <div style={{ flex: 1, backgroundColor: "#525659", position: "relative" }}>

                    {/* 2. SPINNER OVERLAY */}
                    {showSpinner && (
                        <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 10,
                            flexDirection: 'column'
                        }}>
                            <div className="loading-spinner" style={{
                                width: "50px",
                                height: "50px",
                                border: "5px solid #f3f3f3",
                                borderTop: "5px solid #3498db",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite"
                            }}></div>
                            <span style={{ marginTop: 15, fontWeight: 'bold', color: '#333' }}>
                                {isDataLoading ? "Fetching Data..." : "Generating Report..."}
                            </span>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {/* 3. PDF VIEWER - Rendered but hidden behind spinner until ready */}
                    {!isDataLoading && registrationNodes.length > 0 ? (
                        <PDFViewer
                            key={`${hazopId}-${downloadDate}`}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                        >
                            <HazopPdfDocument
                                hazop={hazop}
                                team={team}
                                nodes={nodes}
                                registrationNodes={registrationNodes}
                                nodeDetailsState={nodeDetails}
                                mocReferences={mocReferences}
                                allRecommendations={allRecommendations}
                                verificationData={verificationData}
                                assignData={assignData}
                                downloadDate={downloadDate}
                                // 4. Callback to turn off spinner
                                onRenderComplete={() => {
                                    console.log("PDF Generation Complete");
                                    setIsPdfRendering(false);
                                }}
                            />
                        </PDFViewer>
                    ) : (
                        !isDataLoading && (
                            <div style={{ color: "white", textAlign: "center", marginTop: 100 }}>
                                No registration nodes found.
                            </div>
                        )
                    )}
                </div>

            </div>
        </div>
    );
};

export default HazopReportPage;