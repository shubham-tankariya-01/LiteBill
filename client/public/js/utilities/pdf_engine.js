/**
 * LiteBill · PDF Engine v6 (Luxury Architectural Edition)
 * "Precision, Clarity, and Premium Aesthetics"
 * 
 * Entirely rewritten from scratch for a superior, data-grid focused layout.
 */

window.LiteBillPDF = (() => {
    // Layout Constants
    const PW = 210, PH = 297;
    const M = 10; // Global Margin
    const CW = PW - (M * 2); // Content Width (190mm)
    
    // Theme Palette (Sapphire & Slate)
    const T = {
        bg: [255, 255, 255],
        white: [255, 255, 255], // ADDED
        ink: [15, 23, 42],      // Slate 900
        slate: [71, 85, 105],   // Slate 600
        muted: [148, 163, 184], // Slate 400
        line: [226, 232, 240],  // Slate 200
        blue: [37, 99, 235],    // Royal Blue
        blueLight: [239, 246, 255],
        orange: [249, 115, 22], // Orange 500
        green: [22, 163, 74],   // Green 600
        greenLight: [240, 253, 244]
    };

    let _doc, _data, curY, totalPages;

    // --- Helpers ---
    const fM = v => 'Rs. ' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fN = (v, d = 2) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
    const clean = s => String(s || '').replace(/[^\w.-]+/g, '_');

    function sf(style, size, color) {
        _doc.setFont('helvetica', style);
        _doc.setFontSize(size);
        if (color) _doc.setTextColor(...color);
    }

    function line(x, y, w, lw = 0.1, color = T.line) {
        _doc.setDrawColor(...color);
        _doc.setLineWidth(lw);
        _doc.line(x, y, x + w, y);
    }

    function stroke(x, y, w, h, fCol, sCol, r = 0, lw = 0.2) {
        if (fCol && fCol.length >= 3) _doc.setFillColor(...fCol);
        _doc.setDrawColor(...sCol);
        _doc.setLineWidth(lw);
        _doc.roundedRect(x, y, w, h, r, r, fCol ? 'FD' : 'D');
    }

    // --- Page Architecture ---
    function paintPageFrame(title) {
        // Simple Top Border
        _doc.setDrawColor(...T.blue);
        _doc.setLineWidth(1.5);
        _doc.line(M, M, PW - M, M);

        // Header Title
        sf('bold', 8, T.muted);
        _doc.text('LITEBILL · REPORTING ENGINE v6', M, M + 6);
        
        sf('bold', 8, T.blue);
        _doc.text('PAGE ' + _doc.internal.getNumberOfPages(), PW - M, M + 6, { align: 'right' });

        // Document ID / House
        sf('bold', 18, T.ink);
        _doc.text(_data.house.name.toUpperCase(), M, M + 18);
        
        sf('normal', 9, T.slate);
        _doc.text(title + '  ·  ' + _data.cycle.startDate + ' - ' + _data.cycle.endDate, M, M + 24);

        line(M, M + 28, CW, 0.2, T.line);
        curY = M + 38;
    }

    function ensureSpace(h) {
        if (curY + h > PH - M - 10) {
            _doc.addPage();
            paintPageFrame('Continuation');
            return true;
        }
        return false;
    }

    // --- Components ---

    function drawHeroMetrics() {
        const h = 28;
        const w1 = CW * 0.35; // Payable
        const w2 = CW * 0.28; // Rate (Black)
        const w3 = CW - w1 - w2 - 10; // Others

        // --- BOX 1: PAYABLE SUMMARY (BLUE) ---
        stroke(M, curY, w1, h, T.blue, T.blue, 0, 0.45);
        // White Inner Border
        _doc.setDrawColor(...T.white);
        _doc.setLineWidth(0.35);
        _doc.rect(M + 0.5, curY + 0.5, w1 - 1, h - 1, 'D');

        sf('bold', 8, T.white); 
        _doc.text('TOTAL PAYABLE AMOUNT', M + 5, curY + 8);
        sf('bold', 22, T.white);
        _doc.text(fM(_data.mainBill.totalAmount), M + 5, curY + 20);

        // --- BOX 2: RATE PER UNIT (BLACK) ---
        const x2 = M + w1 + 5;
        stroke(x2, curY, w2, h, T.ink, T.ink, 0, 0.45);
        // White Inner Border
        _doc.setDrawColor(...T.white);
        _doc.setLineWidth(0.35);
        _doc.rect(x2 + 0.5, curY + 0.5, w2 - 1, h - 1, 'D');

        sf('bold', 8, T.white);
        _doc.text('RATE / UNIT', x2 + 5, curY + 8);
        sf('bold', 18, T.white);
        _doc.text('Rs ' + fN(_data.mainBill.ratePerUnit, 4), x2 + 5, curY + 20);

        // --- BOX 3: SECONDARY METRICS (BLUE) ---
        const x3 = x2 + w2 + 5;
        stroke(x3, curY, w3, h, T.blue, T.blue, 0, 0.45);
        // White Inner Border
        _doc.setDrawColor(...T.white);
        _doc.setLineWidth(0.35);
        _doc.rect(x3 + 0.5, curY + 0.5, w3 - 1, h - 1, 'D');

        const subW = (w3 - 10) / 2;
        const metrics = [
            { l: 'BILL DATE', v: _data.mainBill.billDate },
            { l: 'ROOMS', v: String(_data.summary.roomCount) }
        ];

        metrics.forEach((m, i) => {
            const mx = x3 + 5 + i * (subW + 2);
            sf('bold', 8, T.white);
            _doc.text(m.l, mx, curY + 10);
            sf('bold', 11, T.white);
            _doc.text(m.v, mx, curY + 18);
        });

        curY += h + 10;
    }

    function drawAdjustmentSummary() {
        ensureSpace(28);
        sf('bold', 12, T.ink);
        _doc.text('UNIT ADJUSTMENT ANALYSIS', M, curY);
        curY += 7;
        line(M, curY, CW, 0.6, T.ink);
        curY += 6;

        const h = 14;
        const adj = _data.summary.totalAdjustmentUnits;
        const adjPerRoom = adj / _data.summary.roomCount;
        const color = adj >= 0 ? T.green : T.orange;

        stroke(M, curY, CW, h, T.bg, T.line, 0, 0.35);
        
        sf('bold', 9, T.ink);
        const prefix = (adj >= 0 ? 'Addition' : 'Subtraction') + ' of ';
        const suffix = ' units in each room';
        const valText = fN(Math.abs(adjPerRoom), 4);
        
        const startX = M + 5;
        _doc.text(prefix, startX, curY + 9);
        const pW = _doc.getTextWidth(prefix);
        
        sf('bold', 10, color);
        _doc.text(valText, startX + pW, curY + 9);
        const vW = _doc.getTextWidth(valText);
        
        sf('bold', 9, T.ink);
        _doc.text(suffix, startX + pW + vW, curY + 9);

        sf('normal', 7.5, T.muted);
        const calc = 'Total Adjustment (' + fN(adj, 2) + ') / ' + _data.summary.roomCount + ' Rooms';
        _doc.text(calc, PW - M - 5, curY + 9, { align: 'right' });

        curY += h + 12;
    }

    function drawRoomGrid() {
        sf('bold', 12, T.ink);
        _doc.text('ROOM DISTRIBUTION DETAILS', M, curY);
        curY += 6;
        line(M, curY, CW, 0.5, T.ink);
        curY += 8;

        const colW = [10, 50, 25, 25, 25, 25, 30]; // Index, Name, Prev, Curr, Raw, Extra, Total
        const labels = ['#', 'ROOM NAME', 'PREV', 'CURR', 'RAW U', 'EXTRA', 'AMOUNT'];
        
        // Header
        sf('bold', 7, T.muted);
        let tx = M;
        labels.forEach((l, i) => {
            _doc.text(l, tx + (i > 1 ? colW[i] : 0), curY, { align: i > 1 ? 'right' : 'left' });
            tx += colW[i];
        });
        curY += 5;
        line(M, curY, CW, 0.2, T.slate);
        curY += 8;

        _data.roomBills.forEach((b, i) => {
            ensureSpace(12);
            sf('normal', 9, T.slate);
            _doc.text(String(i + 1).padStart(2, '0'), M, curY);
            
            sf('bold', 10, T.ink);
            _doc.text(b.roomName, M + colW[0], curY);

            sf('normal', 9, T.slate);
            _doc.text(fN(b.previousReading, 1), M + colW[0] + colW[1] + colW[2], curY, { align: 'right' });
            _doc.text(fN(b.currentReading, 1), M + colW[0] + colW[1] + colW[2] + colW[3], curY, { align: 'right' });
            _doc.text(fN(b.rawUnitsConsumed, 1), M + colW[0] + colW[1] + colW[2] + colW[3] + colW[4], curY, { align: 'right' });
            
            sf('bold', 9, b.adjustmentUnits >= 0 ? T.green : T.orange);
            _doc.text((b.adjustmentUnits >= 0 ? '+' : '') + fN(b.adjustmentUnits, 1), M + colW[0] + colW[1] + colW[2] + colW[3] + colW[4] + colW[5], curY, { align: 'right' });

            sf('bold', 10, T.blue);
            _doc.text(fM(b.amount), PW - M, curY, { align: 'right' });

            curY += 10;
            line(M + colW[0], curY - 6, CW - colW[0], 0.05, T.line);
        });

        // Total Row
        curY += 4;
        _doc.setFillColor(...T.blueLight);
        _doc.rect(M, curY - 7, CW, 10, 'F');
        sf('bold', 10, T.blue);
        _doc.text('GENERATED TOTAL', M + 5, curY);
        _doc.text(fM(_data.summary.totalRoomBills), PW - M - 5, curY, { align: 'right' });
        curY += 15;
    }

    function drawTechnicalAudit() {
        ensureSpace(60);
        sf('bold', 12, T.ink);
        _doc.text('TECHNICAL RECONCILIATION', M, curY);
        curY += 8;

        const boxW = (CW - 10) / 3;
        const items = [
            { l: 'SUPPLIER UNITS', v: fN(_data.mainBill.totalUnits, 1), s: 'Measured by main meter' },
            { l: 'ROOMS RAW UNITS', v: fN(_data.summary.totalRawUnits, 1), s: 'Sum of all sub-meters' },
            { l: 'ADJUSTMENT LOSS', v: fN(_data.summary.totalAdjustmentUnits, 1), s: 'Units spread to rooms' }
        ];

        items.forEach((it, i) => {
            const x = M + i * (boxW + 5);
            _doc.setDrawColor(...T.line);
            _doc.setLineWidth(0.1);
            _doc.rect(x, curY, boxW, 25);
            
            sf('bold', 7, T.muted);
            _doc.text(it.l, x + 4, curY + 6);
            sf('bold', 13, T.ink);
            _doc.text(it.v, x + 4, curY + 14);
            sf('normal', 6, T.slate);
            _doc.text(it.s, x + 4, curY + 20);
        });

        curY += 35;
    }

    function drawRoomCards() {
        _doc.addPage();
        paintPageFrame('INDIVIDUAL ROOM BILLS');
        
        _data.roomBills.forEach((b, i) => {
            const h = 55;
            ensureSpace(h + 6);
            const x = M, y = curY;

            // 1. Fill Backround (Right Payable Block First - Use Solid Blue)
            const pW = 60; 
            _doc.setFillColor(...T.blue);
            _doc.rect(x + CW - pW, y, pW, h, 'F');
            
            // Add White Inner Border (1px)
            _doc.setDrawColor(...T.white);
            _doc.setLineWidth(0.35);
            _doc.rect(x + CW - pW + 1, y + 1, pW - 2, h - 2, 'D');

            // 2. Room Name Block Background
            const rbW = 65, rbH = 16;
            _doc.setFillColor(...T.bg);
            _doc.rect(x + 5, y + 5, rbW, rbH, 'F');

            // 3. Draw The Main Outer Border (ON TOP)
            stroke(x, y, CW, h, null, T.blue, 0, 0.5); 
            
            // Left Accent Strip
            _doc.setFillColor(...T.blue);
            _doc.rect(x, y, 3, h, 'F');

            // Room Name Block Border & Text (Pure White Bold)
            stroke(x + 5, y + 5, rbW, rbH, T.blue, T.blue, 0, 0.25);
            sf('bold', 7, T.white); 
            _doc.text('ROOM IDENTIFIER', x + 9, y + 9.5); 
            sf('bold', 14, T.white);
            _doc.text(b.roomName.toUpperCase(), x + 9, y + 17);
            
            // Readings Grid
            const gX = x + 8, gY = y + 28;
            const colW = 31; // Significantly reduced to increase gap with right block
            const readings = [
                { l: 'PREVIOUS READING', v: fN(b.previousReading, 1) },
                { l: 'CURRENT READING', v: fN(b.currentReading, 1) },
                { l: 'RAW CONSUMPTION', v: fN(b.rawUnitsConsumed, 2) },
                { l: 'ADJUSTMENT', v: (b.adjustmentUnits >= 0 ? '+' : '') + fN(b.adjustmentUnits, 2) }
            ];

            readings.forEach((r, idx) => {
                const rx = gX + idx * colW;
                sf('bold', 7, T.muted);
                _doc.text(r.l, rx, gY);
                sf('bold', 11, T.ink); 
                _doc.text(r.v, rx, gY + 6.5); 
            });

            // Formula Line
            sf('bold', 8, T.slate);
            const formula = 'Logic: ' + fN(b.adjustedUnitsConsumed, 2) + ' Units x Rs. ' + fN(_data.mainBill.ratePerUnit, 4);
            _doc.text(formula, gX, y + 48);

            // Right Payable Block Text (Centered - Pure White Bold)
            sf('bold', 9, T.white);
            _doc.text('PAYABLE AMOUNT', x + CW - (pW / 2), y + 12, { align: 'center' });
            
            sf('bold', 20, T.white); 
            _doc.text(fM(b.amount), x + CW - (pW / 2), y + 30, { align: 'center' });
            
            sf('bold', 7.5, T.white); 
            const share = 'SHARE: ' + fN(b.proportion, 1) + '%';
            _doc.text(share, x + CW - (pW / 2), y + 48, { align: 'center' });

            curY += h + 8;
        });
    }

    function drawFooterStamp() {
        const total = _doc.internal.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
            _doc.setPage(i);
            
            // Watermark
            _doc.saveGraphicsState();
            _doc.setGState(new _doc.GState({ opacity: 0.05 }));
            sf('bold', 60, T.blue);
            _doc.text('LITEBILL', PW/2, PH/2, { align: 'center', angle: 45 });
            _doc.restoreGraphicsState();

            sf('normal', 7, T.muted);
            const timestamp = 'GENERATED ON ' + _data.summary.generatedAt.toUpperCase();
            _doc.text(timestamp + '  ·  SECURE FINANCIAL RECORD', PW / 2, PH - 8, { align: 'center' });
        }
    }

    return {
        generate: async function(BILL_DATA) {
            _data = BILL_DATA;
            const jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
            _doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            // Page 1: Main Report
            paintPageFrame('BILLING DISTRIBUTION REPORT');
            drawHeroMetrics();
            drawAdjustmentSummary();
            drawRoomGrid();
            
            // Individual Room Cards
            drawRoomCards();

            // Technical Section
            drawTechnicalAudit();

            drawFooterStamp();

            const fileName = 'BILL_' + clean(_data.house.name) + '_' + Date.now() + '.pdf';
            _doc.save(fileName);
        }
    };
})();
