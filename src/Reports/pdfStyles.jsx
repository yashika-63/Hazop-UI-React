import { StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        paddingTop: 120,
        paddingBottom: 60,
        paddingHorizontal: 40,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: "#333",
        backgroundColor: "#fff",
    },

    /* ---------- HEADER ---------- */
    headerContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        paddingHorizontal: 40,
        paddingTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "#0056b3",
    },
    logo: { width: 60, height: 60, objectFit: "contain" },
    headerTitleBlock: { textAlign: "center", flex: 1 },
    companyName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#003366",
        textTransform: "uppercase",
    },
    reportTitle: { fontSize: 12, color: "#555", marginTop: 4, letterSpacing: 1 },
    headerMeta: { textAlign: "right", minWidth: 100 },
    metaText: { fontSize: 9, color: "#666" },

    /* ---------- FOOTER ---------- */
    footerContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
        paddingHorizontal: 40,
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerText: { fontSize: 9, color: "#888" },

    /* ---------- GENERAL ---------- */
    section: { marginBottom: 20, backgroundColor: '#FFFFFF' },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#0056b3",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        paddingBottom: 4,
    },

    /* ---------- INFO CARDS ---------- */
    infoCard: {
        backgroundColor: "#F4FAFF",
        padding: 12,
        borderRadius: 6,
        marginBottom: 15,
    },
    infoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        flexWrap: "wrap",
    },
    infoLabel: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#495057",
        width: "30%",
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 10,
        color: "#212529",
        flex: 1,
        textAlign: "right",
    },

    /* ---------- TABLES ---------- */
    table: {
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#bfbfbf",
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 15,
    },
    tableRow: { flexDirection: "row", minHeight: 20 },
    tableRowHeader: { backgroundColor: "#275D8D" },
    tableRowEven: { backgroundColor: "#e9ecef" },
    tableCol: {
        width: "33.33%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: "#BEBEBE",
        padding: 3,
        color: 'FFFFFF'
    },
    tableColWidths : {
        recommendation: "40%",
        department: "15%",
        remark: "20%",
        completionDate: "15%",
        status: "10%",
    },

    tableCellHeader: { fontSize: 9, fontWeight: "bold", color: "#FFFFFF" },
    tableCell: { fontSize: 9, color: "#212529", flexWrap: "wrap", wordBreak: "break-word", },

    /* ---------- NODE SECTIONS ---------- */
    nodeContainer: {
        borderWidth: 1,
        borderColor: "#dee2e6",
        borderRadius: 6,
        marginBottom: 15,
    },
    nodeHeader: {
        backgroundColor: "#275D8D",
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ced4da",
        flexDirection: "row",
        justifyContent: "space-between",
        color: '#F4FAFF'
    },
    nodeTitle: { fontSize: 11, fontWeight: "bold" },
    nodeBody: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 10,
        justifyContent: "space-between",
    },
    nodeField: { width: "48%", marginBottom: 8 },
    nodeLabel: { fontWeight: "bold", marginBottom: 2, fontSize: 10 },
    nodeValue: { fontSize: 10, width: "100%", color: "#212529" },

    /* ---------- INDEX ---------- */
    indexRow: { flexDirection: "row", alignItems: "center" },
    indexCol: { fontSize: 10, paddingHorizontal: 5 },

    /* ---------- BADGES ---------- */
    badge: {
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 8,
        color: "white",
    },
    bgGreen: { backgroundColor: "#28a745" },
    bgRed: { backgroundColor: "#dc3545" },

    /* ---------- CARDS ---------- */
    card: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
        backgroundColor: "#f9f9f9",
    },
    cardTitle: { fontSize: 11, fontWeight: "bold", color: "#003366", marginBottom: 6 },
    cardRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 3 },
    cardLabel: {
        fontWeight: "bold",
        width: "35%",
        fontSize: 10,
        color: "#495057",
    },
    cardValue: { width: "65%", fontSize: 10, color: "#212529" },

    completed: { color: "#28a745", fontWeight: "600" },
    pending: { color: "#dc3545", fontWeight: "600" },

    /* ---------- ASSIGNMENT ---------- */
    assignmentHeader: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#007bff",
        marginBottom: 6,
    },
    assignmentCard: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
        backgroundColor: "#f9f9f9",
    },
});

export default styles;
