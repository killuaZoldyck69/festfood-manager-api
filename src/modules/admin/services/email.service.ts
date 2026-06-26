import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { envConfig } from "../../../shared/config/env";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../errors/AppError";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: envConfig.SMTP_USER,
    pass: envConfig.SMTP_PASS,
  },
});

export const sendAttendeeTicketEmail = async (
  attendeeId: string,
): Promise<void> => {
  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
  });

  if (!attendee) {
    throw new AppError(404, "Attendee not found.");
  }

  const qrImageBuffer = await QRCode.toBuffer(attendee.qrToken, {
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const ASSETS = {
    headerImg: "https://i.ibb.co.com/NnJB8FfD/header-banner.png",
    memoriesBubbleImg: "https://i.ibb.co.com/h1KS2FJ2/callout.png",
    robotImg: "https://i.ibb.co.com/ynkLFP3t/robot.png",
    footerImg: "https://i.ibb.co.com/qYHKBfWy/footer.png",
  };

  const htmlTemplate = `
<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .content-padding { padding: 30px; }
        .text-purple { color: #5b21b6; }
        table { width: 100%; border-collapse: collapse; }
        .card { background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; box-sizing: border-box; }
        .label { font-weight: bold; color: #475569; font-size: 14px; width: 120px; padding-bottom: 12px;}
        .value { color: #0f172a; font-size: 14px; padding-bottom: 12px;}
        .icon { font-size: 16px; margin-right: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="${ASSETS.headerImg}" alt="SMUCT CSE FEST V3" style="width: 100%; display: block; border: 0;" />
        
        <div class="content-padding">
          <table>
            <tr>
              <td>
                <h2 style="margin: 0; color: #0f172a; font-size: 24px;">Hello <span class="text-purple">${attendee.name}</span>,</h2>
                <p style="color: #475569; line-height: 1.6; margin-top: 10px;">We are excited to see you at the fest! Below are your registration details and your official QR Code Food Pass. Please present this QR code to the volunteers at the food distribution desk.</p>
              </td>
              <td style="width: 200px; text-align: right; vertical-align: top;">
                <img src="${ASSETS.memoriesBubbleImg}" alt="Let's make some memories" style="width: 180px;" />
              </td>
            </tr>
          </table>

          <div style="height: 30px;"></div>

          <table>
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 15px;">
                <div class="card">
                  <h3 class="text-purple" style="margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">PARTICIPANT DETAILS</h3>
                  <table>
                    <tr><td class="label"><span class="icon">🆔</span> ID:</td><td class="value"><strong>${attendee.studentId}</strong></td></tr>
                    <tr><td class="label"><span class="icon">👤</span> Name:</td><td class="value">${attendee.name}</td></tr>
                    <tr><td class="label"><span class="icon">🏷️</span> Category:</td><td class="value text-purple"><strong>${attendee.category}</strong></td></tr>
                    <tr><td class="label"><span class="icon">🎓</span> University:</td><td class="value">${attendee.university}</td></tr>
                    <tr><td class="label"><span class="icon">🏢</span> Dept:</td><td class="value">${attendee.department || "N/A"}</td></tr>
                    <tr><td class="label"><span class="icon">📞</span> Phone:</td><td class="value">${attendee.phoneNumber || "N/A"}</td></tr>
                    <tr><td class="label"><span class="icon">📧</span> Email:</td><td class="value">${attendee.email}</td></tr>
                    <tr><td class="label"><span class="icon">📅</span> Semester:</td><td class="value">${attendee.semester || "N/A"}</td></tr>
                    <tr><td class="label"><span class="icon">🏫</span> Section:</td><td class="value">${attendee.section || "N/A"}</td></tr>
                  </table>
                </div>
              </td>

              <td style="width: 50%; vertical-align: top; padding-left: 15px;">
                <div style="border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; text-align: center;">
                  <div style="background-color: #5b21b6; color: white; padding: 10px; font-weight: bold; letter-spacing: 1px;">
                    ★ FOOD PASS ★
                  </div>
                  <div style="padding: 20px;">
                    <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #cbd5e1; border-radius: 8px;" />
                    <p class="text-purple" style="font-weight: bold; margin-bottom: 0;">SCAN FOR FOOD</p>
                  </div>
                </div>
                
                <div style="background-color: #fef08a; border-radius: 8px; padding: 15px; margin-top: 15px; font-size: 12px; color: #854d0e;">
                  <strong>⚠️ IMPORTANT REMINDER</strong>
                  <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                    <li>This pass is non-transferable.</li>
                    <li>Valid only during the event days.</li>
                    <li>Keep your QR code clearly visible.</li>
                  </ul>
                </div>
              </td>
            </tr>
          </table>
          
          <div style="height: 30px;"></div>

          <!-- FIXED: Wrapped in a div for reliable border-radius and padding -->
          <div class="card">
            <table style="width: 100%;">
              <tr>
                <td style="width: 35%; vertical-align: top; padding-right: 15px;">
                  <h4 class="text-purple" style="margin-top: 0;">EVENT INFORMATION</h4>
                  <p style="font-size: 13px; color: #475569; line-height: 1.8; margin: 0;">
                    <strong>🗓️ Date:</strong> 18 July, 2026<br>
                    <strong>⏰ Time:</strong> 09:00 AM - 08:00 PM<br>
                    <strong>📍 Venue:</strong> SMUCT Campus <br>
                    <strong>💬 Queries:</strong> csefest@smuct.ac.bd
                  </p>
                </td>
                <td style="width: 30%; text-align: center; vertical-align: middle;">
                   <img src="${ASSETS.robotImg}" alt="Mascot" style="width: 130px; display: inline-block;" />
                </td>
                <td style="width: 35%; vertical-align: top; padding-left: 15px;">
                  <h4 class="text-purple" style="margin-top: 0;">DEVELOPED BY</h4>
                  <p style="font-size: 13px; color: #475569; line-height: 1.8; margin: 0;">
                    ⚡ No one knows who 👻
                  </p>
                </td>
              </tr>
            </table>
          </div>
        </div>
        
        <img src="${ASSETS.footerImg}" alt="Thank you for being part of SMUCT CSE FEST V3" style="width: 100%; display: block; border: 0;" />
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${envConfig.BACKEND_URL || "http://localhost:5000"}/api/tickets/${attendee.id}/download" 
           style="background-color: #5b21b6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(91, 33, 182, 0.2);">
          📥 Download Full Ticket as PDF
        </a>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"SMUCT CSE FEST" <${envConfig.FROM_EMAIL}>`,
    to: attendee.email,
    subject: "Your Event Ticket & Food Pass - SMUCT CSE FEST V3",
    html: htmlTemplate,
    attachments: [
      {
        filename: "qrcode.png",
        content: qrImageBuffer,
        cid: "qrcode",
      },
    ],
  });
};
