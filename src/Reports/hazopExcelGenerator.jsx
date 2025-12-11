// hazopExcelGenerator.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatDate } from "../utils/dateUtils";   // adjust path
import { addHeaderBlock } from "./excelCommon";     // if you use shared header logic

export async function generateHazopExcel({
    hazop,
    team,
    nodes,
    nodeDetails,
    nodeRecommendations,
    hazopId,
}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Alkyl Amines Chemicals Ltd';
    workbook.created = new Date();

    // -------------------------------
    // COVER PAGE
    // -------------------------------
    const coverSheet = workbook.addWorksheet('Cover Page');

    coverSheet.columns = [
        { width: 5 }, { width: 15 }, { width: 25 }, { width: 15 }, { width: 20 },
        { width: 15 }, { width: 20 }, { width: 10 }
    ];

    addHeaderBlock(coverSheet, hazop);

    coverSheet.mergeCells('B9:G9');
    const titleCell = coverSheet.getCell('B9');
    titleCell.value = 'ALKYL AMINES CHEMICALS LIMITED';
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.font = { size: 16, bold: true, color: { argb: '003366' } };

    // Site Name
    coverSheet.mergeCells('B11:C11');
    coverSheet.getCell('B11').value = 'Site Name:';
    coverSheet.getCell('D11').value = hazop?.site || '';

    // Title
    coverSheet.mergeCells('B13:C13');
    coverSheet.getCell('B13').value = 'HAZOP STUDY Title:';
    coverSheet.mergeCells('D13:G13');
    coverSheet.getCell('D13').value = hazop?.hazopTitle || '';

    // Team Section
    coverSheet.mergeCells('B17:G17');
    coverSheet.getCell('B17').value = 'Pre-execution approval of Team Members';
    coverSheet.getCell('B17').font = { bold: true, underline: true };
    coverSheet.getCell('B17').alignment = { horizontal: 'center' };

    let currentRow = 20;
    team.forEach((member, index) => {
        const row = coverSheet.getRow(currentRow);
        row.getCell(2).value = index + 1;
        row.getCell(3).value = `${member.firstName} ${member.lastName}`;
        row.getCell(5).value = member.dimension3;
        coverSheet.mergeCells(`C${currentRow}:D${currentRow}`);
        coverSheet.mergeCells(`E${currentRow}:F${currentRow}`);
        currentRow++;
    });

    // -------------------------------
    // HAZOP WORKSHEET
    // -------------------------------
    const workSheet = workbook.addWorksheet('Hazop Worksheet');

    workSheet.columns = [
        { width: 5 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, 
        { width: 25 }, { width: 30 }, { width: 30 }, { width: 30 },
        { width: 5 }, { width: 5 }, { width: 5 }, 
        { width: 30 }, { width: 15 },
        { width: 5 }, { width: 5 }, { width: 5 }
    ];

    let wsRow = 1;

    nodes.forEach((node) => {
        addHeaderBlock(workSheet, hazop, wsRow);
        wsRow += 8;

        // Node Info
        workSheet.getCell(`B${wsRow}`).value = 'Node No:';
        workSheet.getCell(`C${wsRow}`).value = node.nodeNumber;
        workSheet.getCell(`H${wsRow}`).value = 'Date:';
        workSheet.getCell(`I${wsRow}`).value = formatDate(node.creationDate);
        wsRow++;

        // Design Intent
        workSheet.getCell(`B${wsRow}`).value = 'Design Intent:';
        workSheet.mergeCells(`C${wsRow}:Q${wsRow}`);
        workSheet.getCell(`C${wsRow}`).value = node.designIntent;
        wsRow++;

        // Table Header
        workSheet.getCell(`B${wsRow}`).value = 'General Param';
        workSheet.getCell(`C${wsRow}`).value = 'Specific Param';
        workSheet.getCell(`E${wsRow}`).value = 'Guide Word';
        workSheet.getCell(`F${wsRow}`).value = 'Deviation';
        // ... other headers

        wsRow++;

        // Table Data (per detail)
        const details = nodeDetails[node.id] || [];
        details.forEach((det) => {
            const row = workSheet.getRow(wsRow);

            row.getCell(2).value = det.generalParameter;
            row.getCell(3).value = det.specificParameter;
            row.getCell(5).value = det.guidWord;

            const recs = nodeRecommendations[node.id]?.[det.id] || [];
            row.getCell(13).value = recs.map(r => r.recommendation).join("\n");

            wsRow++;
        });

        wsRow += 3; // spacing
    });

    // -------------------------------
    // RISK MATRIX
    // -------------------------------
    const riskSheet = workbook.addWorksheet('Risk Matrix');
    addHeaderBlock(riskSheet, hazop);

    riskSheet.getCell('B10').value = '1.0 RISK MATRIX USED FOR THE STUDY';
    riskSheet.getCell('B10').font = { bold: true };

    // -------------------------------
    // DOWNLOAD
    // -------------------------------
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Hazop_Report_${hazopId}.xlsx`);
}
