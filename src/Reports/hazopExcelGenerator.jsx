import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatDate } from "../CommonUI/CommonUI";

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
    // Top (Row 2, B-I)
    for (let c = 2; c <= 9; c++) sheet.getCell(2, c).border = { ...sheet.getCell(2, c).border, top: { style: 'medium' } };
    // Bottom (Row 42, B-I)
    for (let c = 2; c <= 9; c++) sheet.getCell(42, c).border = { ...sheet.getCell(42, c).border, bottom: { style: 'medium' } };
    // Left (B2:B42)
    for (let r = 2; r <= 42; r++) sheet.getCell(r, 2).border = { ...sheet.getCell(r, 2).border, left: { style: 'medium' } };
    // Right (I2:I42)
    for (let r = 2; r <= 42; r++) sheet.getCell(r, 9).border = { ...sheet.getCell(r, 9).border, right: { style: 'medium' } };
};



// --- SPECIAL HEADER (For Cover/Completion B-I range) ---
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


// --- COMMON HEADER BLOCK ---
const addReportHeader = (sheet, hazop, pageNo, totalPages) => {
    sheet.columns = [
        { width: 8 },  // A
        { width: 22 }, // B
        { width: 22 }, // C
        { width: 12 }, // D
        { width: 18 }, // E
        { width: 22 }, // F
        { width: 25 }, // G
        { width: 8 },  // H
        { width: 8 },  // I
        { width: 8 },  // J
        { width: 25 }, // K
        { width: 8 },  // L
        { width: 8 },  // M (Extra buffer)
        { width: 8 }   // N
    ];

    // Row 2-9 Logic (Document Control)
    sheet.mergeCells('G2:H2'); sheet.getCell('G2').value = "Document No."; styleHeader(sheet.getCell('G2'), true);
    sheet.mergeCells('I2:L2'); sheet.getCell('I2').value = "FORM/H/TC/17"; styleHeader(sheet.getCell('I2'), false);

    sheet.mergeCells('G3:H3'); sheet.getCell('G3').value = "Document Name"; styleHeader(sheet.getCell('G3'), true);
    sheet.mergeCells('I3:L3'); sheet.getCell('I3').value = "Hazop Study Report"; styleHeader(sheet.getCell('I3'), false);

    sheet.mergeCells('G4:H4'); sheet.getCell('G4').value = "Issue No"; styleHeader(sheet.getCell('G4'), true);
    sheet.getCell('I4').value = hazop?.hazopId || "-"; styleData(sheet.getCell('I4'));
    sheet.getCell('J4').value = "Dated"; styleHeader(sheet.getCell('J4'), true);
    sheet.mergeCells('K4:L4'); sheet.getCell('K4').value = formatDate(hazop?.hazopCreationDate); styleData(sheet.getCell('K4'));

    sheet.mergeCells('G5:H5'); sheet.getCell('G5').value = "Revision No."; styleHeader(sheet.getCell('G5'), true);
    sheet.getCell('I5').value = hazop?.hazopRevisionNo || "00"; styleData(sheet.getCell('I5'));
    sheet.getCell('J5').value = "Dated"; styleHeader(sheet.getCell('J5'), true);
    sheet.mergeCells('K5:L5'); sheet.getCell('K5').value = formatDate(hazop?.completionDate || new Date()); styleData(sheet.getCell('K5'));

    sheet.mergeCells('G6:H6'); sheet.getCell('G6').value = "MBS"; styleHeader(sheet.getCell('G6'), true);
    sheet.getCell('I6').value = "PS"; styleHeader(sheet.getCell('I6'), true);
    sheet.getCell('J6').value = "VJD"; styleHeader(sheet.getCell('J6'), true);
    sheet.mergeCells('K6:L6'); sheet.getCell('K6').value = "Page"; styleHeader(sheet.getCell('K6'), true);

    sheet.mergeCells('G7:H7'); applyBorder(sheet.getCell('G7'));
    sheet.getCell('I7').value = ""; applyBorder(sheet.getCell('I7'));
    sheet.getCell('J7').value = ""; applyBorder(sheet.getCell('J7'));
    sheet.mergeCells('K7:L7'); sheet.getCell('K7').value = `${pageNo} Of ${totalPages}`; styleData(sheet.getCell('K7'));

    sheet.mergeCells('G8:H8'); sheet.getCell('G8').value = "Prepared By"; styleHeader(sheet.getCell('G8'), true);
    sheet.mergeCells('I8:J8'); sheet.getCell('I8').value = "Reviewed By"; styleHeader(sheet.getCell('I8'), true);
    sheet.mergeCells('K8:L8'); sheet.getCell('K8').value = "Approved By"; styleHeader(sheet.getCell('K8'), true);

    sheet.mergeCells('G9:H9'); sheet.getCell('G9').value = hazop?.createdBy || "-"; styleData(sheet.getCell('G9'));
    sheet.mergeCells('I9:J9'); sheet.getCell('I9').value = hazop?.verificationemployeeName || "-"; styleData(sheet.getCell('I9'));
    sheet.mergeCells('K9:L9'); sheet.getCell('K9').value = hazop?.completionEmployeeName || "-"; styleData(sheet.getCell('K9'));
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
    hazopId
}) {
    const workbook = new ExcelJS.Workbook();
    const TOTAL_PAGES = 7;

    // ==========================================
    // SHEET 1: COVER (A4 Page Style)
    // ==========================================
    const coverSheet = workbook.addWorksheet('H-TC-HAZOP-COVER', {
        views: [{ showGridLines: false }], // Hide default Excel grid
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
    // FIX: Started at 14 to avoid overlap with row 13
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
    coverSheet.mergeCells(`F${cRow}:G${cRow}`); coverSheet.getCell(`F${cRow}`).value = "Designation"; styleHeader(coverSheet.getCell(`F${cRow}`), true);
    coverSheet.mergeCells(`H${cRow}:I${cRow}`); coverSheet.getCell(`H${cRow}`).value = "Signature"; styleHeader(coverSheet.getCell(`H${cRow}`), true);
    cRow++;

    const teamList = team.length > 0 ? team : [{}, {}, {}, {}, {}];
    teamList.forEach((member, idx) => {
        const name = member.firstName ? `${member.firstName} ${member.lastName}` : "";
        coverSheet.getCell(`B${cRow}`).value = idx + 1; styleData(coverSheet.getCell(`B${cRow}`));
        coverSheet.mergeCells(`C${cRow}:E${cRow}`); coverSheet.getCell(`C${cRow}`).value = name; styleData(coverSheet.getCell(`C${cRow}`), 'left');
        coverSheet.mergeCells(`F${cRow}:G${cRow}`); coverSheet.getCell(`F${cRow}`).value = member.dimension3 || ""; styleData(coverSheet.getCell(`F${cRow}`), 'left');
        coverSheet.mergeCells(`H${cRow}:I${cRow}`); coverSheet.getCell(`H${cRow}`).value = ""; styleData(coverSheet.getCell(`H${cRow}`));
        cRow++;
    });

    cRow++;
    coverSheet.getCell(`C${cRow}`).value = "DATE :"; coverSheet.getCell(`C${cRow}`).font = { bold: true };
    coverSheet.getCell(`D${cRow}`).value = formatDate(new Date());

    // Apply strict A4 styling to B2:I42
    styleA4Page(coverSheet);




    // ==========================================
    // 2. NODE LIST (Standard Grid)
    // ==========================================
    const listSheet = workbook.addWorksheet('H-TC-HAZOP-NODE LIST', { pageSetup: { orientation: 'landscape' } });
    addReportHeader(listSheet, hazop, 2, TOTAL_PAGES);

    listSheet.getCell('B12').value = "LIST OF PROCESS ACTIVITIES";
    listSheet.getCell('B12').font = { bold: true, underline: true };

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
    // ==========================================
    const detailSheet = workbook.addWorksheet('H-TC-HAZOP-DETAILS', { pageSetup: { orientation: 'landscape' } });
    addReportHeader(detailSheet, hazop, 3, TOTAL_PAGES);

    // Set widths for the new layout
    detailSheet.columns = [
        { width: 3 },  // A (Blank)
        { width: 3 },  // B (Blank)
        { width: 12 }, // C (Was A - General Param)
        { width: 18 }, // D (Was B)
        { width: 12 }, // E (Was C)
        { width: 22 }, // F (Was D)
        { width: 22 }, // G (Was E)
        { width: 22 }, // H (Was F)
        { width: 20 }, // I (Was G - Existing Control)
        { width: 5 },  // J (P)
        { width: 5 },  // K (S)
        { width: 5 },  // L (R)
        { width: 20 }, // M (Addl Control)
        { width: 5 },  // N (P)
        { width: 5 },  // O (S)
        { width: 5 }   // P (R)
    ];

    let dRow = 11;
    if (nodes && nodes.length > 0) {
        nodes.forEach(node => {
            const nInfo = node.nodeInfo || node;
            const nodeId = nInfo.id;
            const details = nodeDetailsState[nodeId] || [];

            // Node Details Headers (Shifted to start at C)
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

            // Main Table Headers (Shifted to C-P)
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
                for (let c = 3; c <= 16; c++) { // Column C(3) to P(16)
                    styleHeader(detailSheet.getCell(r, c), true);
                }
            }
            dRow += 2;

            // Deviations Row Logic (Shifted)
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
    // ==========================================
    const recSheet = workbook.addWorksheet('RECOMMENDATIONS', { pageSetup: { orientation: 'landscape' } });
    addReportHeader(recSheet, hazop, 4, TOTAL_PAGES);

    // Set column widths to accommodate the shift and wider text
    recSheet.columns = [
        { width: 3 },  // A (Blank)
        { width: 3 },  // B (Blank)
        { width: 6 },  // C (Sr No)
        { width: 10 }, // D (Node No)
        { width: 45 }, // E (Recommendation)
        { width: 25 }, // F (Remark by Management)
        { width: 15 }, // G (Completion Status)
        { width: 15 }  // H (Completion Date)
    ];

    recSheet.mergeCells('C10:H10');
    recSheet.getCell('C10').value = "Recommendation List for Approval of Management";
    recSheet.getCell('C10').font = { bold: true, size: 12 };
    recSheet.getCell('C10').alignment = { horizontal: 'center' };

    const rHead = 12;
    // Note: Headers start from Column C (index 3)
    const rHeaders = ["Sr No", "Node No", "Recommendation", "Remark by Management", "Completion Status", "Date"];

    rHeaders.forEach((h, i) => {
        const cell = recSheet.getCell(rHead, i + 3); // i + 3 starts at Column C
        cell.value = h;
        styleHeader(cell, true);
    });

    let rRow = 13;
    if (allRecommendations && allRecommendations.length > 0) {
        allRecommendations.forEach((rec, idx) => {
            // Col C: Sr No
            recSheet.getCell(`C${rRow}`).value = idx + 1;
            styleData(recSheet.getCell(`C${rRow}`));

            // Col D: Node No
            // Handle nested nodeNumber if available
            const nodeRef = rec.nodeNumber || (rec.javaHazopNode?.nodeNumber ? `${rec.javaHazopNode.nodeNumber}.${rec.javaHazopNodeDetail?.nodeDetailNumber || '0'}` : "-");
            recSheet.getCell(`D${rRow}`).value = nodeRef;
            styleData(recSheet.getCell(`D${rRow}`));

            // Col E: Recommendation
            recSheet.getCell(`E${rRow}`).value = rec.recommendation || "-";
            styleData(recSheet.getCell(`E${rRow}`), 'left');

            // Col F: Remark by Management
            recSheet.getCell(`F${rRow}`).value = rec.remarkbyManagement || "-";
            styleData(recSheet.getCell(`F${rRow}`), 'left');

            // Col G: Completion Status
            const status = rec.completionStatus ? "Completed" : "Pending";
            recSheet.getCell(`G${rRow}`).value = status;
            styleData(recSheet.getCell(`G${rRow}`));
            // Optional: color coding
            if (rec.completionStatus) {
                recSheet.getCell(`G${rRow}`).font = { color: { argb: 'FF008000' }, bold: true };
            }

            // Col H: Date
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
    // ==========================================
    // SHEET 5: COMPLETION (A4 Page Style) - RESTORED LAYOUT
    // ==========================================
    const compSheet = workbook.addWorksheet('HAZOP COMPLETION', {
        views: [{ showGridLines: false }],
        pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true }
    });

    // Keeping your original column widths exactly
    compSheet.columns = [
        { width: 2 }, { width: 5 }, { width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
    ];

    addCompactHeader(compSheet, hazop, 5, TOTAL_PAGES);

    // Company (Rows 9-13) - EXACT ORIGINAL LAYOUT
    compSheet.mergeCells('B9:I13');
    const ccCell = compSheet.getCell('B9');
    ccCell.value = "ALKYL AMINES CHEMICALS LIMITED";
    ccCell.font = { bold: true, size: 18, name: 'Arial', color: { argb: COLORS.TEXT_BLUE } };
    ccCell.alignment = { horizontal: 'center', vertical: 'middle' };
    applyBorder(ccCell, 'medium');

    // Project (Rows 14-16) - EXACT ORIGINAL LAYOUT
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

    // compSheet.getCell(`F${compRow}`).value = "Date:"; compSheet.getCell(`F${compRow}`).font = { bold: true };
    // Showing completion date if exists
    // compSheet.getCell(`G${compRow}`).value = hazop?.completionDate ? formatDate(hazop?.completionDate) : "PENDING";
    compSheet.getCell(`G${compRow}`).border = { bottom: { style: 'thin' } };
    compRow += 3;

    // Team Signatures Title
    compSheet.getCell(`B${compRow}`).value = "Closure Approvals"; compSheet.getCell(`B${compRow}`).font = { bold: true, underline: true };
    compRow += 2;

    // Table Header - RESTORED ORIGINAL MERGING
    compSheet.getCell(`B${compRow}`).value = "Sr."; styleHeader(compSheet.getCell(`B${compRow}`), true);
    compSheet.mergeCells(`C${compRow}:E${compRow}`); compSheet.getCell(`C${compRow}`).value = "Name"; styleHeader(compSheet.getCell(`C${compRow}`), true);
    compSheet.mergeCells(`F${compRow}:G${compRow}`); compSheet.getCell(`F${compRow}`).value = "Signed On"; styleHeader(compSheet.getCell(`F${compRow}`), true);
    compSheet.mergeCells(`H${compRow}:I${compRow}`); compSheet.getCell(`H${compRow}`).value = "Status"; styleHeader(compSheet.getCell(`H${compRow}`), true);
    compRow++;

    // Data Mapping from teamComments API
    if (teamComments && teamComments.length > 0) {
        teamComments.forEach((member, idx) => {
            // Sr No
            compSheet.getCell(`B${compRow}`).value = idx + 1;
            styleData(compSheet.getCell(`B${compRow}`));

            // Name (C-E)
            compSheet.mergeCells(`C${compRow}:E${compRow}`);
            compSheet.getCell(`C${compRow}`).value = member.signByEmpName || member.empCode || "-";
            styleData(compSheet.getCell(`C${compRow}`), 'left');

            // Signed On (F-G)
            compSheet.mergeCells(`F${compRow}:G${compRow}`);
            compSheet.getCell(`F${compRow}`).value = member.signedOn ? formatDate(member.signedOn) : "N/A";
            styleData(compSheet.getCell(`F${compRow}`), 'center');

            // Status (H-I)
            compSheet.mergeCells(`H${compRow}:I${compRow}`);
            const statusText = member.sendForReviewAction ? "SIGNED" : "PENDING";
            compSheet.getCell(`H${compRow}`).value = statusText;
            styleData(compSheet.getCell(`H${compRow}`));

            // Highlight signed rows in Green
            if (member.sendForReviewAction) {
                compSheet.getCell(`H${compRow}`).font = { color: { argb: 'FF008000' }, bold: true };
            }

            compRow++;
        });
    }

    styleA4Page(compSheet);

    // ==========================================
    // SHEET 6: TABLE 1 (Risk Matrix - All Data)
    // ==========================================
    const t1Sheet = workbook.addWorksheet('H-TC-HAZOP-TABLE 1');
    addReportHeader(t1Sheet, hazop, 6, TOTAL_PAGES);

    // 1. Title
    t1Sheet.getCell('B11').value = "1.0  RISK MATRIX USED FOR THE STUDY";
    t1Sheet.getCell('B11').font = { bold: true, size: 12 };

    // 2. Main Headers Row (Row 13)
    // "SEVERITY OF CONSEQUENCES - S" spans across People(C), Assets(D), and Environment(E)
    t1Sheet.mergeCells('B13:E13'); // Merging B too to cover the Index column visually
    const sevHeader = t1Sheet.getCell('B13');
    sevHeader.value = "SEVERITY OF CONSEQUENCES - S";
    styleHeader(sevHeader, true);

    // Probability Headers (Columns F to J) matching the image text
    const pLabels = [
        "1\nOnce in 10\nyears",
        "2\nOnce in five\nyears",
        "3\nOnce in a\nyear",
        "4\nOnce a month",
        "5\nOnce a week"
    ];

    let colIndex = 6; // Column F is index 6
    pLabels.forEach((lbl) => {
        const cell = t1Sheet.getCell(13, colIndex);
        cell.value = lbl;
        styleHeader(cell, true);
        // Ensure text wraps for the multi-line labels in the image
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        colIndex++;
    });

    // 3. Sub-Headers Row (Row 14)
    // Column B is empty or can hold the index header if desired, usually left blank or merged in image
    t1Sheet.getCell('C14').value = "People(P)"; styleHeader(t1Sheet.getCell('C14'), true);
    t1Sheet.getCell('D14').value = "Assets(A)"; styleHeader(t1Sheet.getCell('D14'), true);
    t1Sheet.getCell('E14').value = "Environment (E)"; styleHeader(t1Sheet.getCell('E14'), true);

    // For the Probability columns (F-J) in Row 14, they are technically part of the grid
    // but based on the image, the headers in Row 13 are tall.
    // We will leave F14-J14 blank or merged if we want the headers to span down,
    // but for standard Excel logic, we start data at 15.

    // 4. Data Rows (Starting Row 15)
    // Updated text to match the image exactly (e.g., "Slight effect" vs "Slight damage")
    const matrixRows = [
        { idx: 1, p: "Slight injury", a: "Slight damage", e: "Slight effect", vals: [1, 2, 3, 4, 5] },
        { idx: 2, p: "Minor injury", a: "Minor damage", e: "Minor effect", vals: [2, 4, 6, 8, 10] },
        { idx: 3, p: "Major injury", a: "Localised damage", e: "Localised effect", vals: [3, 6, 9, 12, 15] },
        { idx: 4, p: "Single Fatality", a: "Major damage", e: "Major effect", vals: [4, 8, 12, 16, 20] },
        { idx: 5, p: "Multiple\nFatalities", a: "Extensive damage", e: "Extensive effect", vals: [5, 10, 15, 20, 25] },
    ];

    let mRow = 15;
    matrixRows.forEach(row => {
        // Col B: Index (1, 2, 3, 4, 5) - The bold number on the left
        const idxCell = t1Sheet.getCell(`B${mRow}`);
        idxCell.value = row.idx;
        styleHeader(idxCell, true); // Center and bold like a header

        // Col C: People
        const pCell = t1Sheet.getCell(`C${mRow}`);
        pCell.value = row.p;
        styleData(pCell, 'center'); // Image shows center alignment
        pCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        // Col D: Assets
        const aCell = t1Sheet.getCell(`D${mRow}`);
        aCell.value = row.a;
        styleData(aCell, 'center');
        aCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        // Col E: Environment
        const eCell = t1Sheet.getCell(`E${mRow}`);
        eCell.value = row.e;
        styleData(eCell, 'center');
        eCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        // Cols F-J: The Matrix Values
        row.vals.forEach((val, vIdx) => {
            const cell = t1Sheet.getCell(mRow, 6 + vIdx); // Start at Column F (6)
            cell.value = val;
            styleHeader(cell, false); // Standard border, not necessarily bold text unless desired

            // Optional: Add color logic if defined
            if (typeof getRiskColor === 'function') {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: getRiskColor(val) } };
            }
        });

        mRow++;
    });

    // Helper style adjustments for widths
    t1Sheet.getColumn('B').width = 5;  // Narrow index column
    t1Sheet.getColumn('C').width = 15;
    t1Sheet.getColumn('D').width = 15;
    t1Sheet.getColumn('E').width = 15;
    // Probability columns width
    ['F', 'G', 'H', 'I', 'J'].forEach(col => t1Sheet.getColumn(col).width = 12);
    // ==========================================
    // 7. TABLE 2 (Standard)
    // ==========================================
    const t2Sheet = workbook.addWorksheet('H-TC-HAZOP-TABLE 2', { pageSetup: { orientation: 'landscape' } });
    addReportHeader(t2Sheet, hazop, 7, TOTAL_PAGES);

    t2Sheet.getCell('B10').value = "Table-2"; t2Sheet.getCell('B10').font = { bold: true };
    t2Sheet.getCell('B11').value = "   2.0   RISK LEVEL Vs ACTION PLAN"; t2Sheet.getCell('B11').font = { bold: true };

    const t2Head = 13;
    t2Sheet.getCell(`B${t2Head}`).value = "Risk"; styleHeader(t2Sheet.getCell(`B${t2Head}`), true);
    t2Sheet.getCell(`C${t2Head}`).value = "Risk level"; styleHeader(t2Sheet.getCell(`C${t2Head}`), true);
    t2Sheet.mergeCells(`D${t2Head}:J${t2Head}`); t2Sheet.getCell(`D${t2Head}`).value = "Action and time scale"; styleHeader(t2Sheet.getCell(`D${t2Head}`), true);

    t2Sheet.getColumn('D').width = 80;

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