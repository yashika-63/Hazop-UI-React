import React, { useEffect, useState } from "react";
import axios from "axios";
import { pdf } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from "@react-pdf/renderer";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { strings } from "../string";
import { formatDate } from "../CommonUI/CommonUI";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const styles = StyleSheet.create({
    page: { paddingTop: 120, paddingBottom: 60, paddingHorizontal: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333', backgroundColor: '#fff' },
    headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, paddingHorizontal: 40, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#0056b3' },
    logo: { width: 60, height: 60, objectFit: 'contain' },
    headerTitleBlock: { textAlign: 'center', flex: 1 },
    companyName: { fontSize: 16, fontWeight: 'bold', color: '#003366', textTransform: 'uppercase' },
    reportTitle: { fontSize: 12, color: '#555', marginTop: 4, letterSpacing: 1 },
    headerMeta: { textAlign: 'right', minWidth: 100 },
    metaText: { fontSize: 9, color: '#666' },
    footerContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, paddingHorizontal: 40, borderTopWidth: 1, borderTopColor: '#ccc', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerText: { fontSize: 9, color: '#888' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#0056b3', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 4 },
    infoCard: { backgroundColor: '#f1f3f5', padding: 12, borderRadius: 6, marginBottom: 15 },
    infoItem: { marginBottom: 6 }, infoCard: {
        backgroundColor: '#f1f3f5',
        padding: 12,
        borderRadius: 6,
        marginBottom: 15
    },

    // Ensure that infoItem uses a row-based layout
    infoItem: {
        flexDirection: 'row',  // This will align label and value horizontally
        justifyContent: 'space-between', // This ensures the label and value are spaced out
        marginBottom: 6
    },

    infoLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#495057',
        marginBottom: 2,
        width: '30%' // Fixed width for labels, adjust as needed
    },

    infoValue: {
        fontSize: 10,
        color: '#212529',
        flex: 1,  // This ensures the value takes up the remaining space
        textAlign: 'right'  // Optional, to align the value to the right side
    },
    infoLabel: { fontSize: 9, fontWeight: 'bold', color: '#495057', marginBottom: 2 },
    infoValue: { fontSize: 10, fontWeight: 'normal', color: '#212529' },
    table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', borderRightWidth: 0, borderBottomWidth: 0, marginBottom: 15 },
    tableRow: { flexDirection: 'row', minHeight: 20 },
    tableRowHeader: { backgroundColor: '#004085' },
    tableRowEven: { backgroundColor: '#e9ecef' },
    tableCol: { width: '33.33%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, borderColor: '#bfbfbf', padding: 3 },
    tableCellHeader: { fontSize: 9, fontWeight: 'bold', color: '#fff' },
    tableCell: { fontSize: 9, color: '#212529' },
    nodeContainer: { borderWidth: 1, borderColor: '#dee2e6', borderRadius: 6, marginBottom: 15 },
    nodeHeader: { backgroundColor: '#e9ecef', padding: 8, borderBottomWidth: 1, borderBottomColor: '#ced4da', flexDirection: 'row', justifyContent: 'space-between' },
    nodeTitle: { fontSize: 11, fontWeight: 'bold' },
    nodeBody: { padding: 10 },
    badge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, fontSize: 8, color: 'white' },
    bgGreen: { backgroundColor: '#28a745' },
    bgRed: { backgroundColor: '#dc3545' },
    bgBlue: { backgroundColor: '#007bff' },
});

const Header = ({ hazop }) => (
    <View style={styles.headerContainer} fixed>
        <Image src="/assets/AACL.png" style={styles.logo} />
        <View style={styles.headerTitleBlock}>
            <Text style={styles.companyName}>ALKYL AMINES CHEMICALS LTD</Text>
            {/* <Text style={styles.reportTitle}>HAZOP SAFETY REPORT</Text> */}
        </View>
        <View style={styles.headerMeta}>
            {/* <Text style={styles.metaText}>Ref: {hazop?.hazopId || '-'}</Text> */}
            <Text style={styles.metaText}>Date: {hazop?.hazopDate || '-'}</Text>
        </View>
    </View>
);

const Footer = ({ downloadDate }) => (
    <View style={styles.footerContainer} fixed>
        <Text style={styles.footerText}>Generated: {downloadDate} | Confidential</Text>
        <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
);

// Updated MyDocument with default props and safe optional chaining
const MyDocument = ({
    hazop = {},
    team = [],
    nodes = [],
    nodeDetails = {},
    nodeRecommendations = {},
    allRecommendations = [],
    verificationData = {},
    mocReferences = {},
    assignData = { rejected: [], accepted: [], assigned: [], notAssigned: [] },
    downloadDate = new Date().toLocaleString(),
}) => (
    <Document>
        {/* Page 1: HAZOP Info + Team */}
        <Page size="A4" style={styles.page}>
            <Header hazop={hazop} />

            {/* Hazop Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hazop Details</Text>
                <View style={styles.infoCard}>
                    {/* Hazop Info Items */}
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Title</Text>
                        <Text style={styles.infoValue}>{hazop?.title || '-'}</Text>
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
                        <Text style={styles.infoLabel}>Hazop Creation Date</Text>
                        <Text style={styles.infoValue}>{hazop?.hazopCreationDate || '-'}</Text>
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
                        <Text style={styles.infoLabel}>Description</Text>
                        <Text style={styles.infoValue}>{hazop?.description || '-'}</Text>
                    </View>
                </View>
            </View>
            {/* MOC References - show only if present */}
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
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>HAZOP Team</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableRowHeader]}>
                        <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Name</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Department</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Email</Text></View>
                    </View>
                    {team?.map((m, i) => (
                        <View key={i} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowEven : {}]}>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{m?.firstName || ''} {m?.lastName || ''}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{m?.dimension3 || '-'}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{m?.emailId || '-'}</Text></View>
                        </View>
                    ))}
                </View>
            </View>



            <Footer downloadDate={downloadDate} />
        </Page>




        {/* Page 2: Node Overview */}
        <Page size="A4" style={styles.page}>
            <Header hazop={hazop} />
            <Text style={styles.sectionTitle}>All Nodes</Text>
            {nodes?.map((node, index) => (
                <View key={node.id} style={styles.nodeContainer} wrap={false}>
                    <View style={styles.nodeHeader}>{node.title || '-'}-{node.nodeNumber || '-'}</View>
                    <View style={{ flexDirection: 'row', padding: 10 }}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>Design Intent:</Text>
                                <Text>{node?.designIntent || '-'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>P&ID Revision:</Text>
                                <Text>{node?.pIdRevision || '-'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>SOP No.:</Text>
                                <Text>{node?.sopNo || '-'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>SOP Date:</Text>
                                <Text>{formatDate(node?.sopDate || '-')}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>Creation Date:</Text>
                                <Text>{formatDate(node?.creationDate || '-')}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>Completion Date:</Text>
                                <Text>{formatDate(node?.completionDate || '-')}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, paddingLeft: 10 }}>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>Equipment:</Text>
                                <Text>{node?.equipment || '-'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>Controls:</Text>
                                <Text>{node?.controls || '-'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>Temperature:</Text>
                                <Text>{node?.temperature || '-'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>Pressure:</Text>
                                <Text>{node?.pressure || '-'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>Quantity / Flow Rate:</Text>
                                <Text>{node?.quantityFlowRate || '-'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>Chemical & Utilities:</Text>
                                <Text>{node?.chemicalAndUtilities || '-'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                <Text style={{ fontWeight: 'bold', width: '40%' }}>Registration Date:</Text>
                                <Text>{formatDate(node?.registrationDate || '-')}</Text>
                            </View>
                        </View>
                    </View>

                </View>

            ))}
            <Footer downloadDate={downloadDate} />
        </Page>


        {/* Pages 4+: Node Details + Recommendations */}
        {nodes?.map((node) => (
            <Page size="A4" style={styles.page} key={`node-${node?.id}`}>
                <Header hazop={hazop} />

                {/* Node Card for Each Node */}
                <View style={styles.nodeContainer}>
                    {/* Node Information (Title & Number) */}
                    <View style={styles.nodeHeader}>
                        <Text style={styles.title}>Node {node?.nodeNumber}: {node?.title || '-'}</Text>
                        <View style={[styles.badge, node?.completionStatus ? styles.bgGreen : styles.bgRed]}>
                            <Text style={{ color: 'white', fontSize: 8 }}>
                                {node?.completionStatus ? 'Completed' : 'Pending'}
                            </Text>
                        </View>
                    </View>

                    {/* Node Details Section */}
                    <View style={styles.nodeBody}>
                        <Text style={styles.sectionTitle}>Node Details</Text>

                        <View style={styles.table}>
                            {/* Table Header */}
                            <View style={[styles.tableRow, styles.tableRowHeader]}>
                                <View style={{ ...styles.tableCol, width: '25%' }}>
                                    <Text style={styles.tableCellHeader}>Deviation</Text>
                                </View>
                                <View style={{ ...styles.tableCol, width: '25%' }}>
                                    <Text style={styles.tableCellHeader}>Causes</Text>
                                </View>
                                <View style={{ ...styles.tableCol, width: '25%' }}>
                                    <Text style={styles.tableCellHeader}>Consequences</Text>
                                </View>
                                <View style={{ ...styles.tableCol, width: '25%' }}>
                                    <Text style={styles.tableCellHeader}>Risk Rating</Text>
                                </View>
                            </View>

                            {/* Table Body */}
                            {nodeDetails?.[node?.id]?.map((detail, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <View style={{ ...styles.tableCol, width: '25%' }}>
                                        <Text style={styles.tableCell}>{detail?.deviation || '-'}</Text>
                                    </View>
                                    <View style={{ ...styles.tableCol, width: '25%' }}>
                                        <Text style={styles.tableCell}>{detail?.causes || '-'}</Text>
                                    </View>
                                    <View style={{ ...styles.tableCol, width: '25%' }}>
                                        <Text style={styles.tableCell}>{detail?.consequences || '-'}</Text>
                                    </View>
                                    <View style={{ ...styles.tableCol, width: '25%' }}>
                                        <Text style={styles.tableCell}>{detail?.riskRating || '-'}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>


                    {/* Recommendations for Node Details */}
                    <View style={styles.nodeBody}>
                        {nodeDetails?.[node?.id]?.map((detail, index) => {
                            // Safely get recommendations for this detail
                            const recs = nodeRecommendations?.[node?.id]?.[detail?.id] || [];

                            return (
                                <View key={index} style={styles.detailCard}>
                                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#d63384', marginBottom: 5 }}>
                                        Recommendations for {detail?.designIntent || 'Detail ' + (index + 1)}
                                    </Text>

                                    {recs.length > 0 ? (
                                        <View style={styles.table}>
                                            <View style={[styles.tableRow, styles.tableRowHeader]}>
                                                <View style={{ ...styles.tableCol, width: '40%' }}>
                                                    <Text style={styles.tableCellHeader}>Recommendation</Text>
                                                </View>
                                                <View style={{ ...styles.tableCol, width: '20%' }}>
                                                    <Text style={styles.tableCellHeader}>Department</Text>
                                                </View>
                                                <View style={{ ...styles.tableCol, width: '20%' }}>
                                                    <Text style={styles.tableCellHeader}>Remark</Text>
                                                </View>
                                                <View style={{ ...styles.tableCol, width: '20%' }}>
                                                    <Text style={styles.tableCellHeader}>Completion Date</Text>
                                                </View>
                                                <View style={{ ...styles.tableCol, width: '20%' }}>
                                                    <Text style={styles.tableCellHeader}>Completion Status</Text>
                                                </View>
                                            </View>

                                            {recs.map((r, i) => (
                                                <View key={i} style={styles.tableRow}>
                                                    <View style={{ ...styles.tableCol, width: '40%' }}>
                                                        <Text style={styles.tableCell}>{r?.recommendation || '-'}</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: '20%' }}>
                                                        <Text style={styles.tableCell}>{r?.department || '-'}</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: '20%' }}>
                                                        <Text style={styles.tableCell}>{r?.remarkbyManagement || '-'}</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: '20%' }}>
                                                        <Text style={styles.tableCell}>{formatDate(r?.completionDate)}</Text>
                                                    </View>
                                                    <View style={{ ...styles.tableCol, width: '20%' }}>
                                                        <Text style={styles.tableCell}>{r?.completionStatus ? 'Completed' : 'Pending'}</Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    ) : (
                                        <Text>No recommendations available for this detail.</Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                </View>

                <Footer downloadDate={downloadDate} />
            </Page>
        ))}



        {/* Page 3: All Recommendations */}
        <Page size="A4" style={styles.page}>
            <Header hazop={hazop} />
            <Text style={styles.sectionTitle}>All Recommendations for HAZOP</Text>

            <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                    <View style={{ ...styles.tableCol, width: '30%' }}><Text style={styles.tableCellHeader}>Node</Text></View>
                    <View style={{ ...styles.tableCol, width: '40%' }}><Text style={styles.tableCellHeader}>Recommendation</Text></View>
                    <View style={{ ...styles.tableCol, width: '15%' }}><Text style={styles.tableCellHeader}>Remark</Text></View>
                    <View style={{ ...styles.tableCol, width: '15%' }}><Text style={styles.tableCellHeader}>Status</Text></View>
                </View>

                {allRecommendations?.length > 0 ? (
                    allRecommendations.map((r, i) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={{ ...styles.tableCol, width: '30%' }}>
                                <Text style={styles.tableCell}>{r?.id || 'N/A'}</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '40%' }}>
                                <Text style={styles.tableCell}>{r?.recommendation || 'No recommendation available'}</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '15%' }}>
                                <Text style={styles.tableCell}>{r?.remarkbyManagement || 'No remarks'}</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '15%' }}>
                                <Text style={styles.tableCell}>{r?.responsibility || 'No responsibility assigned'}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text>No recommendations found for this HAZOP.</Text>
                )}
            </View>


            <Footer downloadDate={downloadDate} />
        </Page>

        {/* Last Page: Assignment Summary */}
        <Page size="A4" style={styles.page}>
            <Header hazop={hazop} />
            <Text style={styles.sectionTitle}>Assignment Summary</Text>
            {['assigned', 'notAssigned', 'accepted', 'rejected',].map((key) => (
                (assignData?.[key] || [])?.length > 0 && (
                    <View key={key} style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#007bff', marginBottom: 5 }}>{key.toUpperCase()}</Text>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableRowHeader]}>
                                <View style={{ ...styles.tableCol, width: '70%' }}><Text style={styles.tableCellHeader}>Recommendation</Text></View>
                                <View style={{ ...styles.tableCol, width: '70%' }}><Text style={styles.tableCellHeader}>Remark</Text></View>
                                <View style={{ ...styles.tableCol, width: '30%' }}><Text style={styles.tableCellHeader}>Assigned To</Text></View>
                                <View style={{ ...styles.tableCol, width: '30%' }}><Text style={styles.tableCellHeader}>Assigned Date</Text></View>

                            </View>
                            {(assignData?.[key] || []).map((item, i) => (
                                <View key={i} style={styles.tableRow}>
                                    <View style={{ ...styles.tableCol, width: '70%' }}><Text style={styles.tableCell}>{item?.javaHazopNodeRecommendation?.recommendation || '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, width: '70%' }}><Text style={styles.tableCell}>{item?.javaHazopNodeRecommendation?.remarkbyManagement || '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, width: '30%' }}><Text style={styles.tableCell}>{item?.acceptedByEmployeeName || '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, width: '30%' }}><Text style={styles.tableCell}>{formatDate(item?.assignWorkDate || '-')}</Text></View>

                                </View>
                            ))}
                        </View>
                    </View>
                )
            ))}
            <Footer downloadDate={downloadDate} />
        </Page>
        <Page size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>Verification Summary</Text>
            {(verificationData || []).length === 0 ? (
                <Text style={{ fontSize: 10, marginBottom: 10 }}>No verification records available</Text>
            ) : (
                <View style={{ marginBottom: 15 }}>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableRowHeader]}>
                            <View style={{ ...styles.tableCol, width: '40%' }}>
                                <Text style={styles.tableCellHeader}>Recommendation</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '30%' }}>
                                <Text style={styles.tableCellHeader}>Remark</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '30%' }}>
                                <Text style={styles.tableCellHeader}>department</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '30%' }}>
                                <Text style={styles.tableCellHeader}>Completion Status</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '30%' }}>
                                <Text style={styles.tableCellHeader}>Completion Date</Text>
                            </View>
                            <View style={{ ...styles.tableCol, width: '30%' }}>
                                <Text style={styles.tableCellHeader}>Verification Date</Text>
                            </View>
                        </View>
                        {verificationData.map((item, i) => (
                            <View key={i} style={styles.tableRow}>
                                <View style={{ ...styles.tableCol, width: '40%' }}>
                                    <Text style={styles.tableCell}>{item.recommendation || '-'}</Text>
                                </View>
                                <View style={{ ...styles.tableCol, width: '30%' }}>
                                    <Text style={styles.tableCell}>{item.remarkbyManagement || '-'}</Text>
                                </View>
                                <View style={{ ...styles.tableCol, width: '30%' }}>
                                    <Text style={styles.tableCell}>
                                        {item.verificationDate ? formatDate(item.department) : '-'}
                                    </Text>
                                </View>
                                <View style={{ ...styles.tableCol, width: '30%' }}>
                                    <Text style={styles.tableCell}>
                                        {item.verificationDate ? (item.completionStatus ? 'Completed' : 'Pending') : '-'}
                                    </Text>
                                </View>
                                <View style={{ ...styles.tableCol, width: '30%' }}>
                                    <Text style={styles.tableCell}>
                                        {item.verificationDate ? formatDate(item.completionDate) : '-'}
                                    </Text>
                                </View>
                                <View style={{ ...styles.tableCol, width: '30%' }}>
                                    <Text style={styles.tableCell}>
                                        {item.verificationDate ? formatDate(item.verificationDate) : '-'}
                                    </Text>
                                </View>

                            </View>
                        ))}
                    </View>
                </View>
            )}

            <Footer downloadDate={downloadDate} />
        </Page>


    </Document>
);


const HazopReportPage = ({ hazopId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [hazop, setHazop] = useState(null);
    const [team, setTeam] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [nodeDetails, setNodeDetails] = useState({});
    const [nodeRecommendations, setNodeRecommendations] = useState({});
    const [assignData, setAssignData] = useState({ rejected: [], accepted: [], assigned: [], notAssigned: [] });
    const downloadDate = new Date().toLocaleString();
    const [allRecommendations, setAllRecommendations] = useState([]);
    const [verificationData, setVerificationdata] = useState([]);
    const [mocReferences, setMocReferences] = useState([]);


    useEffect(() => {
        const loadData = async () => {
            if (!hazopId) return;
            setLoading(true);

            try {
                // 1️⃣ Fetch HAZOP info + team in parallel
                const [hRes, tRes] = await Promise.all([
                    axios.get(`http://${strings.localhost}/api/hazopRegistration/by-id?hazopId=${hazopId}`),
                    axios.get(`http://${strings.localhost}/api/hazopTeam/teamByHazop/${hazopId}?status=true`)
                ]);

                setHazop(hRes.data || {});
                setTeam(Array.isArray(tRes.data) ? tRes.data : []);

                // 2️⃣ Fetch nodes
                const nRes = await axios.get(
                    `http://${strings.localhost}/api/hazopNode/by-registration-status?registrationId=${hazopId}&status=true`
                );
                const fetchedNodes = Array.isArray(nRes.data) ? nRes.data : [];
                setNodes(fetchedNodes);

                const nodeIds = fetchedNodes.map(n => n.id);
                const dMap = {}; // nodeId -> details
                const rMap = {}; // nodeId -> detailId -> recommendations

                if (nodeIds.length > 0) {
                    // Fetch all node details in parallel
                    const nodeDetailsPromises = nodeIds.map(nodeId =>
                        axios.get(`http://${strings.localhost}/api/hazopNodeDetail/node/${nodeId}`)
                            .then(res => ({ nodeId, details: Array.isArray(res.data) ? res.data : [] }))
                            .catch(() => ({ nodeId, details: [] }))
                    );

                    const nodeDetailsResults = await Promise.all(nodeDetailsPromises);

                    const allRecPromises = [];

                    nodeDetailsResults.forEach(({ nodeId, details }) => {
                        dMap[nodeId] = details;

                        details.forEach(detail => {
                            if (detail.id) {
                                allRecPromises.push(
                                    axios.get(`http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${detail.id}`)
                                        .then(res => ({ nodeId, detailId: detail.id, recs: Array.isArray(res.data) ? res.data : [] }))
                                        .catch(() => ({ nodeId, detailId: detail.id, recs: [] }))
                                );
                            }
                        });
                    });

                    const allRecResults = await Promise.all(allRecPromises);

                    // Organize recommendations by nodeId and detailId
                    allRecResults.forEach(({ nodeId, detailId, recs }) => {
                        if (!rMap[nodeId]) rMap[nodeId] = {};
                        rMap[nodeId][detailId] = recs;
                    });

                    setNodeDetails(dMap);
                    setNodeRecommendations(rMap);
                }

                // 3️⃣ Fetch all recommendations for HAZOP
                const allRecRes = await axios.get(`http://${strings.localhost}/api/nodeRecommendation/getByHazopRegistration/${hazopId}`)
                    .then(res => Array.isArray(res.data) ? res.data : [])
                    .catch(() => []);
                setAllRecommendations(allRecRes);

                // 4️⃣ Fetch assignment data
                const assignRes = await axios.get(`http://${strings.localhost}/api/recommendation/assign/getAllByRegistration/${hazopId}`);
                setAssignData({
                    rejected: Array.isArray(assignRes.data?.rejected) ? assignRes.data.rejected : [],
                    accepted: Array.isArray(assignRes.data?.accepted) ? assignRes.data.accepted : [],
                    assigned: Array.isArray(assignRes.data?.assigned) ? assignRes.data.assigned : [],
                    notAssigned: Array.isArray(assignRes.data?.notAssigned) ? assignRes.data.notAssigned : []
                });

                // 5️⃣ Fetch verification data
                const verificationRes = await axios.get(
                    `http://${strings.localhost}/api/nodeRecommendation/getVerificationActionRecords/${hazopId}`
                );
                setVerificationdata(Array.isArray(verificationRes.data) ? verificationRes.data : []);

                // 6️⃣ Fetch MOC references
                const mocRes = await axios.get(
                    `http://${strings.localhost}/api/moc-reference/by-hazop?hazopRegistrationId=${hazopId}`
                );
                setMocReferences(Array.isArray(mocRes.data) ? mocRes.data : []);

                setLoading(false);
            } catch (err) {
                console.error("Error loading data", err);
                setLoading(false);
            }
        };

        loadData();
    }, [hazopId]);

    // const downloadExcel = async () => {
    //     const workbook = new ExcelJS.Workbook();
    //     const worksheet = workbook.addWorksheet("HAZOP Report");
    //     worksheet.addRow(["HAZOP Info"]);
    //     worksheet.addRow(["Site", hazop?.site]);
    //     const buffer = await workbook.xlsx.writeBuffer();
    //     saveAs(new Blob([buffer]), `HAZOP_Report_${hazopId}.xlsx`);
    // };
    const downloadPdf = async () => {
        try {
            const blob = await pdf(
                <MyDocument
                    hazop={hazop}
                    team={team}
                    nodes={nodes}
                    nodeDetails={nodeDetails}
                    nodeRecommendations={nodeRecommendations}
                    allRecommendations={allRecommendations}
                    verificationData={verificationData}
                    mocReferences={mocReferences}
                    assignData={assignData}
                    downloadDate={downloadDate}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Hazop_Report_${hazopId}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF generation failed:", error);
        }
    };

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ width: "90%", height: "95%", background: "#fff", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: 15, borderBottom: "1px solid #ddd", backgroundColor: "#f8f9fa" }}>
                    <button onClick={onClose} style={{ cursor: "pointer", backgroundColor: "#dc3545", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 4 }}>Close</button>
                    <div>
                        {/* <button onClick={downloadExcel} style={{ cursor: "pointer", backgroundColor: "#28a745", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 4, marginRight: 10 }}>Download Excel</button> */}
                        <button onClick={downloadPdf} style={{ cursor: "pointer", backgroundColor: "#28a745", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 4, marginRight: 10 }}>Download PDF</button>

                    </div>
                </div>
                <div style={{ flex: 1, backgroundColor: '#525659', position: 'relative' }}>
                    {loading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                        </div>
                    )}
                    {!loading ? (
                        <PDFViewer
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            showToolbar={true}
                        >
                            <MyDocument
                                hazop={hazop}
                                team={team}
                                nodes={nodes}
                                nodeDetails={nodeDetails}
                                nodeRecommendations={nodeRecommendations}
                                allRecommendations={allRecommendations}
                                verificationData={verificationData || []}
                                mocReferences={mocReferences}
                                assignData={assignData}
                                downloadDate={downloadDate}
                            />
                        </PDFViewer>
                    ) : (
                        <div style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>
                            Loading Data...
                        </div>
                    )}
                </div>

            </div>
        </div>

    );
};

export default HazopReportPage;
