import React, { useEffect, useState } from "react";
import axios from "axios";
import { PDFViewer, Document, Page, View, Text, Image, pdf } from "@react-pdf/renderer";
import pdfStyles from "./pdfStyles";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const HazopReportPage = ({ hazopId, onClose }) => {
    const [hazop, setHazop] = useState(null);
    const [team, setTeam] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [nodeDetails, setNodeDetails] = useState({});
    const downloadDate = new Date().toLocaleString();
    const [nodeRecommendations, setNodeRecommendations] = useState({});

    useEffect(() => {
        // Fetch HAZOP info
        axios.get(`http://localhost:5559/api/hazopRegistration/by-id?hazopId=${hazopId}`)
            .then(res => setHazop(res.data));

        // Fetch HAZOP team
        axios.get(`http://localhost:5559/api/hazopTeam/teamByHazop/${hazopId}?status=false`)
            .then(res => setTeam(res.data));

        // Fetch nodes and node details
        axios.get(`http://localhost:5559/api/hazopNode/by-registration-status?registrationId=${hazopId}&status=true`)
            .then(async (res) => {
                const nodesData = res.data;
                setNodes(nodesData);

                const detailsPromises = nodesData.map(node =>
                    axios.get(`http://localhost:5559/api/hazopNodeDetail/node/${node.id}`)
                        .then(r => ({ nodeId: node.id, details: Array.isArray(r.data) ? r.data : [] }))
                        .catch(() => ({ nodeId: node.id, details: [] }))
                );

                const detailsResults = await Promise.all(detailsPromises);
                const detailsMap = {};
                detailsResults.forEach(d => detailsMap[d.nodeId] = d.details);
                setNodeDetails(detailsMap);
            });
    }, [hazopId]);

    // Separate useEffect to fetch recommendations once nodes are loaded
    useEffect(() => {
        if (nodes.length === 0) return;

        const recommendationPromises = nodes.map(node =>
            axios.get(`http://localhost:5559/api/nodeRecommendation/getByNode/${node.id}`)
                .then(res => ({ nodeId: node.id, recommendations: Array.isArray(res.data) ? res.data : [] }))
                .catch(() => ({ nodeId: node.id, recommendations: [] }))
        );

        Promise.all(recommendationPromises).then(results => {
            const recMap = {};
            results.forEach(r => recMap[r.nodeId] = r.recommendations);
            setNodeRecommendations(recMap);
        });
    }, [nodes]);

    const downloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("HAZOP Report");

        // 1. HAZOP Info
        worksheet.addRow(["HAZOP Info"]);
        worksheet.addRow(["Site", hazop.site]);
        worksheet.addRow(["Department", hazop.department]);
        worksheet.addRow(["Description", hazop.description]);
        worksheet.addRow([]); // empty row

        // 2. HAZOP Team (if exists)
        if (team.length > 0) {
            worksheet.addRow(["HAZOP Team"]);
            worksheet.addRow(["Name", "Employee Code", "Email", "Role"]);
            team.forEach(member => {
                worksheet.addRow([
                    `${member.firstName || ""} ${member.middleName || ""} ${member.lastName || ""}`.trim(),
                    member.empCode,
                    member.emailId,
                    member.role || "-"
                ]);
            });
            worksheet.addRow([]);
        }

        // 3. All Nodes Combined
        if (nodes.length > 0) {
            worksheet.addRow(["All Nodes"]);
            nodes.forEach(node => {
                worksheet.addRow([`${node.nodeTitle || "NA"}: ${node.nodeNumber || "-"}`]);
                const nodeRow = [
                    `Design Intent: ${node.designIntent}`,
                    `Controls: ${node.controls}`,
                    `Temp/Pressure: ${node.temprature} / ${node.pressure}`,
                    `SOP: ${node.sopNo} (${node.sopDate || "-"})`,
                    `Completed: ${node.completionStatus ? "Yes" : "No"}`
                ];
                worksheet.addRow(nodeRow);
                worksheet.addRow([]);
            });
        }

        // 4. All Node Details Combined
        if (Object.keys(nodeDetails).length > 0) {
            worksheet.addRow(["All Node Details"]);
            nodes.forEach(node => {
                const details = nodeDetails[node.id] || [];
                details.forEach(detail => {
                    Object.entries(detail).forEach(([key, val]) => {
                        worksheet.addRow([key, val]);
                    });
                    worksheet.addRow([]);
                });
            });
        }

        // 5. Node-specific Details
        nodes.forEach(node => {
            if (nodeDetails[node.id]?.length > 0) {
                worksheet.addRow([`Node ${node.nodeTitle || "N/A"}: ${node.nodeNumber}`]);
                worksheet.addRow([
                    `Design Intent: ${node.designIntent}`,
                    `Controls: ${node.controls}`,
                    `Temp/Pressure: ${node.temprature} / ${node.pressure}`,
                    `SOP: ${node.sopNo} (${node.sopDate || "-"})`,
                    `Completed: ${node.completionStatus ? "Yes" : "No"}`
                ]);

                nodeDetails[node.id].forEach(detail => {
                    Object.entries(detail).forEach(([key, val]) => {
                        worksheet.addRow([key, val]);
                    });
                });
                worksheet.addRow([]);
            }
        });

        // Auto-adjust column widths
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 10;
                if (cellLength > maxLength) maxLength = cellLength;
            });
            column.width = maxLength + 5; // some padding
        });

        // Save Excel
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `HAZOP_Report_${hazopId}.xlsx`);
    };
    if (!hazop) return <div>Loading...</div>;

    const MyDocument = (
        <Document>
            <Page size="A4" style={pdfStyles.page} wrap>
                {/* Header */}
                <View style={pdfStyles.header} fixed>
                    {/* Left: Logo */}
                    <Image src="/logo.png" style={pdfStyles.logo} />

                    {/* Center: Report Title */}
                    <View style={pdfStyles.reportTitleCenter}>
                        <Text style={pdfStyles.reportTitle}>ALKYL AMINES CHEMICALS LIMITED</Text>
                    </View>

                    {/* Right: Side Title & Date */}
                    <View style={pdfStyles.reportSideContainer}>
                        <Text style={pdfStyles.reportSideTitle}>HAZOP Report</Text>
                        <Text style={pdfStyles.creationDate}>Created on: {hazop.hazopDate}</Text>
                    </View>
                </View>


                {/* HAZOP Info */}
                <View style={pdfStyles.section}>
                    <View style={pdfStyles.infoRow}>
                        <Text><Text style={pdfStyles.label}>Site:</Text> {hazop.site || '-'}</Text>
                    </View>
                    <View style={pdfStyles.infoRow}>
                        <Text><Text style={pdfStyles.label}>Department:</Text> {hazop.department || "-"}</Text>
                    </View>
                    <View style={pdfStyles.infoRow}>
                        <Text><Text style={pdfStyles.label}>Hazop Revision No:</Text> {hazop.hazopRevisionNo || '-'}</Text>
                    </View>
                    <View style={pdfStyles.infoRow}>
                        <Text><Text style={pdfStyles.label}>Created By:</Text> {hazop.createdBy || '-'}</Text>
                    </View>
                    <View style={pdfStyles.infoRow}>
                        <Text><Text style={pdfStyles.label}>Created By Email:</Text> {hazop.createdByEmail || "-"}</Text>
                    </View>
                    <View style={pdfStyles.infoRow}>
                        <Text><Text style={pdfStyles.label}>Employee Code:</Text> {hazop.empCode || '-'}</Text>
                    </View>
                    <View style={pdfStyles.description}>
                        <Text><Text style={pdfStyles.label}>Description:</Text> {hazop.description || '-'}</Text>
                    </View>
                </View>


                {/* HAZOP Team */}
                {team.length > 0 && (
                    <View style={pdfStyles.section}>
                        <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4 }}>HAZOP Team</Text>
                        <View style={pdfStyles.table}>
                            <View style={pdfStyles.tableRow}>
                                <Text style={pdfStyles.tableColHeader}>Name</Text>
                                <Text style={pdfStyles.tableColHeader}>Employee Code</Text>
                                <Text style={pdfStyles.tableColHeader}>Email</Text>
                                <Text style={pdfStyles.tableColHeader}>Role</Text>
                            </View>
                            {team.map((member, idx) => (
                                <View key={member.id} style={[pdfStyles.tableRow, idx % 2 === 0 ? pdfStyles.alternateRow : null]}>
                                    <Text style={pdfStyles.tableCol}>{`${member.firstName || ""} ${member.middleName || ""} ${member.lastName || ""}`.trim()}</Text>
                                    <Text style={pdfStyles.tableCol}>{member.empCode}</Text>
                                    <Text style={pdfStyles.tableCol}>{member.emailId}</Text>
                                    <Text style={pdfStyles.tableCol}>{member.role || "-"}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* All Nodes Combined */}

                {nodes.length > 0 && (
                    <View break style={pdfStyles.section}>
                        {/* Heading once */}
                        <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4 }}>All Nodes</Text>
                        {nodes.map(node => (
                            <View key={node.id} style={pdfStyles.nodeCard}>

                                <Text style={pdfStyles.nodeTitle}>{node.nodeTitle || "NA"}: {node.nodeNumber || "-"}</Text>

                                {/* Row 1: Design Intent + Controls */}
                                <View style={pdfStyles.nodeInfoRow}>
                                    <View style={pdfStyles.nodeInfoColumn}>
                                        <Text style={pdfStyles.nodeInfoLabel}>Design Intent:</Text>
                                        <Text style={pdfStyles.nodeInfoValue}>{node.designIntent}</Text>
                                    </View>
                                    <View style={pdfStyles.nodeInfoColumn}>
                                        <Text style={pdfStyles.nodeInfoLabel}>Controls:</Text>
                                        <Text style={pdfStyles.nodeInfoValue}>{node.controls}</Text>
                                    </View>
                                </View>

                                {/* Row 2: Temp/Pressure + SOP */}
                                <View style={pdfStyles.nodeInfoRow}>
                                    <View style={pdfStyles.nodeInfoColumn}>
                                        <Text style={pdfStyles.nodeInfoLabel}>Temp/Pressure:</Text>
                                        <Text style={pdfStyles.nodeInfoValue}>{node.temprature} / {node.pressure}</Text>
                                    </View>
                                    <View style={pdfStyles.nodeInfoColumn}>
                                        <Text style={pdfStyles.nodeInfoLabel}>SOP:</Text>
                                        <Text style={pdfStyles.nodeInfoValue}>{node.sopNo} ({node.sopDate || "-"})</Text>
                                    </View>
                                </View>

                                {/* Row 3: Completed + (optional empty) */}
                                <View style={pdfStyles.nodeInfoRow}>
                                    <View style={pdfStyles.nodeInfoColumn}>
                                        <Text style={pdfStyles.nodeInfoLabel}>Completed:</Text>
                                        <Text style={pdfStyles.nodeInfoValue}>  {node.completionStatus ? "Yes" : "No"}</Text>
                                    </View>
                                    <View style={pdfStyles.nodeInfoColumn}>{/* Empty column for alignment */}</View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                {/* All Node Details Combined */}
                {/* {Object.keys(nodeDetails).length > 0 && (
                    <View style={pdfStyles.allNodeDetailsContainer}>
                        <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 6 }}>All Node Details</Text>
                        {nodes.map(node =>
                            nodeDetails[node.id]?.map((detail, idx) => (
                                <View key={`${node.id}-${idx}`} style={pdfStyles.allNodeDetailCard}>
                                    {Object.entries(detail).map(([key, val], i) => {
                                        const isLong = String(val).length > 50; // threshold for paragraph
                                        return isLong ? (
                                            <View key={i} style={pdfStyles.allNodeDetailRowFull}>
                                                <Text style={pdfStyles.allNodeDetailLabel}>{key}:</Text>
                                                <Text style={pdfStyles.allNodeDetailValueFull}>{val}</Text>
                                            </View>
                                        ) : (
                                            <View key={i} style={pdfStyles.allNodeDetailRow}>
                                                <Text style={pdfStyles.allNodeDetailLabel}>{key}:</Text>
                                                <Text style={pdfStyles.allNodeDetailValue}>{val}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            ))
                        )}

                    </View>
                )} */}


                {/* Node-specific section: only for nodes with details */}
                {nodes.filter(node =>
                    (nodeDetails[node.id]?.length > 0) || (nodeRecommendations[node.id]?.length > 0)
                ).map(node => (
                    <View break key={node.id} style={pdfStyles.section}>
                        {/* Node Info */}
                        <Text style={pdfStyles.nodeTitle}>Node {node.nodeTitle || "N/A"}: {node.nodeNumber}</Text>

                        <View style={pdfStyles.nodeInfoRow}>
                            <View style={pdfStyles.nodeInfoColumn}>
                                <Text style={pdfStyles.nodeInfoLabel}>Design Intent:</Text>
                                <Text style={pdfStyles.nodeInfoValue}>{node.designIntent}</Text>
                            </View>
                            <View style={pdfStyles.nodeInfoColumn}>
                                <Text style={pdfStyles.nodeInfoLabel}>Controls:</Text>
                                <Text style={pdfStyles.nodeInfoValue}>{node.controls}</Text>
                            </View>
                        </View>

                        <View style={pdfStyles.nodeInfoRow}>
                            <View style={pdfStyles.nodeInfoColumn}>
                                <Text style={pdfStyles.nodeInfoLabel}>Temp/Pressure:</Text>
                                <Text style={pdfStyles.nodeInfoValue}>{node.temprature} / {node.pressure}</Text>
                            </View>
                            <View style={pdfStyles.nodeInfoColumn}>
                                <Text style={pdfStyles.nodeInfoLabel}>SOP:</Text>
                                <Text style={pdfStyles.nodeInfoValue}>{node.sopNo} ({node.sopDate || "-"})</Text>
                            </View>
                        </View>

                        <View style={pdfStyles.nodeInfoRow}>
                            <View style={pdfStyles.nodeInfoColumn}>
                                <Text style={pdfStyles.nodeInfoLabel}>Completed:</Text>
                                <Text style={pdfStyles.nodeInfoValue}>{node.completionStatus ? "Yes" : "No"}</Text>
                            </View>
                            <View style={pdfStyles.nodeInfoColumn}></View>
                        </View>

                        {/* Node Details */}
                        {nodeDetails[node.id]?.length > 0 && (
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Node Details of {node.nodeTitle || '-'}</Text>
                                {nodeDetails[node.id].map((detail, idx) => (
                                    <View key={idx} style={pdfStyles.nodeDetailCard}>
                                        {Object.entries(detail).map(([key, val], i) => {
                                            const isLong = String(val).length > 50;
                                            return isLong ? (
                                                <View key={i} style={pdfStyles.nodeDetailRowFull}>
                                                    <Text style={pdfStyles.nodeDetailLabel}>{key}:</Text>
                                                    <Text style={pdfStyles.nodeDetailValueFull}>{val}</Text>
                                                </View>
                                            ) : (
                                                <View key={i} style={pdfStyles.nodeDetailRow}>
                                                    <Text style={pdfStyles.nodeDetailLabel}>{key}:</Text>
                                                    <Text style={pdfStyles.nodeDetailValue}>{val}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Node Recommendations */}
                        {nodeRecommendations[node.id]?.length > 0 && (
                            <View style={{ marginTop: 12 }}>
                                <Text style={{ fontWeight: "bold", marginBottom: 6, fontSize: 12, color: "#1565c0" }}>
                                    Recommendations for Node {node.nodeTitle || '-'}: {node.nodeNumber || '-'}
                                </Text>
                                <View style={pdfStyles.table}>
                                    <View style={pdfStyles.tableRow}>
                                        <Text style={pdfStyles.tableColHeader}>Recommendation</Text>
                                        <Text style={pdfStyles.tableColHeader}>Remark by Management</Text>
                                        <Text style={pdfStyles.tableColHeader}>Responsibility</Text>
                                        <Text style={pdfStyles.tableColHeader}>Verification Responsible Employee</Text>
                                        <Text style={pdfStyles.tableColHeader}>Completion Status</Text>
                                    </View>
                                    {nodeRecommendations[node.id].map((rec, idx) => (
                                        <View key={rec.id} style={[pdfStyles.tableRow, idx % 2 === 0 ? pdfStyles.alternateRow : null]}>
                                            <Text style={pdfStyles.tableCol}>{rec.recommendation || '-'}</Text>
                                            <Text style={pdfStyles.tableCol}>{rec.remarkbyManagement || '-'}</Text>
                                            <Text style={pdfStyles.tableCol}>{rec.responsibility || '-'}</Text>
                                            <Text style={pdfStyles.tableCol}>{rec.verificationResponsibleEmpCode || '-'}</Text>
                                            <Text style={pdfStyles.tableCol}>{rec.completionStatus ? 'Yes' : 'No'}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                ))}

                {/* Node Recommendations */}
                {nodes.map(node => nodeRecommendations[node.id]?.length > 0 && (
                    <View break key={`rec-${node.id}`} style={pdfStyles.section}>
                        <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 6 }}>
                            Recommendations for Node {node.nodeTitle || '-'}: {node.nodeNumber || '-'}
                        </Text>
                        <View style={pdfStyles.table}>
                            <View style={pdfStyles.tableRow}>
                                <Text style={pdfStyles.tableColHeader}>Recommendation</Text>
                                <Text style={pdfStyles.tableColHeader}>Remark by Management</Text>
                                <Text style={pdfStyles.tableColHeader}>Responsibility</Text>
                                <Text style={pdfStyles.tableColHeader}>Verification Responsible Employee</Text>
                                <Text style={pdfStyles.tableColHeader}>Completion Status</Text>
                            </View>
                            {nodeRecommendations[node.id].map((rec, idx) => (
                                <View key={rec.id} style={[pdfStyles.tableRow, idx % 2 === 0 ? pdfStyles.alternateRow : null]}>
                                    <Text style={pdfStyles.tableCol}>{rec.recommendation || '-'}</Text>
                                    <Text style={pdfStyles.tableCol}>{rec.remarkbyManagement || '-'}</Text>
                                    <Text style={pdfStyles.tableCol}>{rec.responsibility || '-'}</Text>
                                    <Text style={pdfStyles.tableCol}>{rec.verificationResponsibleEmpCode || '-'}</Text>
                                    <Text style={pdfStyles.tableCol}>{rec.completionStatus ? 'Yes' : 'No'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Footer */}
                <View style={pdfStyles.footer} fixed>
                    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                    <Text>Download Date: {downloadDate}</Text>
                </View>
            </Page >
        </Document >
    );

    const downloadPDF = async () => {
        const blob = await pdf(MyDocument).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `HAZOP_Report_${hazopId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ width: "85%", height: "95%", background: "#fff", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: 10, borderBottom: "1px solid #ddd", backgroundColor: "#f5f5f5" }}>
                    <button onClick={onClose} style={{ cursor: "pointer", backgroundColor: "#dc3545", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 4 }}>Close</button>
                    <div>
                        <button onClick={downloadExcel} style={{ cursor: "pointer", backgroundColor: "#621290", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 4, marginRight: 5 }}>Download Excel</button>
                        <button onClick={downloadPDF} style={{ cursor: "pointer", backgroundColor: "#2E86AB", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 4, marginRight: 5 }}>Download PDF</button>
                    </div>
                </div>
                <PDFViewer width="100%" height="100%">{MyDocument}</PDFViewer>
            </div>
        </div>
    );
};

export default HazopReportPage;
