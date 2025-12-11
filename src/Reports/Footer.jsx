import React from "react";
import { View, Text } from "@react-pdf/renderer";
import styles from "./pdfStyles";

const Footer = ({ downloadDate }) => (
    <View style={styles.footerContainer} fixed>
        <Text style={styles.footerText}>Generated: {downloadDate}</Text>
        <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
    </View>
);

export default Footer;
