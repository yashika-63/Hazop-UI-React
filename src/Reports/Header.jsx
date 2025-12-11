import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { formatDate } from "../CommonUI/CommonUI";
import styles from "./pdfStyles";

const Header = ({ hazop }) => (
    <View style={styles.headerContainer} fixed>
        <Image src="/assets/AACL.png" style={styles.logo} />

        <View style={styles.headerTitleBlock}>
            <Text style={styles.companyName}>ALKYL AMINES CHEMICALS LTD</Text>
        </View>

        <View style={styles.headerMeta}>
            <Text style={styles.metaText}>Date: {formatDate(hazop?.hazopDate || "-")}</Text>
        </View>
    </View>
);

export default Header;
