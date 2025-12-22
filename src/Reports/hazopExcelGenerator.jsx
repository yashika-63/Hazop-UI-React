import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatDate } from "../CommonUI/CommonUI";
import { strings } from "../string";

// --- CONFIGURATION & COLORS ---

const COLORS = {
    TRIVIAL: 'FF207229',      // #207229
    TOLERABLE: 'FF56A744',    // #56a744
    MODERATE: 'FFFEF65E',     // #fef65e
    SUBSTANTIAL: 'FFFA9201',  // #fa9201
    INTOLERABLE: 'FFF91111',  // #f91111

    HEADER_GREY: 'FFD9D9D9',  // Standard Header Grey
    WHITE: 'FFFFFFFF',        // Pure White
    TEXT_BLUE: 'FF000080',    // Company Title Blue
    BORDER_BLACK: 'FF000000'
};

// --- HELPERS ---

const getRiskColor = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return COLORS.WHITE;
    if (num >= 20) return COLORS.INTOLERABLE;
    if (num >= 16) return COLORS.SUBSTANTIAL;
    if (num >= 12) return COLORS.MODERATE;
    if (num >= 6) return COLORS.TOLERABLE;
    return COLORS.TRIVIAL;
};

// Standard cell border
const applyBorder = (cell, style = "thin") => {
    cell.border = {
        top: { style: style, color: { argb: COLORS.BORDER_BLACK } },
        left: { style: style, color: { argb: COLORS.BORDER_BLACK } },
        bottom: { style: style, color: { argb: COLORS.BORDER_BLACK } },
        right: { style: style, color: { argb: COLORS.BORDER_BLACK } }
    };
};

// Header: Grey BG, Bold
const styleHeader = (cell, bg = true, align = 'center') => {
    cell.font = { bold: true, name: 'Arial', size: 10 };
    cell.alignment = { vertical: 'middle', horizontal: align, wrapText: true };
    applyBorder(cell);
    if (bg) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.HEADER_GREY } };
    }
};

// Data: White BG, Regular
const styleData = (cell, align = 'center', wrap = true, bold = false) => {
    cell.font = { name: 'Arial', size: 10, bold: bold };
    cell.alignment = { vertical: 'top', horizontal: align, wrapText: wrap };
    applyBorder(cell);
};

// --- STYLE A4 PAGE (Columns B to I, Rows 2 to 42) ---
const styleA4Page = (sheet) => {
    // 1. Paint White Background
    for (let r = 2; r <= 42; r++) {
        for (let c = 2; c <= 9; c++) { // B=2, I=9
            const cell = sheet.getCell(r, c);
            if (!cell.fill) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.WHITE } };
            }
        }
    }

    // 2. Thick Border Around the "Paper" Edge (B2:I42)
    for (let c = 2; c <= 9; c++) sheet.getCell(2, c).border = { ...sheet.getCell(2, c).border, top: { style: 'medium' } };
    for (let c = 2; c <= 9; c++) sheet.getCell(42, c).border = { ...sheet.getCell(42, c).border, bottom: { style: 'medium' } };
    for (let r = 2; r <= 42; r++) sheet.getCell(r, 2).border = { ...sheet.getCell(r, 2).border, left: { style: 'medium' } };
    for (let r = 2; r <= 42; r++) sheet.getCell(r, 9).border = { ...sheet.getCell(r, 9).border, right: { style: 'medium' } };
};

// --- SPECIAL HEADER (For Cover/Completion B-I range only) ---
const addCompactHeader = (sheet, hazop, pageNo, totalPages) => {
    // Row 2: Document No
    sheet.getCell('F2').value = "Document No."; styleHeader(sheet.getCell('F2'), true);
    sheet.mergeCells('G2:I2'); sheet.getCell('G2').value = "FORM/H/TC/17"; styleHeader(sheet.getCell('G2'), false);

    // Row 3: Document Name
    sheet.getCell('F3').value = "Document Name"; styleHeader(sheet.getCell('F3'), true);
    sheet.mergeCells('G3:I3'); sheet.getCell('G3').value = "Hazop Study Report"; styleHeader(sheet.getCell('G3'), false);

    // Row 4: Issue / Date
    sheet.getCell('F4').value = "Issue No"; styleHeader(sheet.getCell('F4'), true);
    sheet.getCell('G4').value = hazop?.id || "00"; styleData(sheet.getCell('G4'));
    sheet.getCell('H4').value = "Date"; styleHeader(sheet.getCell('H4'), true);
    sheet.getCell('I4').value = formatDate(hazop?.hazopCreationDate); styleData(sheet.getCell('I4'));

    // Row 5: Rev / Date
    sheet.getCell('F5').value = "Rev No"; styleHeader(sheet.getCell('F5'), true);
    sheet.getCell('G5').value = hazop?.hazopRevisionNo || "00"; styleData(sheet.getCell('G5'));
    sheet.getCell('H5').value = "Date"; styleHeader(sheet.getCell('H5'), true);
    sheet.getCell('I5').value = formatDate(hazop?.completionDate || new Date()); styleData(sheet.getCell('I5'));

    // Row 6: Page No
    sheet.mergeCells('F6:H6'); sheet.getCell('F6').value = "Page"; styleHeader(sheet.getCell('F6'), true);
    sheet.getCell('I6').value = `${pageNo} Of ${totalPages}`; styleData(sheet.getCell('I6'));

    // Row 7: Sign Titles
    sheet.getCell('F7').value = ""; applyBorder(sheet.getCell('F7')); // Spacer
    sheet.getCell('G7').value = "Prepared By"; styleHeader(sheet.getCell('G7'), true);
    sheet.getCell('H7').value = "Reviewed By"; styleHeader(sheet.getCell('H7'), true);
    sheet.getCell('I7').value = "Approved By"; styleHeader(sheet.getCell('I7'), true);

    // Row 8: Signatures / Names
    sheet.getCell('F8').value = "Sign"; styleHeader(sheet.getCell('F8'), true);
    sheet.getCell('G8').value = hazop?.createdBy || "-"; styleData(sheet.getCell('G8'));
    sheet.getCell('H8').value = hazop?.verificationemployeeName || "-"; styleData(sheet.getCell('H8'));
    sheet.getCell('I8').value = hazop?.completionEmployeeName || "-"; styleData(sheet.getCell('I8'));
};


// --- DYNAMIC REPORT HEADER ---
// Matches the header width to the specific sheet's last column
const addReportHeader = (sheet, hazop, pageNo, totalPages, lastColIndex) => {

    // Determine Start Column: 
    // If table is wide (>10 cols), start at G (7). 
    // If table is narrow (<=10 cols), start at B (2) to ensure we have enough room.
    const startCol = lastColIndex > 10 ? 7 : 2;
    const endCol = lastColIndex;

    // Helper to divide columns evenly for 3 or 4 item rows
    const getRange = (count, index) => {
        const totalWidth = endCol - startCol + 1;
        const span = totalWidth / count;
        const s = Math.floor(startCol + (span * index));
        const e = (index === count - 1) ? endCol : Math.floor(startCol + (span * (index + 1)) - 1);
        return { s, e };
    };

    // Helper for 2-column rows (Label | Value) - Label gets approx 25-30%
    const getLabelValueSplit = () => {
        // e.g. Start 7, End 16 (10 cols). Label 7-8 (2 cols), Value 9-16 (8 cols)
        const labelEnd = startCol + (lastColIndex > 10 ? 1 : 1);
        return { labelEnd, valStart: labelEnd + 1 };
    };

    const lv = getLabelValueSplit();

    // Row 2: Document No
    sheet.mergeCells(2, startCol, 2, lv.labelEnd);
    const c2a = sheet.getCell(2, startCol); c2a.value = "Document No."; styleHeader(c2a, true);

    sheet.mergeCells(2, lv.valStart, 2, endCol);
    const c2b = sheet.getCell(2, lv.valStart); c2b.value = "FORM/H/TC/17"; styleHeader(c2b, false);

    // Row 3: Document Name
    sheet.mergeCells(3, startCol, 3, lv.labelEnd);
    const c3a = sheet.getCell(3, startCol); c3a.value = "Document Name"; styleHeader(c3a, true);

    sheet.mergeCells(3, lv.valStart, 3, endCol);
    const c3b = sheet.getCell(3, lv.valStart); c3b.value = "Hazop Study Report"; styleHeader(c3b, false);

    // Row 4: Issue / Date (4 Parts)
    const r4p1 = getRange(4, 0);
    const r4p2 = getRange(4, 1);
    const r4p3 = getRange(4, 2);
    const r4p4 = getRange(4, 3);

    sheet.mergeCells(4, r4p1.s, 4, r4p1.e); sheet.getCell(4, r4p1.s).value = "Issue No"; styleHeader(sheet.getCell(4, r4p1.s), true);
    sheet.mergeCells(4, r4p2.s, 4, r4p2.e); sheet.getCell(4, r4p2.s).value = hazop?.id || "-"; styleData(sheet.getCell(4, r4p2.s));
    sheet.mergeCells(4, r4p3.s, 4, r4p3.e); sheet.getCell(4, r4p3.s).value = "Dated"; styleHeader(sheet.getCell(4, r4p3.s), true);
    sheet.mergeCells(4, r4p4.s, 4, r4p4.e); sheet.getCell(4, r4p4.s).value = formatDate(hazop?.hazopCreationDate); styleData(sheet.getCell(4, r4p4.s));

    // Row 5: Revision / Date (4 Parts)
    sheet.mergeCells(5, r4p1.s, 5, r4p1.e); sheet.getCell(5, r4p1.s).value = "Revision No."; styleHeader(sheet.getCell(5, r4p1.s), true);
    sheet.mergeCells(5, r4p2.s, 5, r4p2.e); sheet.getCell(5, r4p2.s).value = hazop?.hazopRevisionNo || "00"; styleData(sheet.getCell(5, r4p2.s));
    sheet.mergeCells(5, r4p3.s, 5, r4p3.e); sheet.getCell(5, r4p3.s).value = "Dated"; styleHeader(sheet.getCell(5, r4p3.s), true);
    sheet.mergeCells(5, r4p4.s, 5, r4p4.e); sheet.getCell(5, r4p4.s).value = formatDate(hazop?.completionDate || new Date()); styleData(sheet.getCell(5, r4p4.s));

    // Row 6: MBS, PS, VJD, Page (4 Parts)
    sheet.mergeCells(6, r4p1.s, 6, r4p1.e); sheet.getCell(6, r4p1.s).value = "MBS"; styleHeader(sheet.getCell(6, r4p1.s), true);
    sheet.mergeCells(6, r4p2.s, 6, r4p2.e); sheet.getCell(6, r4p2.s).value = "PS"; styleHeader(sheet.getCell(6, r4p2.s), true);
    sheet.mergeCells(6, r4p3.s, 6, r4p3.e); sheet.getCell(6, r4p3.s).value = "VJD"; styleHeader(sheet.getCell(6, r4p3.s), true);
    sheet.mergeCells(6, r4p4.s, 6, r4p4.e); sheet.getCell(6, r4p4.s).value = "Page"; styleHeader(sheet.getCell(6, r4p4.s), true);

    // Row 7: Empty Data / Page No
    sheet.mergeCells(7, r4p1.s, 7, r4p1.e); applyBorder(sheet.getCell(7, r4p1.s));
    sheet.mergeCells(7, r4p2.s, 7, r4p2.e); applyBorder(sheet.getCell(7, r4p2.s));
    sheet.mergeCells(7, r4p3.s, 7, r4p3.e); applyBorder(sheet.getCell(7, r4p3.s));
    sheet.mergeCells(7, r4p4.s, 7, r4p4.e); sheet.getCell(7, r4p4.s).value = `${pageNo} Of ${totalPages}`; styleData(sheet.getCell(7, r4p4.s));

    // Signatures (Row 8 Headers, Row 9 Data)
    // We split remaining width into 3 parts (Prepared, Reviewed, Approved) after the initial spacer/label col.

    const spacerEnd = r4p1.e;
    const sigStart = spacerEnd + 1;
    const sigTotalWidth = endCol - sigStart + 1;
    const sigSpan = sigTotalWidth / 3;

    const s1e = Math.floor(sigStart + sigSpan - 1);
    const s2e = Math.floor(sigStart + (sigSpan * 2) - 1);
    const s3e = endCol;

    // Row 8
    // sheet.mergeCells(8, r4p1.s, 8, spacerEnd); applyBorder(sheet.getCell(8, r4p1.s)); // Empty/Spacer
    sheet.mergeCells(8, sigStart, 8, s1e); sheet.getCell(8, sigStart).value = "Prepared By"; styleHeader(sheet.getCell(8, sigStart), true);
    sheet.mergeCells(8, s1e + 1, 8, s2e); sheet.getCell(8, s1e + 1).value = "Reviewed By"; styleHeader(sheet.getCell(8, s1e + 1), true);
    sheet.mergeCells(8, s2e + 1, 8, s3e); sheet.getCell(8, s2e + 1).value = "Approved By"; styleHeader(sheet.getCell(8, s2e + 1), true);

    // Row 9
    // sheet.mergeCells(9, r4p1.s, 9, spacerEnd); applyBorder(sheet.getCell(9, r4p1.s)); // Empty/Spacer
    sheet.mergeCells(9, sigStart, 9, s1e); sheet.getCell(9, sigStart).value = hazop?.createdBy || "-"; styleData(sheet.getCell(9, sigStart));
    sheet.mergeCells(9, s1e + 1, 9, s2e); sheet.getCell(9, s1e + 1).value = hazop?.verificationemployeeName || "-"; styleData(sheet.getCell(9, s1e + 1));
    sheet.mergeCells(9, s2e + 1, 9, s3e); sheet.getCell(9, s2e + 1).value = hazop?.completionEmployeeName || "-"; styleData(sheet.getCell(9, s2e + 1));
};


// --- MAIN EXPORT FUNCTION ---

export async function generateHazopExcel({
    hazop,
    team = [],
    nodes = [],
    registrationNodes = [],
    nodeDetailsState = {},
    allRecommendations = [],
    mocReferences = [],
    teamComments = [],
    documents = [],
    hazopId
}) {
    const workbook = new ExcelJS.Workbook();
    const TOTAL_PAGES = 7;
    // ==========================================
    // SHEET 1: COVER (A4 Page Style)
    // ==========================================
    const coverSheet = workbook.addWorksheet('H-TC-HAZOP-COVER', {
        views: [{ showGridLines: false }],
        pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true }
    });

    // Columns B to I width setup
    coverSheet.columns = [
        { width: 2 },  // A (Spacer)
        { width: 5 },  // B (Sr)
        { width: 20 }, // C
        { width: 15 }, // D
        { width: 15 }, // E
        { width: 15 }, // F (Header Start)
        { width: 15 }, // G
        { width: 15 }, // H
        { width: 15 }  // I (Header End)
    ];

    addCompactHeader(coverSheet, hazop, 1, TOTAL_PAGES);

    // -- Company Name Block (Rows 9-13) --
    coverSheet.mergeCells('B9:I13');
    const compCell = coverSheet.getCell('B9');
    compCell.value = "ALKYL AMINES CHEMICALS LIMITED";
    compCell.font = { bold: true, size: 18, name: 'Arial', color: { argb: COLORS.TEXT_BLUE } };
    compCell.alignment = { horizontal: 'center', vertical: 'middle' };
    applyBorder(compCell, 'medium');

    // -- Project Name Block (Rows 14-16) --
    coverSheet.mergeCells('B14:I16');
    const projCell = coverSheet.getCell('B14');
    projCell.value = `HAZOP STUDY: ${hazop?.hazopTitle || "Project Name"}`;
    projCell.font = { bold: true, size: 14, name: 'Arial' };
    projCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    applyBorder(projCell, 'medium');

    // -- Site Info --
    let cRow = 18;
    coverSheet.getCell(`B${cRow}`).value = "Site Name:";
    coverSheet.getCell(`B${cRow}`).font = { bold: true };
    coverSheet.mergeCells(`C${cRow}:I${cRow}`); coverSheet.getCell(`C${cRow}`).value = hazop?.site || "";
    cRow += 2;

    // -- MOC References --
    if (mocReferences && mocReferences.length > 0) {
        coverSheet.getCell(`B${cRow}`).value = "MOC REFERENCES";
        coverSheet.getCell(`B${cRow}`).font = { bold: true, underline: true };
        cRow++;

        coverSheet.getCell(`B${cRow}`).value = "No"; styleHeader(coverSheet.getCell(`B${cRow}`), true);
        coverSheet.mergeCells(`C${cRow}:F${cRow}`); coverSheet.getCell(`C${cRow}`).value = "Title"; styleHeader(coverSheet.getCell(`C${cRow}`), true);
        coverSheet.mergeCells(`G${cRow}:H${cRow}`); coverSheet.getCell(`G${cRow}`).value = "Plant"; styleHeader(coverSheet.getCell(`G${cRow}`), true);
        coverSheet.getCell(`I${cRow}`).value = "Date"; styleHeader(coverSheet.getCell(`I${cRow}`), true);
        cRow++;

        mocReferences.forEach(moc => {
            coverSheet.getCell(`B${cRow}`).value = moc.mocNo; styleData(coverSheet.getCell(`B${cRow}`));
            coverSheet.mergeCells(`C${cRow}:F${cRow}`); coverSheet.getCell(`C${cRow}`).value = moc.mocTitle; styleData(coverSheet.getCell(`C${cRow}`), 'left');
            coverSheet.mergeCells(`G${cRow}:H${cRow}`); coverSheet.getCell(`G${cRow}`).value = moc.mocPlant; styleData(coverSheet.getCell(`G${cRow}`));
            coverSheet.getCell(`I${cRow}`).value = formatDate(moc.mocDate); styleData(coverSheet.getCell(`I${cRow}`));
            cRow++;
        });
        cRow += 2;
    }

    // -- Team Members --
    coverSheet.getCell(`B${cRow}`).value = "Pre-execution approval of Team Members";
    coverSheet.getCell(`B${cRow}`).font = { bold: true, underline: true };
    cRow++;

    coverSheet.getCell(`B${cRow}`).value = "Sr."; styleHeader(coverSheet.getCell(`B${cRow}`), true);
    coverSheet.mergeCells(`C${cRow}:E${cRow}`); coverSheet.getCell(`C${cRow}`).value = "Name"; styleHeader(coverSheet.getCell(`C${cRow}`), true);
    coverSheet.mergeCells(`F${cRow}:G${cRow}`); coverSheet.getCell(`F${cRow}`).value = "Department"; styleHeader(coverSheet.getCell(`F${cRow}`), true);
    coverSheet.mergeCells(`H${cRow}:I${cRow}`); coverSheet.getCell(`H${cRow}`).value = "Signature"; styleHeader(coverSheet.getCell(`H${cRow}`), true);
    cRow++;

    const teamList = team.length > 0 ? team : [{}, {}, {}, {}, {}];
    teamList.forEach((member, idx) => {
        let name = member.firstName ? `${member.firstName} ${member.lastName}` : "";
        if (member.role) {
            name += ` (${member.role})`;
        }

        // 1. SIGNATURE LOGIC UPDATE
        let signatureText = "";
        if (member.employeeActionTaken) {
            const signedDate = member.employeeActionTakenDate ? formatDate(member.employeeActionTakenDate) : "";
            signatureText = `Signed (${signedDate})`;
        }

        coverSheet.getCell(`B${cRow}`).value = idx + 1; styleData(coverSheet.getCell(`B${cRow}`));
        coverSheet.mergeCells(`C${cRow}:E${cRow}`); coverSheet.getCell(`C${cRow}`).value = name; styleData(coverSheet.getCell(`C${cRow}`), 'left');
        coverSheet.mergeCells(`F${cRow}:G${cRow}`); coverSheet.getCell(`F${cRow}`).value = member.dimension1 || ""; styleData(coverSheet.getCell(`F${cRow}`), 'left');
        coverSheet.mergeCells(`H${cRow}:I${cRow}`); coverSheet.getCell(`H${cRow}`).value = signatureText; styleData(coverSheet.getCell(`H${cRow}`));
        cRow++;
    });

    // -- Attached Documents --
    if (documents && documents.length > 0) {
        cRow += 2; // Add some spacing
        coverSheet.getCell(`B${cRow}`).value = "ATTACHED DOCUMENTS";
        coverSheet.getCell(`B${cRow}`).font = { bold: true, underline: true };
        cRow++;

        coverSheet.getCell(`B${cRow}`).value = "Sr."; styleHeader(coverSheet.getCell(`B${cRow}`), true);
        coverSheet.mergeCells(`C${cRow}:I${cRow}`);
        coverSheet.getCell(`C${cRow}`).value = "Document Name";
        styleHeader(coverSheet.getCell(`C${cRow}`), true);
        cRow++;

        documents.forEach((doc, idx) => {
            const fileName = doc.filePath ? doc.filePath.split(/[\\/]/).pop() : "Unnamed Document";
            const fileUrl = `http://${strings.localhost}/api/javaHazopDocument/view/${doc.id}`;

            coverSheet.getCell(`B${cRow}`).value = idx + 1;
            styleData(coverSheet.getCell(`B${cRow}`));

            coverSheet.mergeCells(`C${cRow}:I${cRow}`);
            const nameCell = coverSheet.getCell(`C${cRow}`);
            nameCell.value = { text: fileName, hyperlink: fileUrl };
            nameCell.font = { name: 'Arial', size: 10, color: { argb: 'FF0000FF' }, underline: true }; // Blue link style
            nameCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            applyBorder(nameCell);

            cRow++;
        });
    }

    // 2. MOVED DATE ROW HERE (Below Documents)
    cRow += 2; // Add spacing before Date
    coverSheet.getCell(`C${cRow}`).value = "DATE :";
    coverSheet.getCell(`C${cRow}`).font = { bold: true };
    coverSheet.getCell(`D${cRow}`).value = formatDate(new Date());

    styleA4Page(coverSheet);



    // ==========================================
    // 2. NODE LIST (Standard Grid)
    // Data range: B to H (Index 2 to 8) -> lastColIndex = 8
    // ==========================================
    const listSheet = workbook.addWorksheet('H-TC-HAZOP-NODE LIST', { pageSetup: { orientation: 'landscape' } });
    listSheet.columns = [
        { width: 8 }, // A
        { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 } // B-H
    ];
    addReportHeader(listSheet, hazop, 2, TOTAL_PAGES, 8); // Pass 8 as lastColIndex

    listSheet.getCell('A12').value = "LIST OF PROCESS ACTIVITIES";
    listSheet.getCell('A12').font = { bold: true, underline: true };

    const lHead = 15;
    listSheet.getCell(`B${lHead}`).value = "ACTIVITY NO."; styleHeader(listSheet.getCell(`B${lHead}`), true);
    listSheet.mergeCells(`C${lHead}:G${lHead}`); listSheet.getCell(`C${lHead}`).value = "DESCRIPTION"; styleHeader(listSheet.getCell(`C${lHead}`), true);
    listSheet.getCell(`H${lHead}`).value = "PAGE NO"; styleHeader(listSheet.getCell(`H${lHead}`), true);

    let lRow = 16;
    const nodesForList = (registrationNodes && registrationNodes.length > 0) ? registrationNodes : nodes;
    if (nodesForList && nodesForList.length > 0) {
        nodesForList.forEach(node => {
            const actNo = node.nodeNumber || (node.nodeInfo ? node.nodeInfo.nodeNumber : "-");
            listSheet.getCell(`B${lRow}`).value = actNo; styleData(listSheet.getCell(`B${lRow}`));
            listSheet.mergeCells(`C${lRow}:G${lRow}`);
            const desc = node.designIntent || (node.nodeInfo ? node.nodeInfo.designIntent : "") || "-";
            listSheet.getCell(`C${lRow}`).value = desc; styleData(listSheet.getCell(`C${lRow}`), 'left');
            listSheet.getCell(`H${lRow}`).value = "3"; styleData(listSheet.getCell(`H${lRow}`));
            lRow++;
        });
    }

    // ==========================================
    // 3. HAZOP DETAILS (Standard Grid)
    // Data range: C to P (Index 3 to 16) -> lastColIndex = 16
    // ==========================================
    const detailSheet = workbook.addWorksheet('H-TC-HAZOP-DETAILS', { pageSetup: { orientation: 'landscape' } });
    detailSheet.columns = [
        { width: 3 },  // A (Blank)
        { width: 3 },  // B (Blank)
        { width: 12 }, // C
        { width: 18 }, // D
        { width: 12 }, // E
        { width: 22 }, // F
        { width: 22 }, // G
        { width: 22 }, // H
        { width: 20 }, // I
        { width: 5 },  // J
        { width: 5 },  // K
        { width: 5 },  // L
        { width: 20 }, // M
        { width: 5 },  // N
        { width: 5 },  // O
        { width: 5 }   // P
    ];
    addReportHeader(detailSheet, hazop, 3, TOTAL_PAGES, 16); // Pass 16 as lastColIndex

    let dRow = 11;
    if (nodes && nodes.length > 0) {
        nodes.forEach(node => {
            const nInfo = node.nodeInfo || node;
            const nodeId = nInfo.id;
            const details = nodeDetailsState[nodeId] || [];

            // Node Details Headers
            detailSheet.getCell(`C${dRow}`).value = "Node No"; styleData(detailSheet.getCell(`C${dRow}`), 'left');
            detailSheet.getCell(`D${dRow}`).value = nInfo.nodeNumber || ""; styleData(detailSheet.getCell(`D${dRow}`), 'center');
            detailSheet.mergeCells(`F${dRow}:H${dRow}`); detailSheet.getCell(`F${dRow}`).value = "Hazop Worksheet No."; styleData(detailSheet.getCell(`F${dRow}`), 'right');
            detailSheet.mergeCells(`J${dRow}:L${dRow}`); detailSheet.getCell(`J${dRow}`).value = "Date auto filled"; styleData(detailSheet.getCell(`J${dRow}`), 'right');
            detailSheet.mergeCells(`M${dRow}:N${dRow}`); detailSheet.getCell(`M${dRow}`).value = formatDate(nInfo.creationDate); styleData(detailSheet.getCell(`M${dRow}`), 'center');
            dRow++;

            detailSheet.getCell(`C${dRow}`).value = "Design Intent"; styleData(detailSheet.getCell(`C${dRow}`), 'left');
            detailSheet.mergeCells(`D${dRow}:P${dRow}`); detailSheet.getCell(`D${dRow}`).value = nInfo.designIntent || ""; styleData(detailSheet.getCell(`D${dRow}`), 'left');
            dRow++;

            detailSheet.getCell(`C${dRow}`).value = "P & I D No. & Revision"; styleData(detailSheet.getCell(`C${dRow}`), 'left');
            detailSheet.mergeCells(`D${dRow}:P${dRow}`); detailSheet.getCell(`D${dRow}`).value = nInfo.pIdRevision || ""; styleData(detailSheet.getCell(`D${dRow}`), 'left');
            dRow++;

            detailSheet.getCell(`C${dRow}`).value = "SOP No and date"; styleData(detailSheet.getCell(`C${dRow}`), 'left');
            detailSheet.mergeCells(`D${dRow}:F${dRow}`); detailSheet.getCell(`D${dRow}`).value = `${nInfo.sopNo || ""} / ${formatDate(nInfo.sopDate)}`; styleData(detailSheet.getCell(`D${dRow}`), 'left');
            detailSheet.getCell(`G${dRow}`).value = "Title"; styleData(detailSheet.getCell(`G${dRow}`), 'center');
            detailSheet.mergeCells(`H${dRow}:P${dRow}`); detailSheet.getCell(`H${dRow}`).value = ""; styleData(detailSheet.getCell(`H${dRow}`), 'left');
            dRow++;

            detailSheet.getCell(`C${dRow}`).value = "Equipment"; styleData(detailSheet.getCell(`C${dRow}`), 'left');
            detailSheet.mergeCells(`D${dRow}:P${dRow}`); detailSheet.getCell(`D${dRow}`).value = nInfo.equipment || ""; styleData(detailSheet.getCell(`D${dRow}`), 'left');
            dRow++;

            detailSheet.getCell(`C${dRow}`).value = "Controls"; styleData(detailSheet.getCell(`C${dRow}`), 'left');
            detailSheet.mergeCells(`D${dRow}:P${dRow}`); detailSheet.getCell(`D${dRow}`).value = nInfo.controls || ""; styleData(detailSheet.getCell(`D${dRow}`), 'left');
            dRow++;

            detailSheet.mergeCells(`C${dRow}:D${dRow}`); detailSheet.getCell(`C${dRow}`).value = "Chemicals and utilities"; styleData(detailSheet.getCell(`C${dRow}`), 'left');
            detailSheet.mergeCells(`E${dRow}:G${dRow}`); detailSheet.getCell(`E${dRow}`).value = `Temperature, ${nInfo.temprature || nInfo.temperature || "-"} C`; styleData(detailSheet.getCell(`E${dRow}`));
            detailSheet.mergeCells(`H${dRow}:J${dRow}`); detailSheet.getCell(`H${dRow}`).value = `Pressure, ${nInfo.pressure || "-"} barg`; styleData(detailSheet.getCell(`H${dRow}`));
            detailSheet.mergeCells(`K${dRow}:P${dRow}`); detailSheet.getCell(`K${dRow}`).value = `Quantity / flow rate ${nInfo.quantityFlowRate || "-"}`; styleData(detailSheet.getCell(`K${dRow}`));
            dRow += 2;

            // Main Table Headers
            const h1 = dRow;
            const h2 = dRow + 1;
            detailSheet.mergeCells(`C${h1}:C${h2}`); detailSheet.getCell(`C${h1}`).value = "General Parameter";
            detailSheet.mergeCells(`D${h1}:D${h2}`); detailSheet.getCell(`D${h1}`).value = "Specific Parameter";
            detailSheet.mergeCells(`E${h1}:E${h2}`); detailSheet.getCell(`E${h1}`).value = "Guide word";
            detailSheet.mergeCells(`F${h1}:F${h2}`); detailSheet.getCell(`F${h1}`).value = "Deviation";
            detailSheet.mergeCells(`G${h1}:G${h2}`); detailSheet.getCell(`G${h1}`).value = "Causes";
            detailSheet.mergeCells(`H${h1}:H${h2}`); detailSheet.getCell(`H${h1}`).value = "Consequences";

            detailSheet.mergeCells(`I${h1}:L${h1}`); detailSheet.getCell(`I${h1}`).value = "Existing";
            detailSheet.getCell(`I${h2}`).value = "Controls";
            detailSheet.getCell(`J${h2}`).value = "P";
            detailSheet.getCell(`K${h2}`).value = "S";
            detailSheet.getCell(`L${h2}`).value = "R";

            detailSheet.mergeCells(`M${h1}:P${h1}`); detailSheet.getCell(`M${h1}`).value = "Additional";
            detailSheet.getCell(`M${h2}`).value = "Controls";
            detailSheet.getCell(`N${h2}`).value = "P";
            detailSheet.getCell(`O${h2}`).value = "S";
            detailSheet.getCell(`P${h2}`).value = "R";

            for (let r = h1; r <= h2; r++) {
                for (let c = 3; c <= 16; c++) {
                    styleHeader(detailSheet.getCell(r, c), true);
                }
            }
            dRow += 2;

            if (details.length > 0) {
                details.forEach(det => {
                    const row = detailSheet.getRow(dRow);
                    row.getCell(3).value = det.generalParameter;
                    row.getCell(4).value = det.specificParameter;
                    row.getCell(5).value = det.guidWord;
                    row.getCell(6).value = det.deviation;
                    row.getCell(7).value = det.causes;
                    row.getCell(8).value = det.consequences;
                    row.getCell(9).value = det.existineControl;
                    row.getCell(10).value = det.existineProbability;
                    row.getCell(11).value = det.existingSeverity;

                    const rCell = row.getCell(12);
                    rCell.value = det.riskRating;
                    if (det.riskRating) rCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getRiskColor(det.riskRating) } };

                    let recText = det.additionalControl || "";
                    if (det.recommendations && det.recommendations.length > 0) {
                        recText += (recText ? "\n" : "") + det.recommendations.map(r => `${r.recommendation}`).join("\n");
                    }
                    row.getCell(13).value = recText;
                    row.getCell(14).value = det.additionalProbability;
                    row.getCell(15).value = det.additionalSeverity;

                    const arCell = row.getCell(16);
                    arCell.value = det.additionalRiskRating;
                    if (det.additionalRiskRating) arCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getRiskColor(det.additionalRiskRating) } };

                    for (let c = 3; c <= 16; c++) styleData(row.getCell(c), 'left');
                    dRow++;
                });
            } else {
                detailSheet.mergeCells(`C${dRow}:P${dRow}`);
                detailSheet.getCell(`C${dRow}`).value = "No deviations recorded.";
                styleData(detailSheet.getCell(`C${dRow}`), 'center');
                dRow++;
            }
            dRow++;
        });
    }

    // ==========================================
    // 4. RECOMMENDATIONS (Standard Grid)
    // Data range: C to H (Index 3 to 8) -> lastColIndex = 8
    // ==========================================
    const recSheet = workbook.addWorksheet('RECOMMENDATIONS', { pageSetup: { orientation: 'landscape' } });
    recSheet.columns = [
        { width: 3 },  // A (Blank)
        { width: 10 },  // B (Blank)
        { width: 10 },  // C (Sr No)
        { width: 20 }, // D (Node No)
        { width: 25 }, // E (Recommendation)
        { width: 25 }, // F (Remark by Management)
        { width: 10 }, // G (Completion Status)
        { width: 10 }  // H (Completion Date)
    ];
    addReportHeader(recSheet, hazop, 4, TOTAL_PAGES, 8); // Pass 8 as lastColIndex

    recSheet.mergeCells('C10:H10');
    recSheet.getCell('C10').value = "Recommendation List for Approval of Management";
    recSheet.getCell('C10').font = { bold: true, size: 12 };
    recSheet.getCell('C10').alignment = { horizontal: 'center' };

    const rHead = 12;
    const rHeaders = ["Sr No", "Node No", "Recommendation", "Remark by Management", "Completion Status", "Date"];

    rHeaders.forEach((h, i) => {
        const cell = recSheet.getCell(rHead, i + 3);
        cell.value = h;
        styleHeader(cell, true);
    });

    let rRow = 13;
    if (allRecommendations && allRecommendations.length > 0) {
        allRecommendations.forEach((rec, idx) => {
            recSheet.getCell(`C${rRow}`).value = idx + 1;
            styleData(recSheet.getCell(`C${rRow}`));

            const nodeRef = rec.nodeNumber || (rec.javaHazopNode?.nodeNumber ? `${rec.javaHazopNode.nodeNumber}.${rec.javaHazopNodeDetail?.nodeDetailNumber || '0'}` : "-");
            recSheet.getCell(`D${rRow}`).value = nodeRef;
            styleData(recSheet.getCell(`D${rRow}`));

            recSheet.getCell(`E${rRow}`).value = rec.recommendation || "-";
            styleData(recSheet.getCell(`E${rRow}`), 'left');

            recSheet.getCell(`F${rRow}`).value = rec.remarkbyManagement || "-";
            styleData(recSheet.getCell(`F${rRow}`), 'left');

            const status = rec.completionStatus ? "Completed" : "Pending";
            recSheet.getCell(`G${rRow}`).value = status;
            styleData(recSheet.getCell(`G${rRow}`));
            if (rec.completionStatus) {
                recSheet.getCell(`G${rRow}`).font = { color: { argb: 'FF008000' }, bold: true };
            }

            recSheet.getCell(`H${rRow}`).value = rec.completionDate ? formatDate(rec.completionDate) : "-";
            styleData(recSheet.getCell(`H${rRow}`));

            rRow++;
        });
    } else {
        recSheet.mergeCells(`C${rRow}:H${rRow}`);
        recSheet.getCell(`C${rRow}`).value = "No recommendations found.";
        styleData(recSheet.getCell(`C${rRow}`), 'center');
    }

    // ==========================================
    // SHEET 5: COMPLETION (A4 Page Style)
    // ==========================================
    const compSheet = workbook.addWorksheet('HAZOP COMPLETION', {
        views: [{ showGridLines: false }],
        pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true }
    });

    compSheet.columns = [
        { width: 2 }, { width: 5 }, { width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
    ];

    addCompactHeader(compSheet, hazop, 5, TOTAL_PAGES);

    // Company (Rows 9-13)
    compSheet.mergeCells('B9:I13');
    const ccCell = compSheet.getCell('B9');
    ccCell.value = "ALKYL AMINES CHEMICALS LIMITED";
    ccCell.font = { bold: true, size: 18, name: 'Arial', color: { argb: COLORS.TEXT_BLUE } };
    ccCell.alignment = { horizontal: 'center', vertical: 'middle' };
    applyBorder(ccCell, 'medium');

    // Project (Rows 14-16)
    compSheet.mergeCells('B14:I16');
    const cpCell = compSheet.getCell('B14');
    cpCell.value = `COMPLETION CERTIFICATE: ${hazop?.hazopTitle || ""}`;
    cpCell.font = { bold: true, size: 14, name: 'Arial' };
    cpCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    applyBorder(cpCell, 'medium');

    // Status Area
    let compRow = 18;
    compSheet.getCell(`B${compRow}`).value = "Status:"; compSheet.getCell(`B${compRow}`).font = { bold: true };
    compSheet.getCell(`C${compRow}`).value = hazop?.completionStatus ? "COMPLETED" : "IN PROGRESS";
    compSheet.getCell(`C${compRow}`).border = { bottom: { style: 'thin' } };

    compSheet.getCell(`G${compRow}`).border = { bottom: { style: 'thin' } };
    compRow += 3;

    // Team Signatures Title
    compSheet.getCell(`B${compRow}`).value = "Closure Approvals"; compSheet.getCell(`B${compRow}`).font = { bold: true, underline: true };
    compRow += 2;

    // Table Header
    compSheet.getCell(`B${compRow}`).value = "Sr."; styleHeader(compSheet.getCell(`B${compRow}`), true);
    compSheet.mergeCells(`C${compRow}:E${compRow}`); compSheet.getCell(`C${compRow}`).value = "Name"; styleHeader(compSheet.getCell(`C${compRow}`), true);
    compSheet.mergeCells(`F${compRow}:G${compRow}`); compSheet.getCell(`F${compRow}`).value = "Signed On"; styleHeader(compSheet.getCell(`F${compRow}`), true);
    compSheet.mergeCells(`H${compRow}:I${compRow}`); compSheet.getCell(`H${compRow}`).value = "Status"; styleHeader(compSheet.getCell(`H${compRow}`), true);
    compRow++;

    // Data Mapping from teamComments API
    if (teamComments && teamComments.length > 0) {
        teamComments.forEach((member, idx) => {
            compSheet.getCell(`B${compRow}`).value = idx + 1;
            styleData(compSheet.getCell(`B${compRow}`));

            compSheet.mergeCells(`C${compRow}:E${compRow}`);
            compSheet.getCell(`C${compRow}`).value = member.signByEmpName || member.empCode || "-";
            styleData(compSheet.getCell(`C${compRow}`), 'left');

            compSheet.mergeCells(`F${compRow}:G${compRow}`);
            compSheet.getCell(`F${compRow}`).value = member.signedOn ? formatDate(member.signedOn) : "N/A";
            styleData(compSheet.getCell(`F${compRow}`), 'center');

            const statusText = member.sendForReviewAction ? "SIGNED" : "PENDING";
            compSheet.mergeCells(`H${compRow}:I${compRow}`);
            compSheet.getCell(`H${compRow}`).value = statusText;
            styleData(compSheet.getCell(`H${compRow}`));

            if (member.sendForReviewAction) {
                compSheet.getCell(`H${compRow}`).font = { color: { argb: 'FF008000' }, bold: true };
            }

            compRow++;
        });
    }

    styleA4Page(compSheet);

    // ==========================================
    // 6. TABLE 1 (Risk Matrix - All Data)
    // Data range: B to J (Index 2 to 10) -> lastColIndex = 10
    // ==========================================
    const t1Sheet = workbook.addWorksheet('H-TC-HAZOP-TABLE 1');
    t1Sheet.columns = [
        { width: 8 }, // A
        { width: 5 }, // B (Index)
        { width: 15 }, { width: 15 }, { width: 15 }, // C, D, E
        { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 } // F-J
    ];
    addReportHeader(t1Sheet, hazop, 6, TOTAL_PAGES, 10); // Pass 10 as lastColIndex

    t1Sheet.getCell('B11').value = "1.0  RISK MATRIX USED FOR THE STUDY";
    t1Sheet.getCell('B11').font = { bold: true, size: 12 };

    t1Sheet.mergeCells('B13:E13');
    const sevHeader = t1Sheet.getCell('B13');
    sevHeader.value = "SEVERITY OF CONSEQUENCES - S";
    styleHeader(sevHeader, true);

    const pLabels = [
        "1\nOnce in 10\nyears",
        "2\nOnce in five\nyears",
        "3\nOnce in a\nyear",
        "4\nOnce a month",
        "5\nOnce a week"
    ];

    let colIndex = 6;
    pLabels.forEach((lbl) => {
        const cell = t1Sheet.getCell(13, colIndex);
        cell.value = lbl;
        styleHeader(cell, true);
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        colIndex++;
    });

    t1Sheet.getCell('C14').value = "People(P)"; styleHeader(t1Sheet.getCell('C14'), true);
    t1Sheet.getCell('D14').value = "Assets(A)"; styleHeader(t1Sheet.getCell('D14'), true);
    t1Sheet.getCell('E14').value = "Environment (E)"; styleHeader(t1Sheet.getCell('E14'), true);

    const matrixRows = [
        { idx: 1, p: "Slight injury", a: "Slight damage", e: "Slight effect", vals: [1, 2, 3, 4, 5] },
        { idx: 2, p: "Minor injury", a: "Minor damage", e: "Minor effect", vals: [2, 4, 6, 8, 10] },
        { idx: 3, p: "Major injury", a: "Localised damage", e: "Localised effect", vals: [3, 6, 9, 12, 15] },
        { idx: 4, p: "Single Fatality", a: "Major damage", e: "Major effect", vals: [4, 8, 12, 16, 20] },
        { idx: 5, p: "Multiple\nFatalities", a: "Extensive damage", e: "Extensive effect", vals: [5, 10, 15, 20, 25] },
    ];

    let mRow = 15;
    matrixRows.forEach(row => {
        const idxCell = t1Sheet.getCell(`B${mRow}`);
        idxCell.value = row.idx;
        styleHeader(idxCell, true);

        const pCell = t1Sheet.getCell(`C${mRow}`);
        pCell.value = row.p;
        styleData(pCell, 'center');
        pCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        const aCell = t1Sheet.getCell(`D${mRow}`);
        aCell.value = row.a;
        styleData(aCell, 'center');
        aCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        const eCell = t1Sheet.getCell(`E${mRow}`);
        eCell.value = row.e;
        styleData(eCell, 'center');
        eCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        row.vals.forEach((val, vIdx) => {
            const cell = t1Sheet.getCell(mRow, 6 + vIdx);
            cell.value = val;
            styleHeader(cell, false);
            if (typeof getRiskColor === 'function') {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getRiskColor(val) } };
            }
        });
        mRow++;
    });

    // ==========================================
    // 7. TABLE 2 (Standard)
    // Data range: B to J (Index 2 to 10) -> lastColIndex = 10
    // ==========================================
    const t2Sheet = workbook.addWorksheet('H-TC-HAZOP-TABLE 2', { pageSetup: { orientation: 'landscape' } });
    t2Sheet.columns = [
        { width: 8 }, { width: 10 }, { width: 12 }, { width: 40 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 1 }, { width: 1 }
    ];
    addReportHeader(t2Sheet, hazop, 7, TOTAL_PAGES, 10); // Pass 10 as lastColIndex

    t2Sheet.getCell('B10').value = "Table-2"; t2Sheet.getCell('B10').font = { bold: true };
    t2Sheet.getCell('B11').value = "   2.0   RISK LEVEL Vs ACTION PLAN"; t2Sheet.getCell('B11').font = { bold: true };

    const t2Head = 13;
    t2Sheet.getCell(`B${t2Head}`).value = "Risk"; styleHeader(t2Sheet.getCell(`B${t2Head}`), true);
    t2Sheet.getCell(`C${t2Head}`).value = "Risk level"; styleHeader(t2Sheet.getCell(`C${t2Head}`), true);
    t2Sheet.mergeCells(`D${t2Head}:J${t2Head}`); t2Sheet.getCell(`D${t2Head}`).value = "Action and time scale"; styleHeader(t2Sheet.getCell(`D${t2Head}`), true);

    const actionData = [
        { r: "1,2,3,4,5", l: "Trivial", c: COLORS.TRIVIAL, a: "No action required and no documentary records need to be kept" },
        { r: "6,8,9,10", l: "Tolerable", c: COLORS.TOLERABLE, a: "No  additional  controls  are  required.  Consideration  may  be  given  to  a  more  cost\neffective solution or moderate improvement that imposes no additional cost burden. Monitoring is required to ensure that the controls are maintained." },
        { r: "12,15,", l: "Moderate", c: COLORS.MODERATE, a: "Efforts  should  be  made  to  reduce  the  risk,  but  the  \ncost  of  prevention  should  be\ncarefully measured and limited. Risk reduction measures should be implemented" },
        { r: "16,18", l: "Substantial", c: COLORS.SUBSTANTIAL, a: "Work should not be started until the risk has been reduced. Considerable resources\nmay have to be allocated to reduce the risk where the risk involves work in progress, urgent action should be taken." },
        { r: "20,25", l: "Intolerable", c: COLORS.INTOLERABLE, a: "Work should not be started or continued until the risk has been reduced, if it is not possible  to  reduce  the  risk  even  with  unlimited  resources,  work  has  to  remain\nprohibited." }
    ];

    let aRow = 14;
    actionData.forEach(row => {
        t2Sheet.getCell(`B${aRow}`).value = row.r; styleData(t2Sheet.getCell(`B${aRow}`));
        t2Sheet.getCell(`C${aRow}`).value = row.l; styleData(t2Sheet.getCell(`C${aRow}`));
        t2Sheet.getCell(`C${aRow}`).font = { bold: true };
        t2Sheet.getCell(`C${aRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row.c } };
        t2Sheet.mergeCells(`D${aRow}:J${aRow}`); t2Sheet.getCell(`D${aRow}`).value = row.a; styleData(t2Sheet.getCell(`D${aRow}`), 'left');
        t2Sheet.getCell(`D${aRow}`).alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
        t2Sheet.getRow(aRow).height = 45;
        aRow++;
    });

    // WRITE FILE
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Hazop_Study_Report_${hazopId || "Export"}.xlsx`);
}