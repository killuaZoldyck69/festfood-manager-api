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
  const qrLogoPath = path.resolve(process.cwd(), "src/assets/logo.jpg");
  const deptLogoPath = path.resolve(process.cwd(), "src/assets/dept-logo.jpg");
  const bannerPath = path.resolve(process.cwd(), "src/assets/banner.jpg");

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
  const infoWidth = ticketWidth * 0.7;
  const qrWidth = ticketWidth * 0.3;

  for (let i = 0; i < attendees.length; i++) {
    const attendee = attendees[i];

    if (i > 0 && i % 4 === 0) doc.addPage();

    const currentY = startYBase + (i % 4) * (ticketHeight + spacing);

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

    let headerTextX = startX + 20;
    if (deptLogoBuffer) {
      doc.image(deptLogoBuffer, startX + 15, currentY + 15, { width: 40 });
      headerTextX = startX + 65;
    }

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("SMUCT CSE FEST V3", headerTextX, currentY + 15, {
        width: infoWidth - headerTextX + startX,
      });

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#cbd5e1")
      .text(
        "Shanto-Mariam University of Creative Technology",
        headerTextX,
        currentY + 35,
      );

    doc.rect(startX + 15, currentY + 65, 90, 20).fill("#ea580c");
    doc
      .fillColor("#ffffff")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("FOOD PASS", startX + 15, currentY + 71, {
        width: 90,
        align: "center",
        characterSpacing: 1,
      });

    const detailsY = currentY + 95;
    const labelX = startX + 15;
    const valueX = startX + 85;

    // 💥 The max width ensures long university names don't crash into the QR code
    const maxTextWidth = infoWidth - 95;

    const drawRow = (label: string, value: string, yOffset: number) => {
      doc
        .fontSize(9)
        .fillColor("#94a3b8")
        .font("Helvetica")
        .text(label, labelX, detailsY + yOffset);

      doc
        .fontSize(9)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text(value, valueX, detailsY + yOffset, {
          width: maxTextWidth,
          lineBreak: false, // Prevents text from wrapping to the next line
          ellipsis: true, // Adds "..." if the text is too long
        });
    };

    // 💥 Added the University row and expanded the spacing
    drawRow("Name:", attendee.name, 0);
    drawRow("ID:", attendee.studentId, 14);
    drawRow("Email:", attendee.email, 28);
    drawRow("University:", attendee.university, 42); // NEW
    drawRow("Category:", attendee.category, 56);
    drawRow("Role:", attendee.role, 70);

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
