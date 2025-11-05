import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

// Adjust paths as needed
import rmbghLogo from "/images/rmbghlogo.png";
import qcLogo from "/images/qc-logo.png";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.5,
  },
header: {
  marginBottom: 25,
  // borderBottomWidth: 1,
  // borderBottomColor: "#000",
  paddingBottom: 10,
},
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { width: 50, height: 50 },
  headerCenter: { flex: 1, textAlign: "center" },
  hospitalName: { fontSize: 16, fontWeight: "bold" },
  hospitalAddress: { fontSize: 10, color: "#555", marginTop: 2 },
infoSection: {
  marginTop: 5,
  marginBottom: 5,
},
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  labelCol: {
    width: 70,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  valueCol: {
    flex: 1,
    textAlign: "justify",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    marginVertical: 10,
  },
  content: {
    fontSize: 12,
    marginTop: 10,
    whiteSpace: "pre-line",
  },
});

const PrintLayout = ({ email }) => (
  <Document>
    <Page style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image src={rmbghLogo} style={styles.logo} />
          <View style={styles.headerCenter}>
            <Text style={styles.hospitalName}>
              Rosario Maclang Bautista General Hospital
            </Text>
            <Text style={styles.hospitalAddress}>
              1 IBP Road, Batasan Hills, Quezon City, Philippines
            </Text>
          </View>
          <Image src={qcLogo} style={styles.logo} />
        </View>
      </View>

      {/* MEMO INFORMATION */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.labelCol}>TO :</Text>
          <Text style={styles.valueCol}>{email.recipient || ""}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.labelCol}>FROM :</Text>
          <Text style={styles.valueCol}>{email.sender}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.labelCol}>SUBJECT :</Text>
          <Text style={styles.valueCol}>{email.subject}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.labelCol}>DATE :</Text>
          <Text style={styles.valueCol}>
            {new Date(email.time).toLocaleDateString("en-PH", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>

      {/* DIVIDER LINE BETWEEN DETAILS AND MESSAGE */}
      <View style={styles.divider} />

      {/* MESSAGE CONTENT */}
      <Text style={styles.content}>{email.content}</Text>
    </Page>
  </Document>
);

export default PrintLayout;
