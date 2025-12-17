import { StyleSheet } from "@react-pdf/renderer";
 
// 1. Centralized Color Palette
const theme = {
    primary: "#1E293B",      // Navy / Slate - Main Headers
    secondary: "#475569",    // Dark Grey - Subheaders
    accent: "#0F766E",       // Teal - Highlights
    border: "#CBD5E1",       // Light Blue-Grey - Borders
    bgLight: "#F8FAFC",      // Very Light - Alternating rows
    bgHeader: "#F1F5F9",     // Page Headers
    textMain: "#334155",     // Body Text
    textDark: "#0F172A",     // Bold Values
    textLight: "#64748B",    // Meta info
    white: "#FFFFFF",
    link: "#2563EB",         // Hyperlink Blue
    success: "#166534",
    danger: "#991B1B",
    warning: "#B45309",
};
 
const styles = StyleSheet.create({
    page: {
        paddingTop: 110,
        paddingBottom: 60,
        paddingHorizontal: 35,
        fontFamily: "Helvetica",
        fontSize: 9,
        color: theme.textMain,
        backgroundColor: theme.white,
    },
 
    /* ---------- HEADER ---------- */
    headerContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 90,
        paddingHorizontal: 35,
        paddingTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: theme.primary,
        backgroundColor: theme.white,
    },
    logo: { width: 50, height: 50, objectFit: "contain" },
    headerTitleBlock: { textAlign: "center", flex: 1 },
    companyName: {
        fontSize: 14,
        fontWeight: "bold",
        color: theme.primary,
        textTransform: "uppercase",
    },
    reportTitle: { fontSize: 10, color: theme.secondary, marginTop: 4, letterSpacing: 1 },
    headerMeta: { textAlign: "right", minWidth: 100 },
    metaText: { fontSize: 8, color: theme.textLight },
 
    /* ---------- FOOTER ---------- */
    footerContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        paddingHorizontal: 35,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.white,
    },
    footerText: { fontSize: 8, color: theme.textLight },
 
    /* ---------- SECTIONS & TYPOGRAPHY ---------- */
    section: {
        marginBottom: 15,
        width: "100%",
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: theme.primary,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        paddingBottom: 4,
        textTransform: "uppercase",
    },
 
    /* ---------- TABLES (Professional Grid) ---------- */
    // Strategy: Table has Top & Left border. Cells have Bottom & Right.
    // This prevents double borders.
    table: {
        width: "100%",
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: theme.border,
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: "row",
        minHeight: 20,
        alignItems: "stretch"
    },
    tableRowHeader: {
        backgroundColor: theme.primary,
    },
    tableRowEven: {
        backgroundColor: theme.bgLight
    },
    tableCol: {
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.border,
        padding: 4,
        justifyContent: "center",
    },
    tableCellHeader: {
        fontSize: 8,
        fontWeight: "bold",
        color: theme.white,
        textAlign: "center"
    },
    tableCell: {
        fontSize: 8,
        color: theme.textMain,
        flexWrap: "wrap",
        wordBreak: "break-word"
    },
 
    /* ---------- INFO GRID (Key-Value Pairs) ---------- */
    infoCard: {
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 4,
        marginBottom: 10,
    },
    infoItem: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: theme.bgLight,
        paddingVertical: 5,
        paddingHorizontal: 8,
    },
    infoLabel: {
        fontSize: 9,
        fontWeight: "bold",
        color: theme.secondary,
        width: "35%",
    },
    infoValue: {
        fontSize: 9,
        color: theme.textDark,
        flex: 1,
        textAlign: "right",
    },
 
    /* ---------- NODE DETAILS ---------- */
    nodeContainer: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 4,
        overflow: "hidden",
    },
    nodeHeader: {
        backgroundColor: theme.primary,
        paddingVertical: 6,
        paddingHorizontal: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        color: theme.white,
        fontSize: 10,
        fontWeight: "bold",
    },
    nodeBody: {
        padding: 8,
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: theme.white,
    },
    nodeField: {
        width: "50%",
        marginBottom: 4,
        flexDirection: "row",
        paddingRight: 5
    },
    nodeLabel: {
        fontWeight: "bold",
        fontSize: 8,
        color: theme.secondary,
        marginRight: 4,
        width: "40%",
    },
    nodeValue: {
        fontSize: 8,
        color: theme.textDark,
        flex: 1,
    },
 
    /* ---------- DETAIL CARDS (Recs, Assignments) ---------- */
    detailCard: {
        marginBottom: 20,
    },
    card: {
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
        backgroundColor: theme.bgLight,
    },
    cardTitle: {
        fontSize: 10,
        fontWeight: "bold",
        color: theme.primary,
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        paddingBottom: 2
    },
    cardRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 3 },
    cardLabel: {
        fontWeight: "bold",
        width: "30%",
        fontSize: 9,
        color: theme.secondary,
    },
    cardValue: { width: "70%", fontSize: 9, color: theme.textDark },
 
    /* ---------- INDEX TABLE SPECIFIC ---------- */
    indexRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: theme.border
    },
    indexHeader: {
        backgroundColor: theme.secondary,
        color: theme.white,
        paddingVertical: 6,
        borderBottomWidth: 0
    },
    indexCol: { fontSize: 9, paddingHorizontal: 5 },
 
    /* ---------- UTILS ---------- */
    completed: { color: theme.success, fontWeight: "bold" },
    pending: { color: theme.danger, fontWeight: "bold" },
    linkText: { color: theme.link, textDecoration: "none" }
});
 
export default styles;
export { theme }; // Export theme if needed elsewhere
 