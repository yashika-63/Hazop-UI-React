import React, { useEffect, useState } from "react";
import axios from "axios";
import { BlobProvider } from "@react-pdf/renderer";
import { strings } from "../string";
import HazopPdfDocument from "./HazopPdfDocument";
import { generateHazopExcel } from "./hazopExcelGenerator";
import { generateHazopPdf } from "./hazopPdfGenerator";

const HazopReportPage= ({ hazopId, onClose }) => {

    const [isDataLoading, setIsDataLoading] = useState(true);

    // 1. Force a fresh PDF generation every time data loads
    const [uniqueIdentifier, setUniqueIdentifier] = useState(Date.now());
   const  companyId = localStorage.getItem("companyId");
    // Data States
    const [hazop, setHazop] = useState({});
    const [team, setTeam] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [nodeDetails, setNodeDetails] = useState({});
    const [allRecommendations, setAllRecommendations] = useState([]);
    const [assignData, setAssignData] = useState({ rejected: [], accepted: [], assigned: [], notAssigned: [] });
    const [verificationData, setVerificationData] = useState([]);
    const [mocReferences, setMocReferences] = useState([]);
    const [registrationNodes, setRegistrationNodes] = useState([]);
    const [teamComments, setTeamComments] = useState([]);
    const [documents , setDocuments] = useState([]);
    const [downloadDate] = useState(new Date().toLocaleString());

    useEffect(() => {
        if (!hazopId) return;

        const load = async () => {
            setIsDataLoading(true);
            try {
                const [
                    fullRes,
                    allRecRes,
                    assignRes,
                    verificationRes,
                    mocRes,
                    regNodesRes,
                    teamCommentsRes,documentsRes,
                ] = await Promise.all([
                    axios.get(`${strings.localhost}/api/hazopRegistration/${hazopId}/full-details`),
                    axios.get(`${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`).catch(() => ({ data: [] })),
                    axios.get(`${strings.localhost}/api/recommendation/assign/getAllByRegistration/${hazopId}`).catch(() => ({ data: {} })),
                    axios.get(`${strings.localhost}/api/nodeRecommendation/getVerificationActionRecords/${hazopId}`).catch(() => ({ data: [] })),
                    axios.get(`${strings.localhost}/api/moc-reference/by-hazop?hazopRegistrationId=${hazopId}`).catch(() => ({ data: [] })),
                    axios.get(`${strings.localhost}/api/hazopNode/by-registration-status?registrationId=${hazopId}&status=true`).catch(() => ({ data: [] })),
                    axios.get(`${strings.localhost}/api/team-comments/getByHazop/${hazopId}`).catch(() => ({ data: [] })),
                    axios.get(`${strings.localhost}/api/javaHazopDocument/getByKeys`, {
                        params: {
                            companyId: companyId,
                            primeryKey: "HAZOPFIRSTPAGEID",
                            primeryKeyValue: hazopId,
                        },
                    }).catch(() => ({ data: [] }))
                
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
                setDocuments(Array.isArray(documentsRes.data) ? documentsRes.data : []);
                // Update identifier to force fresh PDF
                setUniqueIdentifier(Date.now());

            } catch (err) {
                console.error("Data loading error:", err);
            }
            setIsDataLoading(false);
        };

        load();
    }, [hazopId]);

    // Helper component for the Loading Spinner Overlay
    const LoadingOverlay = ({ text }) => (
        <div className="loading-overlay" style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)", // Slightly more opaque for better visibility
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 20, // Higher Z-index to sit on top of everything
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
            <span style={{ marginTop: 20, fontWeight: 'bold', color: 'white', fontSize: '16px' }}>
                {text}
            </span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
            <div style={{
                width: "90%", height: "95%", background: "#fff", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
            }}>

                {/* HEADER */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: 15, borderBottom: "1px solid #ddd", backgroundColor: "#f8f9fa" }}>
                    <button onClick={onClose} style={{ backgroundColor: "#dc3545", color: "#fff", padding: "8px 16px", borderRadius: 4, border: "none", cursor: "pointer" }}>Close</button>
                    <div>
                        <button disabled={isDataLoading} onClick={() => generateHazopExcel({ hazop, team, nodes, registrationNodes, nodeDetailsState: nodeDetails, allRecommendations, mocReferences, verificationData, assignData, hazopId, teamComments ,documents})} style={{ backgroundColor: isDataLoading ? "#94d3a2" : "#28a745", color: "#fff", padding: "8px 16px", borderRadius: 4, border: "none", cursor: "pointer", marginRight: 10 }}>Download Excel</button>
                        <button disabled={isDataLoading} onClick={() => generateHazopPdf({ hazop, team, nodes, nodeDetails, nodeDetailsState: nodeDetails, allRecommendations, verificationData, mocReferences, assignData, downloadDate, hazopId ,registrationNodes, documents })} style={{ backgroundColor: isDataLoading ? "#94d3a2" : "#28a745", color: "#fff", padding: "8px 16px", borderRadius: 4, border: "none", cursor: "pointer" }}>Download PDF</button>
                    </div>
                </div>

                {/* PDF CONTAINER */}
                <div style={{ flex: 1, backgroundColor: "#525659", position: "relative" }}>

                    {/* 1. INITIAL DATA FETCHING SPINNER */}
                    {isDataLoading && <LoadingOverlay text="Fetching Data..." />}

                    {!isDataLoading && registrationNodes.length > 0 ? (
                        <BlobProvider
                            key={uniqueIdentifier}
                            document={
                                <HazopPdfDocument
                                    uniqueIdentifier={uniqueIdentifier}
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
                                    documents={documents}
                                />
                            }
                        >
                            {({ url, loading, error }) => {
                                // 2. PDF RENDERING SPINNER
                                if (loading) {
                                    return <LoadingOverlay text="Rendering Report..." />;
                                }

                                if (error) {
                                    return <div style={{ color: "white", padding: 20 }}>Error generating PDF document.</div>;
                                }

                                if (url) {
                                    return (
                                        <object
                                            key={uniqueIdentifier}
                                            data={`${url}#page=1&view=FitH`}
                                            type="application/pdf"
                                            width="100%"
                                            height="100%"
                                            style={{ border: "none" }}
                                        >
                                            <iframe
                                                src={`${url}#page=1&view=FitH`}
                                                title="Hazop Report"
                                                style={{ width: "100%", height: "100%", border: "none" }}
                                            />
                                        </object>
                                    );
                                }
                                return null;
                            }}
                        </BlobProvider>
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