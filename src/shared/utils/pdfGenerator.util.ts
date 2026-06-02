// src/utils/pdfGenerator.util.ts
import os from "os";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export const buildPdfTicketsToDisk = async (
  attendees: any[],
): Promise<string> => {
  const qrLogoPath = path.resolve(process.cwd(), "src/assets/logo.png");
  const deptLogoPath = path.resolve(process.cwd(), "src/assets/dept-logo.png");
  const bannerPath = path.resolve(process.cwd(), "src/assets/banner.png");

  const loadAsset = (filePath: string) =>
    fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;

  const qrLogoBuffer = loadAsset(qrLogoPath);
  const deptLogoBuffer = loadAsset(deptLogoPath);
  const bannerBuffer = loadAsset(bannerPath);

  const doc = new PDFDocument({ size: "A4", margin: 40 });

  const tempFilePath = path.join(os.tmpdir(), `tickets_${uuidv4()}.pdf`);
  const writeStream = fs.createWriteStream(tempFilePath);

  doc.pipe(writeStream);

  const ticketWidth = 515;
  const ticketHeight = 175;
  const startX = 40;
  const startYBase = 40;
  const spacing = 15;
  const infoWidth = ticketWidth * 0.7; // 360.5px
  const qrWidth = ticketWidth * 0.3;

  for (let i = 0; i < attendees.length; i++) {
    const attendee = attendees[i];

    if (i > 0 && i % 4 === 0) doc.addPage();

    const currentY = startYBase + (i % 4) * (ticketHeight + spacing);

    // --- 1. BACKGROUND ---
    if (bannerBuffer) {
      doc.image(bannerBuffer, startX, currentY, {
        width: infoWidth,
        height: ticketHeight,
      });
      doc
        .rect(startX, currentY, infoWidth, ticketHeight)
        .fillOpacity(0.85)
        .fill("#0f172a");
      doc.fillOpacity(1);
    } else {
      doc.rect(startX, currentY, infoWidth, ticketHeight).fill("#0f172a");
    }

    // --- 2 & 3. LEFT-ALIGNED HEADER (Logo, Title, Subtitle) ---
    const titleText = "SMUCT CSE FEST V3";
    const subtitleText = "Organized by Department of CSE and CSIT.";

    const logoSize = 42; // 💥 Increased from 32 for a bolder, professional presence
    const gap = 14; // 💥 Slightly wider gap so the text doesn't feel crowded

    // Align exactly with the left edge of the "FOOD PASS" badge
    const headerStartX = startX + 15;
    const textStartX = deptLogoBuffer
      ? headerStartX + logoSize + gap
      : headerStartX;

    if (deptLogoBuffer) {
      // 💥 Moved slightly up to currentY + 12 to perfectly balance the larger size
      doc.image(deptLogoBuffer, headerStartX, currentY + 12, {
        width: logoSize,
      });
    }

    // Title (Vertically aligned with the upper half of the larger logo)
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text(titleText, textStartX, currentY + 18); // Adjusted Y

    // Subtitle (Vertically aligned with the lower half of the larger logo)
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#cbd5e1")
      .text(subtitleText, textStartX, currentY + 38); // Adjusted Y

    // --- 4. BADGE ---
    doc.rect(startX + 15, currentY + 62, 80, 18).fill("#ea580c");
    doc
      .fillColor("#ffffff")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("FOOD PASS", startX + 15, currentY + 67, {
        width: 80,
        align: "center",
        characterSpacing: 1,
      });

    // --- 5. ATTENDEE DETAILS (De-congested) ---
    const detailsY = currentY + 86; // Shifted up slightly
    const labelX = startX + 15;
    const valueX = startX + 80; // Brought slightly closer to labels for readability
    const maxTextWidth = infoWidth - 95;

    const drawRow = (
      label: string,
      value: string,
      yOffset: number,
      isName = false,
    ) => {
      // Label
      doc
        .fontSize(9)
        .fillColor("#94a3b8") // Softer gray for labels
        .font("Helvetica")
        .text(label, labelX, detailsY + yOffset);

      // Value
      doc
        .fontSize(isName ? 10 : 9) // Highlight the Name slightly
        .fillColor(isName ? "#ffffff" : "#f8fafc")
        .font("Helvetica-Bold")
        .text(value, valueX, detailsY + yOffset - (isName ? 0.5 : 0), {
          width: maxTextWidth,
          lineBreak: false,
          ellipsis: true,
        });
    };

    const semSecString = `${attendee.semester || "N/A"} / ${attendee.section || "N/A"}`;

    // Increased spacing from 12 back to 14, and removed the Role row
    drawRow("Name:", attendee.name, 0, true);
    drawRow("ID:", attendee.studentId, 14);
    drawRow("Sem/Sec:", semSecString, 28);
    drawRow("Email:", attendee.email, 42);
    drawRow("University:", attendee.university, 56);
    drawRow("Category:", attendee.category, 70);
    // Role removed to prevent visual clutter

    // --- 6. QR CODE SECTION (Right Side) ---
    doc
      .rect(startX + infoWidth, currentY, qrWidth, ticketHeight)
      .fillAndStroke("#ffffff", "#1e293b");

    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("SCAN FOR FOOD", startX + infoWidth, currentY + 15, {
        width: qrWidth,
        align: "center",
      });

    const qrImage = await QRCode.toBuffer(attendee.qrToken, {
      errorCorrectionLevel: "H",
      margin: 1,
    });
    const qrSize = 100;
    const qrX = startX + infoWidth + qrWidth / 2 - qrSize / 2;
    const qrY = currentY + 35;

    doc.image(qrImage, qrX, qrY, { width: qrSize });

    if (qrLogoBuffer) {
      const logoSize = 24;
      const logoX = qrX + qrSize / 2 - logoSize / 2;
      const logoY = qrY + qrSize / 2 - logoSize / 2;
      doc
        .rect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4)
        .fill("#ffffff");
      doc.image(qrLogoBuffer, logoX, logoY, { width: logoSize });
    }

    doc
      .fontSize(7)
      .font("Helvetica-Oblique")
      .fillColor("#94a3b8")
      .text(
        "Developed by Shishimaru",
        startX + infoWidth,
        currentY + ticketHeight - 15,
        { width: qrWidth, align: "center" },
      );

    doc
      .rect(startX, currentY, ticketWidth, ticketHeight)
      .lineWidth(1.5)
      .strokeColor("#1e293b")
      .stroke();
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => resolve(tempFilePath));
    writeStream.on("error", reject);
  });
};
