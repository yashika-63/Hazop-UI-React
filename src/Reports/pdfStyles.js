// pdfStyles.js
import { StyleSheet } from "@react-pdf/renderer";

const pdfStyles = StyleSheet.create({
    page: {
        padding: 25,
        fontSize: 11,
        fontFamily: "Helvetica", // use built-in font directly
        backgroundColor: "#fff",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15,
        borderBottom: "1px solid #ccc",
        paddingBottom: 8,
    },

    logo: { width: 60, height: 60 },

    // Centered title container
    reportTitleCenter: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    reportTitle: {
        fontSize: 16,
        color: "#4E90AC",
        fontWeight: "bold",
        textAlign: "center",
    },

    // Right side container
    reportSideContainer: {
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        width: 150, // fixed width for alignment
    },

    reportSideTitle: {
        fontSize: 14,
        color: "#2E86AB",
        fontWeight: "normal",
        textAlign: "right",
    },

    creationDate: {
        fontSize: 9,
        color: "#888",
        marginTop: 2,
        textAlign: "right",
    },

    section: {
        marginBottom: 15,
    },

    label: {
        fontWeight: "bold",
        color: "#2E86AB",
    },

    infoRow: {
        marginBottom: 4, // space below each label-value pair
    },

    description: {
        marginTop: 4,
        marginBottom: 6, // extra spacing below description
    },


    // Table container
    table: {
        display: "table",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#ccc",
        marginTop: 10,
        borderRadius: 4,
        overflow: "hidden",
    },

    // Table row
    tableRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        borderBottomStyle: "solid",
        paddingHorizontal: 4,
        paddingVertical: 2,
    },

    // Header column
    tableColHeader: {
        width: "50%",
        fontWeight: "bold",
        fontSize: 11,
        paddingVertical: 6,
        paddingHorizontal: 4,
        textAlign: "center",
        borderRightWidth: 1,
        borderRightColor: "#ccc",
        borderRightStyle: "solid",
        color: "#2E86AB",
    },

    // Regular column
    tableCol: {
        width: "25%",
        fontSize: 10,
        paddingVertical: 6,
        paddingHorizontal: 4,
        textAlign: "center",
        borderRightWidth: 1,
        borderRightColor: "#ccc",
        borderRightStyle: "solid",
        color: "#444",
    },

    // Alternate row background for readability
    alternateRow: {
        backgroundColor: "#f9f9f9",
    },

    // Optional: Remove right border for last column
    tableColLast: {
        borderRightWidth: 0,
    },



    // Node card
    nodeCard: {
        marginBottom: 15,
        padding: 10,
        border: "1px solid #ccc",
        borderRadius: 8,
        backgroundColor: "#fefefe",
    },
    nodeTitle: {
        fontWeight: "bold",
        fontSize: 14,
        marginBottom: 10,
        color: "#2E86AB",
        textDecoration: "underline",
    },
    nodeInfoRow: {
        flexDirection: "row",
        marginBottom: 4,
    },
    nodeInfoColumn: {
        flex: 1,
        flexDirection: "row",
        marginBottom: 2,
    },
    nodeInfoLabel: {
        fontWeight: "bold",
        width: 90,
        paddingRight: 4,
    },
    nodeInfoValue: {
        flex: 1,
    },

    // All nodes destails css
    allNodeDetailCard: {
        marginBottom: 8,
        padding: 8,
        border: "1px solid #ccc",
        borderRadius: 6,
        backgroundColor: "#fdfdfd",
    },

    allNodeDetailRow: {
        flexDirection: "row", // short fields
        marginBottom: 4,
        flexWrap: "wrap",
    },

    allNodeDetailLabel: {
        fontWeight: "bold",
        fontSize: 10,
        color: "black",
        width: "30%", // short label width
    },

    allNodeDetailValue: {
        fontSize: 10,
        lineHeight: 1.3,
        width: "65%", // short value width
        wordBreak: "break-word",
    },

    allNodeDetailRowFull: { // for long/para values
        flexDirection: "column",
        marginBottom: 6,
        width: "100%", // take full width of page
    },

    allNodeDetailValueFull: {
        fontSize: 10,
        lineHeight: 1.4,
        wordBreak: "break-word",
        width: "100%",
    },

    // pdfStyles.js additions for node details card
    nodeDetailCard: {
        marginBottom: 12,
        padding: 10,
        border: "1px solid #ccc",
        borderRadius: 6,
        backgroundColor: "#f9f9f9",
    },

    nodeDetailRow: {
        flexDirection: "row",
        marginBottom: 4,
    },

    nodeDetailLabel: {
        fontWeight: "bold",
        width: 120,
    },

    nodeDetailValue: {
        flex: 1,
    },

    nodeDetailRowFull: {
        flexDirection: "column",
        marginBottom: 6,
    },

    nodeDetailValueFull: {
        marginTop: 2,
        width: "100%",
    },


    // Footer
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 8,
        color: "#888",
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        paddingTop: 5,
    },
});

export default pdfStyles;
