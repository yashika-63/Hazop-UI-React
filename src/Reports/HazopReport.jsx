import React, { useEffect, useState } from "react";
import axios from "axios";
import { PDFViewer } from "@react-pdf/renderer";
import { strings } from "../string";
import HazopPdfDocument from "./HazopPdfDocument";
import { generateHazopExcel } from "./hazopExcelGenerator";
import { generateHazopPdf } from "./hazopPdfGenerator";


const HazopReportPage = ({ hazopId, onClose }) => {

    const [loading, setLoading] = useState(true);
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

    const downloadDate = new Date().toLocaleString();



    useEffect(() => {
        if (!hazopId) return;

        const load = async () => {
            setLoading(true);
            try {
                const [
                    fullRes,
                    allRecRes,
                    assignRes,
                    verificationRes,
                    mocRes,
                    regNodesRes
                ] = await Promise.all([
                    axios.get(`http://${strings.localhost}/api/hazopRegistration/${hazopId}/full-details`),
                    axios.get(`http://${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`).catch(() => ({ data: [] })),
                    axios.get(`http://${strings.localhost}/api/recommendation/assign/getAllByRegistration/${hazopId}`).catch(() => ({ data: {} })),
                    axios.get(`http://${strings.localhost}/api/nodeRecommendation/getVerificationActionRecords/${hazopId}`).catch(() => ({ data: [] })),
                    axios.get(`http://${strings.localhost}/api/moc-reference/by-hazop?hazopRegistrationId=${hazopId}`).catch(() => ({ data: [] })),
                    axios.get(`http://${strings.localhost}/api/hazopNode/by-registration-status?registrationId=${hazopId}&status=true`).catch(() => ({ data: [] }))
                ]);

                const full = fullRes.data || {};

                setHazop(full.hazopInfo || {});
                setTeam(full.teamMembers || []);
                setNodes(full.nodes || []);
                setRegistrationNodes(regNodesRes.data || []);

                // ⬇ Build details dynamically
                const detailsObj = {};
                (full.nodes || []).forEach(n => {
                    const nodeId = n.nodeInfo?.id; // <- use nodeInfo.id
                    if (nodeId) {
                        detailsObj[nodeId] = (n.details || []).map(d => ({
                            ...d.detailInfo,
                            recommendations: d.recommendations || []
                        }));
                    }
                });
                setNodeDetails(detailsObj);


                // setNodeRecommendations(recObj);

                setAllRecommendations(allRecRes.data || []);

                setAssignData({
                    rejected: assignRes.data?.rejected || [],
                    accepted: assignRes.data?.accepted || [],
                    assigned: assignRes.data?.assigned || [],
                    notAssigned: assignRes.data?.notAssigned || []
                });

                setVerificationData(verificationRes.data || []);
                setMocReferences(mocRes.data || []);

            } catch (err) {
                console.error("Data loading error:", err);
            }

            setLoading(false);
        };

        load();
    }, [hazopId]);



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
                flexDirection: "column"
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
                        style={{
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            padding: "8px 16px",
                            borderRadius: 4,
                            border: "none",
                            cursor: "pointer"
                        }}>
                        Close
                    </button>

                    <div>
                        <button
                            onClick={() =>
                                generateHazopExcel({
                                    hazop: hazop,
                                    team: team,
                                    nodes: nodes, // Full details for Sheet 3
                                    registrationNodes: registrationNodes, // <--- ADD THIS for Sheet 2 (Index)
                                    nodeDetailsState: nodeDetails,
                                    allRecommendations: allRecommendations,
                                    mocReferences: mocReferences,
                                    verificationData: verificationData,
                                    assignData: assignData,
                                    hazopId: hazopId
                                })
                            }
                            style={{
                                backgroundColor: "#28a745",
                                color: "#fff",
                                padding: "8px 16px",
                                borderRadius: 4,
                                border: "none",
                                cursor: "pointer",
                                marginRight: 10
                            }}
                        >
                            Download Excel
                        </button>

                        <button
                            onClick={() =>
                                // ✅ FIXED: Pass a single object with all properties
                                generateHazopPdf({
                                    hazop: hazop,
                                    team: team,
                                    nodes: nodes,
                                    nodeDetails: nodeDetails,
                                    nodeDetailsState: nodeDetails, // Map this correctly based on generator expectation
                                    nodeRecommendations: nodeRecommendations,
                                    allRecommendations: allRecommendations,
                                    verificationData: verificationData,
                                    mocReferences: mocReferences,
                                    assignData: assignData,
                                    downloadDate: downloadDate,
                                    hazopId: hazopId
                                })
                            }
                            style={{
                                backgroundColor: "#28a745",
                                color: "#fff",
                                padding: "8px 16px",
                                borderRadius: 4,
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            Download PDF
                        </button>
                    </div>
                </div>


                {/* PDF VIEWER */}
                <div style={{ flex: 1, backgroundColor: "#525659" }}>
                    {loading ? (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : registrationNodes.length > 0 ? (
                        <PDFViewer
                            key={`${hazopId}-${downloadDate}`}   // ✅ IMPORTANT FIX
                            width="100%"
                            height="100%"
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
                            />
                        </PDFViewer>
                    ) : (
                        <div style={{ color: "white", textAlign: "center", marginTop: 100 }}>
                            No registration nodes found.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default HazopReportPage;
