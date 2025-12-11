// hazopPdfGenerator.js
import { pdf } from "@react-pdf/renderer";
import MyDocument from "../components/hazop/HazopPdfDocument"; // adjust path
import HazopPdfDocument from "./HazopPdfDocument";

export async function generateHazopPdf({
    hazop,
    nodeDetails,
    nodeDetailsState,
    nodeRecommendations,
    allRecommendations,
    verificationData,
    mocReferences,
    assignData,
    downloadDate,
    hazopId
}) {
    try {
        const blob = await pdf(
            <HazopPdfDocument
                hazop={hazop}
                nodes={hazop.nodes}
                team={hazop.teamMembers}
                nodeDetails={nodeDetails}
                nodeDetailsState={nodeDetailsState}
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
}
