import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
 
// --- CONSTANTS & STYLES ---
 
const COLORS = {
    GREEN: 'FF92D050',   // 1-5 Trivial (Light Green)
    YELLOW: 'FFFFFF00',  // 6-10 Tolerable (Yellow)
    ORANGE: 'FFFFC000',  // 12-15 Moderate (Orange)
    RED_ORANGE: 'FFFF0000', // 16-19 Substantial (Red)
    RED: 'FFC00000',      // 20-25 Intolerable (Dark Red)
    HEADER_BG: 'FFD9D9D9', // Light Grey for Table Headers
    SUB_HEADER_BG: 'FFEFEFEF' // Lighter Grey
};
 
// Formats date to DD/MM/YYYY
const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB");
};
 
// Returns ARGB color based on Risk Score
const getRiskColorArgb = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return 'FFFFFFFF';
    if (num >= 20) return COLORS.RED;
    if (num >= 16) return COLORS.RED_ORANGE;
    if (num >= 12) return COLORS.ORANGE;
    if (num >= 6) return COLORS.YELLOW;
    return COLORS.GREEN;
};
 
// Helper to apply thin borders
const applyBorder = (cell, style = "thin") => {
    cell.border = {
        top: { style: style },
        left: { style: style },
        bottom: { style: style },
        right: { style: style }
    };
};
 
// Helper for bold, centered header cells
const styleHeaderCell = (cell) => {
    cell.font = { bold: true, size: 10, name: 'Arial' };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    applyBorder(cell);
};
 
// Helper for data cells
const styleDataCell = (cell, alignLeft = false) => {
    cell.font = { size: 10, name: 'Arial' };
    cell.alignment = { vertical: 'top', horizontal: alignLeft ? 'left' : 'center', wrapText: true };
    applyBorder(cell);
};
 
// --- REUSABLE HEADER (ROWS 1-8) ---
// This replicates the header found in "H-TC-HAZOP-COVER.csv" and others
const addCommonHeader = (sheet, hazop, pageNum, totalPages) => {
    // Row 1 is usually a narrow margin
    sheet.getRow(1).height = 10;
 
    // Document No & Form No
    sheet.mergeCells('G2:H2'); sheet.getCell('G2').value = 'Document No.'; sheet.getCell('G2').font = { bold: true, name: 'Arial', size: 10 };
    sheet.mergeCells('I2:L2'); sheet.getCell('I2').value = 'FORM/H/TC/17'; sheet.getCell('I2').alignment = { horizontal: 'center' };
   
    // Document Name
    sheet.mergeCells('G3:H3'); sheet.getCell('G3').value = 'Document Name'; sheet.getCell('G3').font = { bold: true, name: 'Arial', size: 10 };
    sheet.mergeCells('I3:L3'); sheet.getCell('I3').value = 'Hazop Study Report'; sheet.getCell('I3').alignment = { horizontal: 'center' };
   
    // Issue No & Date
    sheet.mergeCells('G4:H4'); sheet.getCell('G4').value = 'Issue No'; sheet.getCell('G4').font = { bold: true, name: 'Arial', size: 10 };
    sheet.getCell('I4').value = '03'; sheet.getCell('I4').alignment = { horizontal: 'center' };
    sheet.getCell('J4').value = 'Dated'; sheet.getCell('J4').font = { bold: true, name: 'Arial', size: 10 };
    sheet.mergeCells('K4:L4'); sheet.getCell('K4').value = '2022-09-26'; // Static Issue Date
   
    // Revision No & Date
    sheet.mergeCells('G5:H5'); sheet.getCell('G5').value = 'Revision No.'; sheet.getCell('G5').font = { bold: true, name: 'Arial', size: 10 };
    sheet.getCell('I5').value = hazop?.hazopRevisionNo || '00'; sheet.getCell('I5').alignment = { horizontal: 'center' };
    sheet.getCell('J5').value = 'Dated'; sheet.getCell('J5').font = { bold: true, name: 'Arial', size: 10 };
    sheet.mergeCells('K5:L5'); sheet.getCell('K5').value = formatDate(hazop?.hazopCreationDate);
   
    // Initials & Page No
    sheet.mergeCells('G6:H6'); sheet.getCell('G6').value = 'MBS'; sheet.getCell('G6').font = { bold: true };
    sheet.getCell('I6').value = 'PS'; sheet.getCell('I6').font = { bold: true };
    sheet.getCell('J6').value = 'VJD'; sheet.getCell('J6').font = { bold: true };
    sheet.mergeCells('K6:L6'); sheet.getCell('K6').value = 'Page';
   
    // Signatures placeholders
    sheet.mergeCells('G7:H7');
    sheet.getCell('I7').value = '';
    sheet.getCell('J7').value = '';
    sheet.mergeCells('K7:L7'); sheet.getCell('K7').value = `${pageNum} of ${totalPages}`; sheet.getCell('K7').alignment = { horizontal: 'center', vertical: 'middle' };
 
    // Approval Titles
    sheet.mergeCells('G8:H8'); sheet.getCell('G8').value = 'Prepared By'; sheet.getCell('G8').font = { bold: true };
    sheet.getCell('I8').value = 'Reviewed By'; sheet.getCell('I8').font = { bold: true };
    sheet.getCell('J8').value = 'Approved By'; sheet.getCell('J8').font = { bold: true };
   
    // Apply borders and alignment to the header block (Row 2 to 8, Col G to L)
    for (let r = 2; r <= 8; r++) {
        for (let c = 7; c <= 12; c++) {
            applyBorder(sheet.getCell(r, c));
            sheet.getCell(r,c).alignment = { ...sheet.getCell(r,c).alignment, vertical: 'middle', horizontal: 'center' };
        }
    }
};
 
// --- MAIN GENERATOR FUNCTION ---
 
export async function generateHazopExcel({
    hazop,
    team = [],
    nodes = [],
    registrationNodes = [],
    nodeDetailsState = {},
    allRecommendations = [],
    mocReferences = [],
    verificationData = [],
    hazopId,
}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Alkyl Amines';
    workbook.created = new Date();
 
    // ==========================================
    // SHEET 1: COVER PAGE
    // ==========================================
    const coverSheet = workbook.addWorksheet('H-TC-HAZOP-COVER');
    // Align columns approx to A4 width
    coverSheet.columns = [
        { width: 5 }, { width: 20 }, { width: 25 }, { width: 15 }, { width: 15 },
        { width: 15 }, { width: 15 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }
    ];
    addCommonHeader(coverSheet, hazop, 1, 7);
 
    let cRow = 11;
    coverSheet.mergeCells(`B${cRow}:L${cRow}`);
    const titleCell = coverSheet.getCell(`B${cRow}`);
    titleCell.value = 'ALKYL AMINES CHEMICALS LTD';
    titleCell.font = { bold: true, size: 16, color: { argb: 'FF000080' }, name: 'Arial' };
    titleCell.alignment = { horizontal: 'center' };
    cRow += 2;
 
    coverSheet.getCell(`B${cRow}`).value = "HAZOP DETAILS";
    coverSheet.getCell(`B${cRow}`).font = { bold: true, underline: true };
    cRow++;
 
    const details = [
        { l: "Title", v: hazop?.hazopTitle }, { l: "Site", v: hazop?.site }, { l: "Department", v: hazop?.department },
        { l: "Revision", v: hazop?.hazopRevisionNo }, { l: "Start Date", v: formatDate(hazop?.hazopCreationDate) },
        { l: "Status", v: hazop?.completionStatus ? 'Completed' : 'Pending' }, { l: "Created By", v: hazop?.createdBy },
        { l: "Approved By", v: hazop?.verificationemployeeName }, { l: "Description", v: hazop?.description },
    ];
 
    details.forEach(i => {
        coverSheet.getCell(`B${cRow}`).value = i.l;
        coverSheet.getCell(`B${cRow}`).font = { bold: true };
        coverSheet.mergeCells(`C${cRow}:I${cRow}`);
        coverSheet.getCell(`C${cRow}`).value = i.v || '-';
        applyBorder(coverSheet.getCell(`B${cRow}`));
        applyBorder(coverSheet.getCell(`C${cRow}`));
        cRow++;
    });
    cRow++;
 
    // MOC References Table
    if (mocReferences.length > 0) {
        coverSheet.getCell(`B${cRow}`).value = "MOC REFERENCES";
        coverSheet.getCell(`B${cRow}`).font = { bold: true, underline: true };
        cRow++;
       
        // Headers
        const mocHeaders = ['MOC No', 'Title', 'Plant', 'Dept', 'Date'];
        coverSheet.getCell(`B${cRow}`).value = mocHeaders[0]; styleHeaderCell(coverSheet.getCell(`B${cRow}`));
        coverSheet.mergeCells(`C${cRow}:E${cRow}`); coverSheet.getCell(`C${cRow}`).value = mocHeaders[1]; styleHeaderCell(coverSheet.getCell(`C${cRow}`));
        coverSheet.getCell(`F${cRow}`).value = mocHeaders[2]; styleHeaderCell(coverSheet.getCell(`F${cRow}`));
        coverSheet.getCell(`G${cRow}`).value = mocHeaders[3]; styleHeaderCell(coverSheet.getCell(`G${cRow}`));
        coverSheet.getCell(`H${cRow}`).value = mocHeaders[4]; styleHeaderCell(coverSheet.getCell(`H${cRow}`));
        cRow++;
 
        // Data
        mocReferences.forEach(moc => {
            coverSheet.getCell(`B${cRow}`).value = moc.mocNo; applyBorder(coverSheet.getCell(`B${cRow}`));
            coverSheet.mergeCells(`C${cRow}:E${cRow}`); coverSheet.getCell(`C${cRow}`).value = moc.mocTitle; applyBorder(coverSheet.getCell(`C${cRow}`));
            coverSheet.getCell(`F${cRow}`).value = moc.mocPlant; applyBorder(coverSheet.getCell(`F${cRow}`));
            coverSheet.getCell(`G${cRow}`).value = moc.mocDepartment; applyBorder(coverSheet.getCell(`G${cRow}`));
            coverSheet.getCell(`H${cRow}`).value = moc.mocDate; applyBorder(coverSheet.getCell(`H${cRow}`));
            cRow++;
        });
        cRow++;
    }
 
    // Team Table
    coverSheet.mergeCells(`B${cRow}:I${cRow}`);
    coverSheet.getCell(`B${cRow}`).value = 'Pre-execution approval of Team Members';
    coverSheet.getCell(`B${cRow}`).font = { bold: true, underline: true };
    cRow += 1;
 
    // Team Header
    coverSheet.getCell(`B${cRow}`).value = 'Sr. No.'; styleHeaderCell(coverSheet.getCell(`B${cRow}`));
    coverSheet.mergeCells(`C${cRow}:E${cRow}`); coverSheet.getCell(`C${cRow}`).value = 'Name'; styleHeaderCell(coverSheet.getCell(`C${cRow}`));
    coverSheet.mergeCells(`F${cRow}:H${cRow}`); coverSheet.getCell(`F${cRow}`).value = 'Department'; styleHeaderCell(coverSheet.getCell(`F${cRow}`));
    coverSheet.mergeCells(`I${cRow}:L${cRow}`); coverSheet.getCell(`I${cRow}`).value = 'Email'; styleHeaderCell(coverSheet.getCell(`I${cRow}`));
    cRow++;
 
    // Team Data
    const printRows = Math.max(team.length, 5); // Ensure at least 5 rows appear
    for (let i = 0; i < printRows; i++) {
        const m = team[i] || {};
        coverSheet.getCell(`B${cRow}`).value = i + 1; applyBorder(coverSheet.getCell(`B${cRow}`));
        coverSheet.mergeCells(`C${cRow}:E${cRow}`); coverSheet.getCell(`C${cRow}`).value = m.firstName ? `${m.firstName} ${m.lastName}` : ''; applyBorder(coverSheet.getCell(`C${cRow}`));
        coverSheet.mergeCells(`F${cRow}:H${cRow}`); coverSheet.getCell(`F${cRow}`).value = m.dimension3 || ''; applyBorder(coverSheet.getCell(`F${cRow}`));
        coverSheet.mergeCells(`I${cRow}:L${cRow}`); coverSheet.getCell(`I${cRow}`).value = m.emailId || ''; applyBorder(coverSheet.getCell(`I${cRow}`));
        cRow++;
    }
 
 
    // ==========================================
    // SHEET 2: NODE LIST
    // ==========================================
    const indexSheet = workbook.addWorksheet('H-TC-HAZOP-NODE LIST');
    indexSheet.columns = [{ width: 5 }, { width: 10 }, { width: 35 }, { width: 15 }, { width: 20 }, { width: 15 }, { width: 15 }];
    addCommonHeader(indexSheet, hazop, 2, 7);
 
    indexSheet.mergeCells('B12:G12');
    indexSheet.getCell('B12').value = 'INDEX OF HAZOP NODES';
    indexSheet.getCell('B12').font = { bold: true, underline: true };
 
    const idxHead = 14;
    const idxHeaders = ['Node', 'Design Intent / Title', 'Reg. Date', 'Equipment', 'SOP No.', 'Status'];
    ['B', 'C', 'D', 'E', 'F', 'G'].forEach((col, i) => {
        const cell = indexSheet.getCell(`${col}${idxHead}`);
        cell.value = idxHeaders[i];
        styleHeaderCell(cell);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.HEADER_BG } };
    });
 
    let idxRow = 15;
    const nodeListSource = (registrationNodes && registrationNodes.length > 0) ? registrationNodes : nodes;
   
    if (nodeListSource.length > 0) {
        nodeListSource.forEach(node => {
            indexSheet.getCell(`B${idxRow}`).value = node.nodeNumber || (node.nodeInfo?.nodeNumber) || '-'; styleDataCell(indexSheet.getCell(`B${idxRow}`));
            indexSheet.getCell(`C${idxRow}`).value = node.designIntent || '-'; styleDataCell(indexSheet.getCell(`C${idxRow}`), true);
            indexSheet.getCell(`D${idxRow}`).value = formatDate(node.registrationDate || node.creationDate); styleDataCell(indexSheet.getCell(`D${idxRow}`));
            indexSheet.getCell(`E${idxRow}`).value = node.equipment || '-'; styleDataCell(indexSheet.getCell(`E${idxRow}`));
            indexSheet.getCell(`F${idxRow}`).value = node.sopNo || '-'; styleDataCell(indexSheet.getCell(`F${idxRow}`));
            indexSheet.getCell(`G${idxRow}`).value = node.completionStatus ? "Completed" : "Pending"; styleDataCell(indexSheet.getCell(`G${idxRow}`));
            idxRow++;
        });
    }
 
    // ==========================================
    // SHEET 3: HAZOP DETAILS (The main dynamic sheet)
    // ==========================================
    const detailSheet = workbook.addWorksheet('H-TC-HAZOP-DETAILS');
    // Standard HAZOP columns (14 cols)
    detailSheet.columns = [
        { width: 15 }, { width: 15 }, { width: 12 }, { width: 20 }, { width: 25 }, { width: 25 },
        { width: 25 }, { width: 5 }, { width: 5 }, { width: 5 },
        { width: 30 }, { width: 5 }, { width: 5 }, { width: 5 }
    ];
    addCommonHeader(detailSheet, hazop, 3, 7);
 
    let dRow = 11; // Starting row after header
 
    if (nodes && nodes.length > 0) {
        nodes.forEach((node, nodeIdx) => {
            const nodeId = node.nodeInfo?.id || node.id;
            const details = nodeDetailsState[nodeId] || [];
 
            // --- 1. NODE INFORMATION BLOCK ---
            // Design matches typical HAZOP worksheets: Labels on Left, Merged Data on Right
            detailSheet.getCell(`A${dRow}`).value = 'Node No'; styleHeaderCell(detailSheet.getCell(`A${dRow}`));
            detailSheet.getCell(`B${dRow}`).value = node.nodeNumber || (node.nodeInfo?.nodeNumber) || '-'; applyBorder(detailSheet.getCell(`B${dRow}`));
            detailSheet.getCell(`B${dRow}`).alignment = { horizontal: 'left', vertical: 'middle' };
           
            detailSheet.getCell(`G${dRow}`).value = 'Date'; styleHeaderCell(detailSheet.getCell(`G${dRow}`));
            detailSheet.getCell(`K${dRow}`).value = formatDate(node.creationDate); applyBorder(detailSheet.getCell(`K${dRow}`));
            dRow++;
 
            const metaFields = [
                { label: 'Design Intent', val: node.designIntent },
                { label: 'SOP / Date', val: `${node.sopNo || ''} / ${formatDate(node.sopDate)}` },
                { label: 'Equipment', val: node.equipment },
                { label: 'Parameters', val: `Temp: ${node.temprature || '-'} | Press: ${node.pressure || '-'} | Flow: ${node.quantityFlowRate || '-'}` }
            ];
 
            metaFields.forEach(f => {
                detailSheet.getCell(`A${dRow}`).value = f.label; styleHeaderCell(detailSheet.getCell(`A${dRow}`));
                detailSheet.mergeCells(`B${dRow}:N${dRow}`);
                detailSheet.getCell(`B${dRow}`).value = f.val || '-';
                styleDataCell(detailSheet.getCell(`B${dRow}`), true);
                dRow++;
            });
            dRow++; // Spacer
 
            // --- 2. TABLE HEADER (Repeated once per Node as requested) ---
            const h1 = dRow;
            const h2 = dRow + 1;
           
            // Merged Headers (Top Row)
            detailSheet.mergeCells(`A${h1}:A${h2}`); detailSheet.getCell(`A${h1}`).value = 'General Param';
            detailSheet.mergeCells(`B${h1}:B${h2}`); detailSheet.getCell(`B${h1}`).value = 'Specific Param';
            detailSheet.mergeCells(`C${h1}:C${h2}`); detailSheet.getCell(`C${h1}`).value = 'Guide Word';
            detailSheet.mergeCells(`D${h1}:D${h2}`); detailSheet.getCell(`D${h1}`).value = 'Deviation';
            detailSheet.mergeCells(`E${h1}:E${h2}`); detailSheet.getCell(`E${h1}`).value = 'Causes';
            detailSheet.mergeCells(`F${h1}:F${h2}`); detailSheet.getCell(`F${h1}`).value = 'Consequences';
           
            detailSheet.mergeCells(`G${h1}:J${h1}`); detailSheet.getCell(`G${h1}`).value = 'Existing Control';
            detailSheet.mergeCells(`K${h1}:N${h1}`); detailSheet.getCell(`K${h1}`).value = 'Additional Control / Recommendations';
 
            // Sub Headers (Bottom Row)
            detailSheet.getCell(`G${h2}`).value = 'Control';
            detailSheet.getCell(`H${h2}`).value = 'P'; detailSheet.getCell(`I${h2}`).value = 'S'; detailSheet.getCell(`J${h2}`).value = 'R';
 
            detailSheet.getCell(`K${h2}`).value = 'Recommendation';
            detailSheet.getCell(`L${h2}`).value = 'P'; detailSheet.getCell(`M${h2}`).value = 'S'; detailSheet.getCell(`N${h2}`).value = 'R';
 
            // Styling Headers
            for (let r = h1; r <= h2; r++) {
                for (let c = 1; c <= 14; c++) {
                    const cell = detailSheet.getCell(r, c);
                    styleHeaderCell(cell);
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.HEADER_BG } };
                }
            }
            dRow += 2;
 
            // --- 3. DATA ROWS ---
            if (details.length > 0) {
                details.forEach(det => {
                    const r = detailSheet.getRow(dRow);
                   
                    // 1-6 Basic
                    r.getCell(1).value = det.generalParameter;
                    r.getCell(2).value = det.specificParameter;
                    r.getCell(3).value = det.guidWord;
                    r.getCell(4).value = det.deviation;
                    r.getCell(5).value = det.causes;
                    r.getCell(6).value = det.consequences;
                   
                    // 7-10 Existing
                    r.getCell(7).value = det.existineControl;
                    r.getCell(8).value = det.existineProbability;
                    r.getCell(9).value = det.existingSeverity;
                    r.getCell(10).value = det.riskRating;
                    const f1 = getRiskColorArgb(det.riskRating);
                    if (det.riskRating) r.getCell(10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: f1 } };
 
                    // 11-14 Additional / Recs
                    let recText = det.additionalControl || '';
                    if (det.recommendations && det.recommendations.length) {
                        // Formatting recommendations as bullet points in one cell
                        recText += (recText ? '\n' : '') + det.recommendations.map(x => `• ${x.recommendation}`).join('\n');
                    }
                    r.getCell(11).value = recText || '-';
                   
                    r.getCell(12).value = det.additionalProbability;
                    r.getCell(13).value = det.additionalSeverity;
                    r.getCell(14).value = det.additionalRiskRating;
                    const f2 = getRiskColorArgb(det.additionalRiskRating);
                    if (det.additionalRiskRating) r.getCell(14).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: f2 } };
 
                    // Apply Borders & Styling
                    for (let c = 1; c <= 14; c++) {
                        styleDataCell(r.getCell(c), true); // Align left
                    }
                    dRow++;
                });
            } else {
                detailSheet.mergeCells(`A${dRow}:N${dRow}`);
                detailSheet.getCell(`A${dRow}`).value = "No Details Found for this Node";
                styleDataCell(detailSheet.getCell(`A${dRow}`));
                dRow++;
            }
            dRow += 2; // Spacer between Nodes
        });
    }
 
    // ==========================================
    // SHEET 4: RECOMMENDATIONS
    // ==========================================
    const recSheet = workbook.addWorksheet('RECOMMENDATIONS');
    recSheet.columns = [{ width: 5 }, { width: 30 }, { width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 10 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 20 }, { width: 15 }];
    addCommonHeader(recSheet, hazop, 4, 7);
    recSheet.mergeCells('B10:M10'); recSheet.getCell('B10').value = "ALL RECOMMENDATIONS"; recSheet.getCell('B10').font = { bold: true, underline: true };
   
    let rHead = 12;
    const rHeaders = ['No.', 'Recommendation', 'Remark', 'Responsibility', 'Dept', 'Status', 'Date', 'Sent Verif?', 'Action', 'Verif Status', 'By', 'Email', 'V.Date'];
    rHeaders.forEach((h, i) => {
        const c = recSheet.getCell(rHead, i + 2);
        c.value = h;
        styleHeaderCell(c);
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.HEADER_BG } };
    });
   
    let rRow = 13;
    allRecommendations.forEach((rec, i) => {
        const row = recSheet.getRow(rRow);
        const values = [
            i + 1, rec.recommendation, rec.remarkbyManagement, rec.responsibility, rec.department,
            rec.completionStatus ? 'Completed' : 'Pending', formatDate(rec.completionDate),
            rec.sendForVerification ? 'Yes' : 'No', rec.sendForVerificationAction ? 'Taken' : 'None',
            rec.sendForVerificationActionStatus ? 'Approved' : 'Rejected', rec.verificationResponsibleEmployeeName,
            rec.verificationResponsibleEmployeeEmail, formatDate(rec.verificationDate)
        ];
        values.forEach((v, idx) => {
            row.getCell(idx + 2).value = v || '-';
            styleDataCell(row.getCell(idx + 2), idx === 1);
        });
        rRow++;
    });
 
    // ==========================================
    // SHEET 5: CONFIRMATION SUMMARY
    // ==========================================
    const confSheet = workbook.addWorksheet('CONFIRMATION SUMMARY');
    confSheet.columns = [{ width: 5 }, { width: 30 }, { width: 15 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 15 }];
    addCommonHeader(confSheet, hazop, 5, 7);
    confSheet.mergeCells('B10:G10'); confSheet.getCell('B10').value = "CONFIRMATION / VERIFICATION"; confSheet.getCell('B10').font = { bold: true, underline: true };
   
    const cHeaders = ['No.', 'Recommendation', 'Status', 'Verif. Action', 'Verified By', 'Email', 'Date'];
    cHeaders.forEach((h, i) => {
        const c = confSheet.getCell(12, i + 2);
        c.value = h;
        styleHeaderCell(c);
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.HEADER_BG } };
    });
   
    let cRowIdx = 13;
    verificationData.forEach((v, i) => {
        const row = confSheet.getRow(cRowIdx);
        const values = [
            i + 1, v.recommendation, v.completionStatus ? 'Completed' : 'Pending',
            v.sendForVerificationAction ? 'Approved' : 'Rejected', v.verificationResponsibleEmployeeName,
            v.verificationResponsibleEmployeeEmail, formatDate(v.verificationDate)
        ];
        values.forEach((val, idx) => { row.getCell(idx + 2).value = val || '-'; styleDataCell(row.getCell(idx + 2), idx === 1); });
        cRowIdx++;
    });
 
 
    // ==========================================
    // SHEET 6: TABLE 1 (RISK MATRIX)
    // ==========================================
    const t1Sheet = workbook.addWorksheet('H-TC-HAZOP-TABLE 1');
    t1Sheet.columns = [{ width: 5 }, { width: 5 }, { width: 8 }, { width: 2 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }];
    addCommonHeader(t1Sheet, hazop, 6, 7);
 
    t1Sheet.getCell('B10').value = '1.0 RISK MATRIX';
    t1Sheet.getCell('B10').font = { bold: true, underline: true };
 
    // Probability Header (Top)
    t1Sheet.mergeCells('E12:I12');
    const probLabel = t1Sheet.getCell('E12');
    probLabel.value = "PROBABILITY";
    styleHeaderCell(probLabel);
    probLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.HEADER_BG } };
 
    const probHeaders = [
        { val: 1, desc: "< 1 in 10 yr" }, { val: 2, desc: "< 1 in 5 yr" },
        { val: 3, desc: "< 1 in 1 yr" }, { val: 4, desc: "< 1 in Month" }, { val: 5, desc: "< 1 in Week" }
    ];
 
    probHeaders.forEach((p, idx) => {
        const cell = t1Sheet.getCell(13, 5 + idx);
        cell.value = `${p.val}\n${p.desc}`;
        cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
        cell.font = { bold: true, size: 9 };
        applyBorder(cell);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SUB_HEADER_BG } };
    });
 
    // Severity Header (Left)
    t1Sheet.mergeCells('B14:B18');
    const sevLabel = t1Sheet.getCell('B14');
    sevLabel.value = "SEVERITY";
    styleHeaderCell(sevLabel);
    sevLabel.alignment = { textRotation: 90, vertical: 'middle', horizontal: 'center', bold: true };
    sevLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.HEADER_BG } };
 
    const severityRows = [
        { id: 1, desc: "Minor" }, { id: 2, desc: "Major" }, { id: 3, desc: "Critical" },
        { id: 4, desc: "Severe" }, { id: 5, desc: "Catastrophic" }
    ];
 
    let gridRowStart = 14;
    severityRows.forEach((sev) => {
        const sCell = t1Sheet.getCell(gridRowStart, 3);
        sCell.value = sev.id;
        styleHeaderCell(sCell);
        sCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SUB_HEADER_BG } };
 
        probHeaders.forEach((prob, pIdx) => {
            const riskValue = sev.id * prob.val;
            const cell = t1Sheet.getCell(gridRowStart, 5 + pIdx);
            cell.value = riskValue;
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { bold: true };
            applyBorder(cell);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getRiskColorArgb(riskValue) } };
        });
        gridRowStart++;
    });
 
 
    // ==========================================
    // SHEET 7: TABLE 2 (RISK LEVEL VS ACTION)
    // ==========================================
    const t2Sheet = workbook.addWorksheet('H-TC-HAZOP-TABLE 2');
    t2Sheet.columns = [{ width: 5 }, { width: 10 }, { width: 20 }, { width: 70 }];
    addCommonHeader(t2Sheet, hazop, 7, 7);
 
    t2Sheet.getCell('B10').value = '2.0 RISK LEVEL Vs ACTION';
    t2Sheet.getCell('B10').font = { bold: true, underline: true };
 
    const t2HeadRow = 12;
    ['Risk', 'Level', 'Action'].forEach((h, i) => {
        const c = t2Sheet.getCell(t2HeadRow, i + 2);
        c.value = h;
        styleHeaderCell(c);
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.HEADER_BG } };
    });
 
    const actionData = [
        { risk: "1 - 5", level: "TRIVIAL", color: COLORS.GREEN, action: "No action is required and no documentary records need to be kept." },
        { risk: "6 - 10", level: "TOLERABLE", color: COLORS.YELLOW, action: "No additional controls are required. Consideration may be given to a more cost-effective solution or improvement that imposes no additional cost burden. Monitoring is required to ensure that the controls are maintained." },
        { risk: "12 - 15", level: "MODERATE", color: COLORS.ORANGE, action: "Efforts should be made to reduce the risk, but the costs of prevention should be carefully measured and limited. Risk reduction measures should be implemented within a defined time period." },
        { risk: "16 - 19", level: "SUBSTANTIAL", color: COLORS.RED_ORANGE, action: "Activity should not be started until the risk has been reduced. Considerable resources may have to be allocated to reduce the risk." },
        { risk: "20 - 25", level: "INTOLERABLE", color: COLORS.RED, action: "Activity should not be started or continued until the risk has been reduced. If it is not possible to reduce risk even with unlimited resources, activity has to remain prohibited." }
    ];
 
    let t2Row = 13;
    actionData.forEach(row => {
        const rCell = t2Sheet.getCell(t2Row, 2);
        rCell.value = row.risk; styleDataCell(rCell); rCell.alignment = { vertical: 'middle', horizontal: 'center' };
 
        const lCell = t2Sheet.getCell(t2Row, 3);
        lCell.value = row.level; styleDataCell(lCell); lCell.alignment = { vertical: 'middle', horizontal: 'center', bold: true };
        lCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row.color } };
 
        const aCell = t2Sheet.getCell(t2Row, 4);
        aCell.value = row.action; styleDataCell(aCell, true);
        t2Row++;
    });
 
    // Write File
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Hazop_Report_${hazopId || 'Export'}.xlsx`);
}
 