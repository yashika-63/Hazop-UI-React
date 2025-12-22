import React from 'react';
import { pdf } from "@react-pdf/renderer";
import HazopPdfDocument from "./HazopPdfDocument";

export async function generateHazopPdf({
    hazop,
    nodes,
    team,
    nodeDetails,
    nodeDetailsState,
    allRecommendations,
    verificationData,
    mocReferences,
    assignData,
    downloadDate,
    hazopId,
    // --- ADD THESE MISSING PROPS ---
    registrationNodes, 
    documents 
}) {
    try {
        const blob = await pdf(
            <HazopPdfDocument
                hazop={hazop}
                nodes={nodes}
                team={team}
                nodeDetails={nodeDetails}
                nodeDetailsState={nodeDetailsState}
                allRecommendations={allRecommendations}
                verificationData={verificationData}
                mocReferences={mocReferences}
                assignData={assignData}
                downloadDate={downloadDate}
                // --- PASS THEM HERE ---
                registrationNodes={registrationNodes}
                documents={documents}
            />
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Hazop_Report_${hazopId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("PDF generation failed:", error);
    }
}