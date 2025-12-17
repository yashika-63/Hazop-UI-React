import React from "react";
import { Document, Page, Text, View, Link } from "@react-pdf/renderer";
import { formatDate, getRiskColor } from "../CommonUI/CommonUI";
import styles, { theme } from "./pdfStyles";
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
            {/* ==================================================================================
                                    PAGE 1: HAZOP INFO + TEAM
               ================================================================================== */}
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

                {/* MOC References */}
                {mocReferences.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>MOC References</Text>
                        {mocReferences.map((moc, index) => (
                            <View key={index} style={styles.card} wrap={false}>
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>MOC No:</Text>
                                    <Text style={styles.cardValue}>{moc.mocNo || '-'}</Text>
                                </View>
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>MOC Title:</Text>
                                    <Text style={styles.cardValue}>{moc.mocTitle || '-'}</Text>
                                </View>
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>Plant:</Text>
                                    <Text style={styles.cardValue}>{moc.mocPlant || '-'}</Text>
                                </View>
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>Department:</Text>
                                    <Text style={styles.cardValue}>{moc.mocDepartment || '-'}</Text>
                                </View>
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>MOC Date:</Text>
                                    <Text style={styles.cardValue}>{formatDate(moc.mocDate || '-')}</Text>
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
                            <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCellHeader}>Name</Text></View>
                            <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCellHeader}>Department</Text></View>
                            <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCellHeader}>Email</Text></View>
                        </View>
                        {team?.map((m, i) => (
                            <View key={i} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowEven : {}]}>
                                <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCell}>{m?.firstName || ''} {m?.middleName || ''} {m?.lastName || ''}</Text></View>
                                <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCell}>{m?.dimension1 || '-'}</Text></View>
                                <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCell}>{m?.emailId || '-'}</Text></View>
                            </View>
                        ))}
                    </View>
                </View>
                <Footer downloadDate={downloadDate} />
            </Page>


            {/* ==================================================================================
                                    PAGE 2: INDEX OF NODES
               ================================================================================== */}
            <Page size="A4" style={styles.page}>
                <Header hazop={hazop} />
                <Text style={styles.sectionTitle}>Index of Hazop Nodes</Text>

                <View style={{ marginTop: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                    {/* Table Header using updated Theme Styles */}
                    <View style={[styles.indexRow, styles.tableRowHeader, { paddingVertical: 6 }]}>
                        <Text style={[styles.indexCol, { width: '20%', fontWeight: 'bold', color: theme.white }]}>Node No.</Text>
                        <Text style={[styles.indexCol, { width: '80%', fontWeight: 'bold', color: theme.white }]}>Title</Text>
                    </View>

                    {/* Table Body */}
                    {registrationNodes?.map((registrationNode, idx) => {
                        return (
                            <View
                                key={registrationNode.id}
                                style={[
                                    styles.indexRow,
                                    idx % 2 !== 0 ? { backgroundColor: theme.bgLight } : {}
                                ]}
                            >
                                <Text style={[styles.indexCol, { width: '20%' }]}>
                                    Node {registrationNode.nodeNumber || '-'}
                                </Text>
                                <Link
                                    src={`#node-${registrationNode.id}`}
                                    style={[styles.indexCol, { width: '80%', color: theme.link, textDecoration: 'none' }]}
                                >
                                    {registrationNode.designIntent || '-'}
                                </Link>
                            </View>
                        );
                    })}
                </View>
                <Footer downloadDate={downloadDate} />
            </Page>

            {/* ==================================================================================
                                    PAGE 3: NODE OVERVIEW (SUMMARIES)
               ================================================================================== */}
            <Page size="A4" style={styles.page}>
                <Header hazop={hazop} />
                <Text style={styles.sectionTitle}>Hazop Nodes</Text>
                {registrationNodes?.map((node) => (
                    <View key={`reg-${node.id}`} style={styles.nodeContainer} wrap={false}>
                        <View style={styles.nodeHeader}>
                            <Text style={{ color: theme.white }}>{node.designIntent || '-'} - {node.nodeNumber || '-'}</Text>
                            <Text style={{ color: theme.white }}>Reg: {formatDate(node?.registrationDate) || '-'}</Text>
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
                                { label: 'Temperature', value: node?.temprature },
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


            {/* ==================================================================================
                                    PAGE 4+: MAIN WORKSHEETS
               ================================================================================== */}
            {nodes?.length > 0 ? (
                nodes.map((node) => {
                    const details = nodeDetailsState[node.nodeInfo?.id] || [];
                    return (
                        <Page key={node.id} size="A4" orientation="landscape" style={styles.page}>
                            <Header hazop={hazop} />
                            <View id={`node-${node.nodeInfo?.id}`} style={styles.nodeHeader}>
                                <View style={{ flexDirection: "row", width: "100%" }}>
                                    <View style={{ flex: 1, paddingRight: 8 }}>
                                        <Text style={{ fontWeight: "bold", fontSize: 10 }} wrap >
                                            Node {node.nodeInfo?.nodeNumber}: {node.designIntent || "-"}
                                        </Text>

                                        <Text style={{ fontSize: 9 }}>
                                            Status: {node.nodeInfo?.completionStatus ? "Completed" : "Pending"}
                                        </Text>
                                    </View>
                                    <View style={{ width: 130, alignItems: "flex-end" }}>
                                        <Text style={{ fontSize: 9 }} wrap={false} >
                                            Reg Date: {formatDate(node.nodeInfo?.registrationDate || "-")}
                                        </Text>
                                    </View>

                                </View>
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

                                            {/* --- BIG TABLE START --- */}
                                            <View style={styles.table}>
                                                <View style={[styles.tableRow, styles.tableRowHeader]}>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.generalParam }}><Text style={styles.tableCellHeader}>Gen Param</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.specificParam }}><Text style={styles.tableCellHeader}>Spec Param</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.guidWord }}><Text style={styles.tableCellHeader}>Guid Word</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.deviation }}><Text style={styles.tableCellHeader}>Deviation</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.causes }}><Text style={styles.tableCellHeader}>Causes</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.consequences }}><Text style={styles.tableCellHeader}>Consequences</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.existingControl }}><Text style={styles.tableCellHeader}>Existing Controls</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.P_existing }}><Text style={styles.tableCellHeader}>P</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.S_existing }}><Text style={styles.tableCellHeader}>S</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.R_existing }}><Text style={styles.tableCellHeader}>R</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.additionalControl }}><Text style={styles.tableCellHeader}>Additional Controls</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.P_additional }}><Text style={styles.tableCellHeader}>P</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.S_additional }}><Text style={styles.tableCellHeader}>S</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.R_additional }}><Text style={styles.tableCellHeader}>R</Text></View>
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

                                                    {/* Risk Color Logic */}
                                                    <View style={{ ...styles.tableCol, width: columnWidths.R_existing, backgroundColor: getRiskColor(detail.riskRating) }}>
                                                        <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>{detail.riskRating || "-"}</Text>
                                                    </View>

                                                    <View style={{ ...styles.tableCol, width: columnWidths.additionalControl }}><Text style={styles.tableCell}>{detail.additionalControl || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.P_additional }}><Text style={styles.tableCell}>{detail.additionalProbability || "-"}</Text></View>
                                                    <View style={{ ...styles.tableCol, width: columnWidths.S_additional }}><Text style={styles.tableCell}>{detail.additionalSeverity || "-"}</Text></View>

                                                    {/* Additional Risk Color Logic */}
                                                    <View style={{ ...styles.tableCol, width: columnWidths.R_additional, backgroundColor: getRiskColor(detail.additionalRiskRating) }}>
                                                        <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>{detail.additionalRiskRating || "-"}</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Sub-Table for Recommendations */}
                                            {recs.length > 0 && (
                                                <View style={{ marginTop: 5 }}>
                                                    <Text style={{ fontSize: 9, fontWeight: "bold", color: theme.secondary, marginBottom: 3 }}>Recommendations:</Text>
                                                    <View style={styles.table}>
                                                        <View style={[styles.tableRow, styles.tableRowHeader, { backgroundColor: theme.secondary }]} wrap={false}>
                                                            <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCellHeader}>Recommendation</Text></View>
                                                            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellHeader}>Department</Text></View>
                                                            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellHeader}>Remark</Text></View>
                                                            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellHeader}>Date</Text></View>
                                                            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Status</Text></View>
                                                        </View>
                                                        {recs.map((r, i) => (
                                                            <View key={i} style={styles.tableRow}>
                                                                <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCell}>{r.recommendation || "-"}</Text></View>
                                                                <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{r.department || "-"}</Text></View>
                                                                <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{r.remarkbyManagement || "-"}</Text></View>
                                                                <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{formatDate(r.completionDate)}</Text></View>
                                                                <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{r.completionStatus ? "Done" : "Pending"}</Text></View>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })
                            ) : (
                                <Text>No details available for this node.</Text>
                            )}
                            <Footer downloadDate={downloadDate} />
                        </Page>
                    );
                })
            ) : (
                <Page style={styles.page}>
                    <Text>No nodes available.</Text>
                </Page>
            )}


            {/* ==================================================================================
                                    PAGE 5: ALL RECOMMENDATIONS
               ================================================================================== */}
            {/* ==================================================================================
                                PAGE 5: ALL RECOMMENDATIONS
   ================================================================================== */}
            <Page size="A4" style={styles.page} orientation="landscape">
                <Header hazop={hazop} />
                <Text style={styles.sectionTitle}>All Recommendations for HAZOP</Text>

                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={[styles.tableRow, styles.tableRowHeader]}>
                        <View style={[styles.tableCol, { width: '5%' }]}><Text style={styles.tableCellHeader}>#</Text></View>
                        <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCellHeader}>Recommendation</Text></View>
                        <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellHeader}>Remark</Text></View>
                        <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Responsibility</Text></View>
                        <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Department</Text></View>
                        <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Completion Status</Text></View>
                        <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Completion Date</Text></View>
                        <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Review Action</Text></View>
                        <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Reviewed By</Text></View>
                    </View>

                    {/* Table Rows */}
                    {allRecommendations?.length > 0 ? allRecommendations.map((rec, idx) => (
                        <View key={idx} style={[styles.tableRow, idx % 2 !== 0 ? styles.tableRowEven : {}]}>
                            <View style={[styles.tableCol, { width: '5%' }]}><Text style={styles.tableCell}>{idx + 1}</Text></View>
                            <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{rec.recommendation || '-'}</Text></View>
                            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{rec.remarkbyManagement || '-'}</Text></View>
                            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{rec.responsibility || '-'}</Text></View>
                            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{rec.department || '-'}</Text></View>
                            <View style={[styles.tableCol, { width: '10%' }]}><Text style={[styles.tableCell, rec.completionStatus ? styles.completed : styles.pending]}>{rec.completionStatus ? 'Completed' : 'Pending'}</Text></View>
                            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{rec.completionDate ? formatDate(rec.completionDate) : '-'}</Text></View>
                            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{rec.sendForVerificationAction ? 'Action Taken' : 'No Action'}</Text></View>
                            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{rec.verificationResponsibleEmployeeName || '-'}</Text></View>
                        </View>
                    )) : (
                        <View style={styles.tableRow}>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>No recommendations found</Text></View>
                        </View>
                    )}
                </View>

                <Footer downloadDate={downloadDate} />
            </Page>

            {/* ==================================================================================
                            PAGE 6: ASSIGNMENT SUMMARY
   ================================================================================== */}
            <Page size="A4" style={styles.page} orientation="landscape">
                <Header hazop={hazop} />
                <Text style={styles.sectionTitle}>Assignment Summary</Text>

                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={[styles.tableRow, styles.tableRowHeader]}>
                        <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>#</Text></View>
                        <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCellHeader}>Recommendation</Text></View>
                        <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCellHeader}>Remark</Text></View>
                        <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Assigned To</Text></View>
                        <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Assigned Date</Text></View>
                        <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Completion Status</Text></View>
                        <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Acceptance Status</Text></View>
                    </View>

                    {/* Table Rows */}
                    {["notAssigned", "assigned", "accepted", "rejected"].map((key) => {
                        const data = assignData?.[key] || [];
                        return data.map((item, idx) => {
                            const rec = item.javaHazopNodeRecommendation || item;
                            return (
                                <View key={`${key}-${idx}`} style={[styles.tableRow, idx % 2 !== 0 ? styles.tableRowEven : {}]}>
                                    <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{idx + 1}</Text></View>
                                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{rec.recommendation || '-'}</Text></View>
                                    <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{rec.remarkbyManagement || '-'}</Text></View>
                                    <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{item.assignToEmpCode || item.acceptedByEmployeeName || '-'}</Text></View>
                                    <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{formatDate(item.assignWorkDate) || '-'}</Text></View>
                                    <View style={[styles.tableCol, { width: '10%' }]}><Text style={[styles.tableCell, item.completionStatus ? styles.completed : styles.pending]}>{item.completionStatus ? 'Completed' : 'Pending'}</Text></View>
                                    <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>
                                        {item.assignworkAcceptance
                                            ? "Accepted"
                                            : item.assignWorkSendForAcceptance
                                                ? "Waiting for Acceptance"
                                                : "Not Sent"}
                                    </Text></View>
                                </View>
                            );
                        });
                    })}
                </View>
                <Footer downloadDate={downloadDate} />
            </Page>


            {/* ==================================================================================
                                    PAGE 7: CONFIRMATION SUMMARY
               ================================================================================== */}
            <Page size="A4" style={styles.page} orientation="landscape">
                <Header hazop={hazop} />
                <Text style={styles.sectionTitle}>Confirmation Summary</Text>

                {(!verificationData || verificationData.length === 0) ? (
                    <Text style={{ fontSize: 10, marginTop: 10 }}>No verification records available</Text>
                ) : (
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={[styles.tableRow, styles.tableRowHeader]}>
                            <View style={[styles.tableCol, { width: '5%' }]}><Text style={styles.tableCellHeader}>#</Text></View>
                            <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCellHeader}>Recommendation</Text></View>
                            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellHeader}>Remark</Text></View>
                            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Completion Status</Text></View>
                            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Review Action</Text></View>
                            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellHeader}>Reviewed By</Text></View>
                            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Email</Text></View>
                            <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellHeader}>Review Date</Text></View>
                        </View>

                        {/* Table Rows */}
                        {verificationData.map((item, idx) => (
                            <View key={idx} style={[styles.tableRow, idx % 2 !== 0 ? styles.tableRowEven : {}]}>
                                <View style={[styles.tableCol, { width: '5%' }]}><Text style={styles.tableCell}>{idx + 1}</Text></View>
                                <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{item.recommendation || '-'}</Text></View>
                                <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{item.remarkbyManagement || '-'}</Text></View>
                                <View style={[styles.tableCol, { width: '10%' }]}><Text style={[styles.tableCell, item.completionStatus ? styles.completed : styles.pending]}>{item.completionStatus ? 'Completed' : 'Pending'}</Text></View>
                                <View style={[styles.tableCol, { width: '10%' }]}><Text style={[styles.tableCell, item.sendForVerificationAction ? styles.completed : {}]}>{item.sendForVerificationAction ? 'Approved' : 'Rejected'}</Text></View>
                                <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{item.verificationResponsibleEmployeeName || '-'}</Text></View>
                                <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{item.verificationResponsibleEmployeeEmail || '-'}</Text></View>
                                <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCell}>{item.verificationDate ? formatDate(item.verificationDate) : '-'}</Text></View>
                            </View>
                        ))}
                    </View>
                )}
                <Footer downloadDate={downloadDate} />
            </Page>
        </Document>
    );
};

export default HazopPdfDocument;
