import React from "react";
import { Document, Page, Text, View, Link } from "@react-pdf/renderer";

import { formatDate, getColumnWidth, getFontSize, getRiskColor } from "../CommonUI/CommonUI";
import styles from "./pdfStyles";
import Header from "./Header";
import Footer from "./Footer";



const columnWidths = {
    generalParam: "6%",
    specificParam: "6%",
    guidWord: "6%",
    deviation: "16%",
    causes: "16%",
    consequences: "16%",
    existingControl: "14%",
    P_existing: "4%",
    S_existing: "4%",
    R_existing: "4%",
    additionalControl: "14%",
    P_additional: "4%",
    S_additional: "4%",
    R_additional: "4%"
};


const HazopPdfDocument = ({
    hazop = {},
    team = [],
    nodes = [],
    registrationNodes = [],
    nodeDetailsState = {},
    mocReferences = [],
    allRecommendations = [],
    verificationData = [],
    assignData = { rejected: [], accepted: [], assigned: [], notAssigned: [] },
    downloadDate = new Date().toLocaleString(),
}) => {

    return (
        <Document>
            {/* Page 1: HAZOP Info + Team */}
            <Page size="A4" style={styles.page}>
                <Header hazop={hazop} />

                {/* Hazop Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hazop Details</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Title</Text>
                            <Text style={styles.infoValue}>{hazop?.hazopTitle || '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Site</Text>
                            <Text style={styles.infoValue}>{hazop?.site || '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Department</Text>
                            <Text style={styles.infoValue}>{hazop?.department || '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Revision</Text>
                            <Text style={styles.infoValue}>{hazop?.hazopRevisionNo || '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Hazop Start Date</Text>
                            <Text style={styles.infoValue}>{formatDate(hazop?.hazopCreationDate || '-')}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Completion Status</Text>
                            <Text style={styles.infoValue}>{hazop?.completionStatus ? 'Completed' : 'Pending'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Created By</Text>
                            <Text style={styles.infoValue}>{hazop?.createdBy || '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Completed / Approved By</Text>
                            <Text style={styles.infoValue}>{hazop?.verificationemployeeName || '-'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Description</Text>
                            <Text style={styles.infoValue}>{hazop?.description || '-'}</Text>
                        </View>
                    </View>
                </View>
                {mocReferences.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>MOC References</Text>
                        {mocReferences.map((moc, index) => (
                            <View key={index} style={{ marginBottom: 10, padding: 10, border: '1pt solid #ddd', borderRadius: 4 }}>
                                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                                    <Text style={{ flex: 1, fontSize: 10, fontWeight: 'bold' }}>MOC No:</Text>
                                    <Text style={{ flex: 2, fontSize: 10 }}>{moc.mocNo || '-'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                                    <Text style={{ flex: 1, fontSize: 10, fontWeight: 'bold' }}>MOC Title:</Text>
                                    <Text style={{ flex: 2, fontSize: 10 }}>{moc.mocTitle || '-'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                                    <Text style={{ flex: 1, fontSize: 10, fontWeight: 'bold' }}>Plant:</Text>
                                    <Text style={{ flex: 2, fontSize: 10 }}>{moc.mocPlant || '-'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                                    <Text style={{ flex: 1, fontSize: 10, fontWeight: 'bold' }}>Department:</Text>
                                    <Text style={{ flex: 2, fontSize: 10 }}>{moc.mocDepartment || '-'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                                    <Text style={{ flex: 1, fontSize: 10, fontWeight: 'bold' }}>MOC Date:</Text>
                                    <Text style={{ flex: 2, fontSize: 10 }}>{moc.mocDate || '-'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                {/* HAZOP Team */}
                <View style={styles.section} wrap={true}>
                    <Text style={styles.sectionTitle}>HAZOP Team</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableRowHeader]}>
                            <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Name</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Department</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Email</Text></View>
                        </View>
                        {team?.map((m, i) => (
                            <View key={i} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowEven : {}]}>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{m?.firstName || ''} {m?.middleName || ''} {m?.lastName || ''}</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{m?.dimension3 || '-'}</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{m?.emailId || '-'}</Text></View>
                            </View>
                        ))}
                    </View>
                </View>
                <Footer downloadDate={downloadDate} />
            </Page>


            <Page size="A4" style={styles.page}>
                <Header hazop={hazop} />
                <Text style={styles.sectionTitle}>Index of Hazop Nodes</Text>

                <View style={{ marginTop: 10 }}>
                    {/* Table Header */}
                    <View style={[styles.indexRow, { backgroundColor: '#275D8D', paddingVertical: 4 }]}>
                        <Text style={[styles.indexCol, { width: '20%', fontWeight: 'bold' }]}>Node No.</Text>
                        <Text style={[styles.indexCol, { width: '60%', fontWeight: 'bold' }]}>Title</Text>
                        {/* <Text style={[styles.indexCol, { width: '20%', fontWeight: 'bold', textAlign: 'right' }]}>
                            Page
                        </Text> */}
                    </View>

                    {/* Table Body */}
                    {nodes?.map((node, idx) => {
                        console.log(node);  // Log to inspect the data
                        return (
                            <View
                                key={node.id}
                                style={[
                                    styles.indexRow,
                                    { borderBottomWidth: 0.5, borderBottomColor: '#ccc', paddingVertical: 4 },
                                ]}
                            >
                                {/* Node Number Column */}
                                <Text style={[styles.indexCol, { width: '20%' }]}>
                                    Node {node.nodeNumber || '-'}
                                </Text>

                                {/* Design Intent as Link */}
                                <Link
                                    src={`#node-${node.id}`}
                                    style={[styles.indexCol, { width: '80%', color: '#007bff', textDecoration: 'underline' }]}
                                >
                                    {node.designIntent || '-'}
                                </Link>
                            </View>
                        );
                    })}

                </View>

                <Footer downloadDate={downloadDate} />
            </Page>

            {/* Page 2: Node Overview */}
            <Page size="A4" style={styles.page}>
                <Header hazop={hazop} />
                <Text style={styles.sectionTitle}>Hazop Nodes</Text>
                {registrationNodes?.map((node) => (
                    <View key={`reg-${node.id}`} style={styles.nodeContainer} wrap={false}>
                        <View style={[styles.nodeHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                            <Text style={{ color: '#FFFFFF' }}>{node.designIntent || '-'} - {node.nodeNumber || '-'}</Text>
                            <Text>Registration Date: {formatDate(node?.registrationDate) || '-'}</Text>
                        </View>

                        <View style={styles.nodeBody}>
                            {[
                                { label: 'Design Intent', value: node?.designIntent },
                                { label: 'P&ID Revision', value: node?.pIdRevision },
                                { label: 'SOP No.', value: node?.sopNo },
                                { label: 'SOP Date', value: formatDate(node?.sopDate) },
                                { label: 'Creation Date', value: formatDate(node?.creationDate) },
                                { label: 'Completion Date', value: formatDate(node?.completionDate) },
                                { label: 'Equipment', value: node?.equipment },
                                { label: 'Controls', value: node?.controls },
                                { label: 'Temperature', value: node?.temprature }, // note spelling matches API
                                { label: 'Pressure', value: node?.pressure },
                                { label: 'Quantity / Flow Rate', value: node?.quantityFlowRate },
                                { label: 'Chemical & Utilities', value: node?.chemicalAndUtilities },
                            ].map((item, idx) => (
                                <View key={idx} style={styles.nodeField}>
                                    <Text style={styles.nodeLabel}>{item.label}:</Text>
                                    <Text style={styles.nodeValue}>{item.value || '-'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                <Footer downloadDate={downloadDate} />
            </Page>


            {/* Pages 4+: Node Details + Recommendations */}
            {nodes?.length > 0 ? (
                nodes.map((node) => {
                    const details = nodeDetailsState[node.nodeInfo?.id] || [];
                    return (
                        <Page key={node.id} size="A4" orientation="landscape" style={styles.page}>
                            {/* Node Header */}
                            <View style={styles.nodeHeader}>
                                <Text style={styles.sectionTitle}>
                                    Node {node.nodeInfo?.nodeNumber}: {node.designIntent || "-"}
                                </Text>
                                <Text>
                                    Status: {node.nodeInfo?.completionStatus ? "Completed" : "Pending"}
                                </Text>
                                <Text>
                                    Registration Date: {formatDate(node.nodeInfo?.registrationDate || '-')}
                                </Text>
                            </View>

                            {/* Node Details */}
                            {details.length > 0 ? (
                                details.map((detail, index) => {
                                    const recs = detail.recommendations || [];
                                    return (
                                        <View key={index} style={styles.detailCard}>
                                            <Text style={styles.sectionTitle}>
                                                Discussion {index + 1}: {detail.designIntent || "-"}
                                            </Text>

                                            {/* Basic Parameters Table */}
                                            <View style={styles.table}>
                                                <View style={{ ...styles.tableRow, ...styles.tableRowHeader }}>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.generalParam }}>
                                                        <Text style={styles.tableCellHeader}>General Param</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.specificParam }}>
                                                        <Text style={styles.tableCellHeader}>Specific Param</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.guidWord }}>
                                                        <Text style={styles.tableCellHeader}>Guid Word</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.deviation }}>
                                                        <Text style={styles.tableCellHeader}>Deviation</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.causes }}>
                                                        <Text style={styles.tableCellHeader}>Causes</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.consequences }}>
                                                        <Text style={styles.tableCellHeader}>Consequences</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.existingControl }}>
                                                        <Text style={styles.tableCellHeader}>Existing Control</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.P_existing }}>
                                                        <Text style={styles.tableCellHeader}>P</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.S_existing }}>
                                                        <Text style={styles.tableCellHeader}>S</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.R_existing }}>
                                                        <Text style={styles.tableCellHeader}>R</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.additionalControl }}>
                                                        <Text style={styles.tableCellHeader}>Additional Control</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.P_additional }}>
                                                        <Text style={styles.tableCellHeader}>P</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.S_additional }}>
                                                        <Text style={styles.tableCellHeader}>S</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.R_additional }}>
                                                        <Text style={styles.tableCellHeader}>R</Text>
                                                    </View>
                                                </View>



                                                <View style={styles.tableRow}>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.generalParam }}><Text style={styles.tableCell}>{detail.generalParameter || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.specificParam }}><Text style={styles.tableCell}>{detail.specificParameter || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.guidWord }}><Text style={styles.tableCell}>{detail.guidWord || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.deviation }}><Text style={styles.tableCell}>{detail.deviation || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.causes }}><Text style={styles.tableCell}>{detail.causes || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.consequences }}><Text style={styles.tableCell}>{detail.consequences || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.existingControl }}><Text style={styles.tableCell}>{detail.existineControl || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.P_existing }}><Text style={styles.tableCell}>{detail.existineProbability || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.S_existing }}><Text style={styles.tableCell}>{detail.existingSeverity || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.R_existing, backgroundColor: getRiskColor(detail.riskRating) }}><Text style={styles.tableCell}>{detail.riskRating || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.additionalControl }}><Text style={styles.tableCell}>{detail.additionalControl || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.P_additional }}><Text style={styles.tableCell}>{detail.additionalProbability || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.S_additional }}><Text style={styles.tableCell}>{detail.additionalSeverity || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.R_additional, backgroundColor: getRiskColor(detail.additionalRiskRating) }}><Text style={styles.tableCell}>{detail.additionalRiskRating || "-"}</Text></View>
                                                </View>

                                            </View>

                                            {/* Recommendations */}
                                            <Text style={{ marginTop: 5, fontWeight: "bold" }}>Recommendations:</Text>
                                            {recs.length > 0 ? (
                                                <View style={styles.table}>
                                                    <View style={{ ...styles.tableRow, ...styles.tableRowHeader }} wrap={false}>
                                                        <View style={{ ...styles.tableCol, padding: 3 }}>
                                                            <Text style={styles.tableCellHeader}>Recommendation</Text>
                                                        </View>
                                                        <View style={{ ...styles.tableCol, padding: 3 }}>
                                                            <Text style={styles.tableCellHeader}>Department</Text>
                                                        </View>
                                                        <View style={{ ...styles.tableCol, padding: 3 }}>
                                                            <Text style={styles.tableCellHeader}>Remark</Text>
                                                        </View>
                                                        <View style={{ ...styles.tableCol, padding: 3 }}>
                                                            <Text style={styles.tableCellHeader}>Completion Date</Text>
                                                        </View>
                                                        <View style={{ ...styles.tableCol, padding: 3 }}>
                                                            <Text style={styles.tableCellHeader}>Status</Text>
                                                        </View>
                                                    </View>


                                                    {recs.map((r, i) => (
                                                        <View key={i} style={styles.tableRow}>
                                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{r.recommendation || "-"}</Text></View>
                                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{r.department || "-"}</Text></View>
                                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{r.remarkbyManagement || "-"}</Text></View>
                                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDate(r.completionDate)}</Text></View>
                                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{r.completionStatus ? "Completed" : "Pending"}</Text></View>
                                                        </View>
                                                    ))}
                                                </View>
                                            ) : (
                                                <Text>No recommendations available.</Text>
                                            )}
                                        </View>
                                    );
                                })
                            ) : (
                                <Text>No details available for this node.</Text>
                            )}
                        </Page>
                    );
                })
            ) : (
                <Page>
                    <Text>No nodes available.</Text>
                </Page>
            )}


            {/* Page 3: All Recommendations */}
            <Page size="A4" style={styles.page}>
                <Header hazop={hazop} />

                <Text style={styles.sectionTitle}>All Recommendations for HAZOP</Text>

                {allRecommendations?.length > 0 ? (
                    allRecommendations.map((rec, idx) => (
                        <View key={idx} style={styles.card} wrap={false}>
                            <Text style={styles.cardTitle}>Recommendation {idx + 1}</Text>


                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Recommendation:</Text>
                                <Text style={styles.cardValue}>{rec.recommendation || '-'}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Remark:</Text>
                                <Text style={styles.cardValue}>{rec.remarkbyManagement || '-'}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Responsibility:</Text>
                                <Text style={styles.cardValue}>{rec.responsibility || '-'}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Department:</Text>
                                <Text style={styles.cardValue}>{rec.department || '-'}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Completion Status:</Text>
                                <Text style={[styles.cardValue, rec.completionStatus ? styles.completed : styles.pending]}>
                                    {rec.completionStatus ? "Completed" : "Pending"}
                                </Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Completion Date:</Text>
                                <Text style={styles.cardValue}>{rec.completionDate ? formatDate(rec.completionDate) : '-'}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Send for Verification:</Text>
                                <Text style={styles.cardValue}>{rec.sendForVerification ? "Yes" : "No"}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Verification Action:</Text>
                                <Text style={styles.cardValue}>{rec.sendForVerificationAction ? "Action Taken" : "No Action"}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Verification Status:</Text>
                                <Text style={[styles.cardValue, rec.sendForVerificationActionStatus ? styles.completed : styles.pending]}>
                                    {rec.sendForVerificationActionStatus ? "Approved" : "Rejected"}
                                </Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Verified By:</Text>
                                <Text style={styles.cardValue}>{rec.verificationResponsibleEmployeeName || '-'}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Verifier Email:</Text>
                                <Text style={styles.cardValue}>{rec.verificationResponsibleEmployeeEmail || '-'}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Verification Date:</Text>
                                <Text style={styles.cardValue}>{rec.verificationDate ? formatDate(rec.verificationDate) : '-'}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text>No recommendations found for this HAZOP.</Text>
                )}

                <Footer downloadDate={downloadDate} />
            </Page>

            {/* Last Page: Assignment Summary */}
            <Page size="A4" style={styles.page}>
                <Header hazop={hazop} />
                <Text style={styles.sectionTitle}>Assignment Summary</Text>

                {["notAssigned", "assigned", "accepted", "rejected"].map((key) => {
                    const data = assignData?.[key] || [];
                    if (!data.length) return null;

                    return (
                        <View key={key} style={{ marginBottom: 15 }}>
                            <Text style={styles.assignmentHeader}>{key.toUpperCase()}</Text>

                            {data.map((item, idx) => {
                                const rec = item.javaHazopNodeRecommendation || item;

                                return (
                                    <View key={idx} style={styles.assignmentCard} wrap={false}>
                                        <Text style={styles.cardTitle}>Recommendation {idx + 1}</Text>

                                        <View style={styles.cardRow}>
                                            <Text style={styles.cardLabel}>Recommendation:</Text>
                                            <Text style={styles.cardValue}>{rec.recommendation || '-'}</Text>
                                        </View>

                                        <View style={styles.cardRow}>
                                            <Text style={styles.cardLabel}>Remark:</Text>
                                            <Text style={styles.cardValue}>{rec.remarkbyManagement || '-'}</Text>
                                        </View>

                                        <View style={styles.cardRow}>
                                            <Text style={styles.cardLabel}>Assigned To:</Text>
                                            <Text style={styles.cardValue}>{item.assignToEmpCode || item.acceptedByEmployeeName || '-'}</Text>
                                        </View>

                                        <View style={styles.cardRow}>
                                            <Text style={styles.cardLabel}>Assigned Date:</Text>
                                            <Text style={styles.cardValue}>{formatDate(item.assignWorkDate) || '-'}</Text>
                                        </View>

                                        <View style={styles.cardRow}>
                                            <Text style={styles.cardLabel}>Completion Status:</Text>
                                            <Text style={[styles.cardValue, item.completionStatus ? styles.completed : styles.pending]}>
                                                {item.completionStatus ? "Completed" : "Pending"}
                                            </Text>
                                        </View>

                                        <View style={styles.cardRow}>
                                            <Text style={styles.cardLabel}>Acceptance Status:</Text>
                                            <Text style={styles.cardValue}>
                                                {item.assignworkAcceptance
                                                    ? "Accepted"
                                                    : item.assignWorkSendForAcceptance
                                                        ? "Waiting for Acceptance"
                                                        : "Not Sent"}
                                            </Text>
                                        </View>

                                    </View>
                                );
                            })}
                        </View>
                    );
                })}

                <Footer downloadDate={downloadDate} />
            </Page>

            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>Confirmation Summary</Text>

                {(verificationData || []).length === 0 ? (
                    <Text style={{ fontSize: 10, marginBottom: 10 }}>No verification records available</Text>
                ) : (
                    (verificationData || []).map((item, i) => (
                        <View key={i} style={styles.verificationCard} wrap={false}>
                            <Text style={styles.cardTitle}>Recommendation {i + 1}</Text>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Recommendation:</Text>
                                <Text style={styles.cardValue}>{item.recommendation || '-'}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Remark by Management:</Text>
                                <Text style={styles.cardValue}>{item.remarkbyManagement || '-'}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Completion Status:</Text>
                                <Text style={[styles.cardValue, item.completionStatus ? styles.completed : styles.pending]}>
                                    {item.completionStatus ? 'Completed' : 'Pending'}
                                </Text>
                            </View>


                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Verification Action:</Text>
                                <Text style={[styles.cardValue, item.sendForVerificationAction ? styles.actionTaken : {}]}>
                                    {item.sendForVerificationAction ? 'Approved' : 'Rejected'}
                                </Text>
                            </View>
                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Verified By:</Text>
                                <Text style={styles.cardValue}>{item.verificationResponsibleEmployeeName || '-'}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Email:</Text>
                                <Text style={styles.cardValue}>{item.verificationResponsibleEmployeeEmail || '-'}</Text>
                            </View>

                            <View style={styles.cardRow}>
                                <Text style={styles.cardLabel}>Verification Date:</Text>
                                <Text style={styles.cardValue}>{item.verificationDate ? formatDate(item.verificationDate) : '-'}</Text>
                            </View>
                        </View>
                    ))
                )}

                <Footer downloadDate={downloadDate} />
            </Page>

        </Document>
    );
};

export default HazopPdfDocument;