import os from "os";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export interface AttendeeTicketData {
  name: string;
  email: string;
  studentId: string;
  university: string;
  segment: string;
  semester: string;
  team: string;
  qrToken: string;
}

const TICKET = {
  WIDTH: 515,
  HEIGHT: 175,
  START_X: 40,
  START_Y_BASE: 40,
  SPACING: 15,
  INFO_WIDTH: 515 * 0.7,
  QR_WIDTH: 515 * 0.3,
} as const;

const COLORS = {
  BACKGROUND_DARK: "#0f172a",
  TEXT_WHITE: "#ffffff",
  TEXT_LIGHT_GRAY: "#cbd5e1",
  TEXT_MUTED: "#94a3b8",
  TEXT_OFF_WHITE: "#f8fafc",
  BADGE_BG: "#ea580c",
  STROKE_DARK: "#1e293b",
} as const;

const loadAsset = (filePath: string): Buffer | null => {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;
};

const drawBackground = (
  doc: PDFKit.PDFDocument,
  currentY: number,
  bannerBuffer: Buffer | null,
): void => {
  if (bannerBuffer) {
    doc.image(bannerBuffer, TICKET.START_X, currentY, {
      width: TICKET.INFO_WIDTH,
      height: TICKET.HEIGHT,
    });
    doc
      .rect(TICKET.START_X, currentY, TICKET.INFO_WIDTH, TICKET.HEIGHT)
      .fillOpacity(0.85)
      .fill(COLORS.BACKGROUND_DARK);
    doc.fillOpacity(1);
  } else {
    doc
      .rect(TICKET.START_X, currentY, TICKET.INFO_WIDTH, TICKET.HEIGHT)
      .fill(COLORS.BACKGROUND_DARK);
  }
};

const drawHeader = (
  doc: PDFKit.PDFDocument,
  currentY: number,
  deptLogoBuffer: Buffer | null,
): void => {
  const titleText = "SMUCT CSE FEST V3";
  const subtitleText = "Organized by Department of CSE and CSIT.";
  const logoSize = 42;
  const gap = 14;
  const headerStartX = TICKET.START_X + 15;
  const textStartX = deptLogoBuffer
    ? headerStartX + logoSize + gap
    : headerStartX;

  if (deptLogoBuffer) {
    doc.image(deptLogoBuffer, headerStartX, currentY + 12, {
      width: logoSize,
    });
  }

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .fillColor(COLORS.TEXT_WHITE)
    .text(titleText, textStartX, currentY + 18);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor(COLORS.TEXT_LIGHT_GRAY)
    .text(subtitleText, textStartX, currentY + 38);
};

const drawBadge = (doc: PDFKit.PDFDocument, currentY: number): void => {
  doc.rect(TICKET.START_X + 15, currentY + 62, 80, 18).fill(COLORS.BADGE_BG);
  doc
    .fillColor(COLORS.TEXT_WHITE)
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("FOOD PASS", TICKET.START_X + 15, currentY + 67, {
      width: 80,
      align: "center",
      characterSpacing: 1,
    });
};

const drawDetails = (
  doc: PDFKit.PDFDocument,
  currentY: number,
  attendee: AttendeeTicketData,
): void => {
  const detailsY = currentY + 86;
  const labelX = TICKET.START_X + 15;
  const valueX = TICKET.START_X + 80;
  const maxTextWidth = TICKET.INFO_WIDTH - 95;

  const drawRow = (
    label: string,
    value: string,
    yOffset: number,
    isName = false,
  ): void => {
    doc
      .fontSize(9)
      .fillColor(COLORS.TEXT_MUTED)
      .font("Helvetica")
      .text(label, labelX, detailsY + yOffset);

    doc
      .fontSize(isName ? 10 : 9)
      .fillColor(isName ? COLORS.TEXT_WHITE : COLORS.TEXT_OFF_WHITE)
      .font("Helvetica-Bold")
      .text(value, valueX, detailsY + yOffset - (isName ? 0.5 : 0), {
        width: maxTextWidth,
        lineBreak: false,
        ellipsis: true,
      });
  };

  const semSecString = `${attendee.semester || "N/A"} / ${attendee.team || "N/A"}`;

  drawRow("Name:", attendee.name, 0, true);
  drawRow("ID:", attendee.studentId, 14);
  drawRow("Sem/Sec:", semSecString, 28);
  drawRow("Email:", attendee.email, 42);
  drawRow("University:", attendee.university, 56);
  drawRow("Segment:", attendee.segment, 70);
};

const drawQrSection = async (
  doc: PDFKit.PDFDocument,
  currentY: number,
  attendee: AttendeeTicketData,
  qrLogoBuffer: Buffer | null,
): Promise<void> => {
  doc
    .rect(
      TICKET.START_X + TICKET.INFO_WIDTH,
      currentY,
      TICKET.QR_WIDTH,
      TICKET.HEIGHT,
    )
    .fillAndStroke(COLORS.TEXT_WHITE, COLORS.STROKE_DARK);

  doc
    .fillColor(COLORS.STROKE_DARK)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("SCAN FOR FOOD", TICKET.START_X + TICKET.INFO_WIDTH, currentY + 15, {
      width: TICKET.QR_WIDTH,
      align: "center",
    });

  const qrImage = await QRCode.toBuffer(attendee.qrToken, {
    errorCorrectionLevel: "H",
    margin: 1,
  });

  const qrSize = 100;
  const qrX =
    TICKET.START_X + TICKET.INFO_WIDTH + TICKET.QR_WIDTH / 2 - qrSize / 2;
  const qrY = currentY + 35;

  doc.image(qrImage, qrX, qrY, { width: qrSize });

  if (qrLogoBuffer) {
    const logoSize = 24;
    const logoX = qrX + qrSize / 2 - logoSize / 2;
    const logoY = qrY + qrSize / 2 - logoSize / 2;
    doc
      .rect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4)
      .fill(COLORS.TEXT_WHITE);
    doc.image(qrLogoBuffer, logoX, logoY, { width: logoSize });
  }

  doc
    .fontSize(7)
    .font("Helvetica-Oblique")
    .fillColor(COLORS.TEXT_MUTED)
    .text(
      "Developed by Shishimaru",
      TICKET.START_X + TICKET.INFO_WIDTH,
      currentY + TICKET.HEIGHT - 15,
      { width: TICKET.QR_WIDTH, align: "center" },
    );

  doc
    .rect(TICKET.START_X, currentY, TICKET.WIDTH, TICKET.HEIGHT)
    .lineWidth(1.5)
    .strokeColor(COLORS.STROKE_DARK)
    .stroke();
};

export const buildPdfTicketsToDisk = async (
  attendees: AttendeeTicketData[],
): Promise<string> => {
  const qrLogoPath = path.resolve(process.cwd(), "assets/logo.png");
  const deptLogoPath = path.resolve(process.cwd(), "assets/dept-logo.png");
  const bannerPath = path.resolve(process.cwd(), "assets/banner.png");

  const qrLogoBuffer = loadAsset(qrLogoPath);
  const deptLogoBuffer = loadAsset(deptLogoPath);
  const bannerBuffer = loadAsset(bannerPath);

  const doc = new PDFDocument({ size: "A4", margin: 40 });

  const tempFilePath = path.join(os.tmpdir(), `tickets_${uuidv4()}.pdf`);
  const writeStream = fs.createWriteStream(tempFilePath);

  doc.pipe(writeStream);

  for (let i = 0; i < attendees.length; i++) {
    const attendee = attendees[i];

    if (i > 0 && i % 4 === 0) doc.addPage();

    const currentY =
      TICKET.START_Y_BASE + (i % 4) * (TICKET.HEIGHT + TICKET.SPACING);

    drawBackground(doc, currentY, bannerBuffer);
    drawHeader(doc, currentY, deptLogoBuffer);
    drawBadge(doc, currentY);
    drawDetails(doc, currentY, attendee);
    await drawQrSection(doc, currentY, attendee, qrLogoBuffer);
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => resolve(tempFilePath));
    writeStream.on("error", reject);
  });
};
