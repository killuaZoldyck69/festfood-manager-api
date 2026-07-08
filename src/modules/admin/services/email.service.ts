import QRCode from "qrcode";
import { envConfig } from "../../../shared/config/env";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../errors/AppError";

const FRIENDS_OVERRIDES: Record<
  string,
  {
    greeting?: string;
    bubbleImg?: string;
    robotImg?: string;
    specialLink?: { url: string; text: string };
  }
> = {
  "ferdausemahmud@gmail.com": {
    greeting: 'কিরে <span class="text-purple">Racist Nigga</span> (Mahmud),',
    bubbleImg:
      "https://i.ibb.co.com/FbGff6XM/GTA-5-Lamar-Nigga-GTA-V-Lamar-Davis-Meme.gif",
    robotImg: "https://i.ibb.co.com/7JRxv6Ks/mosambi-ka-juice-pila-do.png",
  },
  "mahinahmedmad@gmail.com": {
    greeting:
      'কিরে <span class="text-purple">Mahin</span> (দেখলে তাকাইয়া থাকবি কিন্তু),',
    bubbleImg: "https://i.ibb.co.com/n84ZQbnt/mahin-gorila.png",
  },
  "asikurrahman023@gmail.com": {
    greeting:
      'কি খবর <span class="text-purple">বিবাহিত</span> (Asikur Rahman Anik),',
    bubbleImg: "https://i.ibb.co.com/VWHmZJLJ/onik-meow-ghop.jpg",
    robotImg: "https://i.ibb.co.com/GftLTqy7/amar-tare-dekhle-dak-dio.png",
  },
  "ibrahimbappy52478@gmail.com": {
    greeting: 'Yo <span class="text-purple">আলামিনের</span> (Ebrahim),',
    bubbleImg: "https://i.ibb.co.com/gLYyFzVX/ibrahim-khobor-ase.png",
    robotImg:
      "https://i.ibb.co.com/GfCX9JW9/Alamin-kintu-tomar-jonno-wait-kortese-Ibrahim.png",
  },
  "radwanhossan18@gmail.com": {
    greeting:
      'আসসালামু আলাইকুম <span class="text-purple">Shakil ভাই</span> (Next Nokib Sir),',
  },
  "smuct82@gmail.com": {
    greeting: 'কিরে <span class="text-purple">ছোলা</span> (Soliman),',
    bubbleImg: "https://i.ibb.co.com/W4z9FdqV/solaiman-mask.png",
    robotImg:
      "https://i.ibb.co.com/J9VbZNt/musk-na-khulle-tore-khabar-dimu-nah.png",
  },
  "khanmdroman53@gmail.com": {
    greeting: 'কি অবস্থা <span class="text-purple">Gwak</span> (Roman),',
    bubbleImg: "https://i.ibb.co.com/MkG0NbMp/ladlee-meoww-ghop-ghop.png",
  },
  "torteypoka@gmail.com": {
    greeting:
      'কি অবস্থা <span class="text-purple">Mahin ভাই</span> (Morality কই গেলো?),',
    bubbleImg: "https://i.ibb.co.com/pB5zf2Bv/ay-tore-morality-shikhai.png",
  },
  "kalukalu200572@gmail.com": {
    greeting:
      'Hello <span class="text-purple">Sreecheta Sarker Tori</span> (Hi/Let&apos;s try),',
    bubbleImg: "https://i.ibb.co.com/CpXhn1FW/i-want-to-try-again.png",
  },
  "tanver694225@gmail.com": {
    greeting:
      'Hello <span class="text-purple">Sreecheta Sarker Tori</span> (Hi, Let&apos;s try),',
    bubbleImg: "https://i.ibb.co.com/CpXhn1FW/i-want-to-try-again.png",
  },
  "meherentamanna2022@gmail.com": {
    greeting: 'Hello <span class="text-purple">Meheren Tamanna ✨✨</span>,',
    bubbleImg: "https://i.ibb.co.com/DHJMm1SW/hi-can-we-talk.png",
    specialLink: {
      url: "https://your-secret-website.com",
      text: " If yes, you can go to this link. Don't worry—it's not a malicious link. It's just a simple website. ✅",
    },
    robotImg: "https://i.ibb.co.com/ycDdpKfV/we-can-meet-robot-mascot.png",
  },
  "nh694225@gmail.com": {
    greeting:
      'কি অবস্থা <span class="text-purple">Mahin ভাই</span> (Morality কই গেলো?),',
    bubbleImg: "https://i.ibb.co.com/pB5zf2Bv/ay-tore-morality-shikhai.png",
  },
};

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

  const qrBase64 = qrImageBuffer.toString("base64");

  const ASSETS = {
    headerImg: "https://i.ibb.co.com/hFFyhgRP/header-banner.png",
    memoriesBubbleImg: "https://i.ibb.co.com/Nns3Wg3Y/callout.png",
    robotImg: "https://i.ibb.co.com/PZmgJBS9/robot.png",
    footerImg: "https://i.ibb.co.com/svRKnkWp/footer.png",
  };

  const override = FRIENDS_OVERRIDES[attendee.email] || {};

  const finalGreeting =
    override.greeting ||
    `Hello <span class="text-purple">${attendee.name}</span>,`;
  const finalBubbleImg = override.bubbleImg || ASSETS.memoriesBubbleImg;
  const finalRobotImg = override.robotImg || ASSETS.robotImg;

  const specialLinkHtml = override.specialLink
    ? `
    <div style="background-color: #fce7f3; border-radius: 8px; padding: 15px; margin-top: 20px; text-align: center; border: 2px dashed #db2777;">
      <a href="${override.specialLink.url}" style="color: #db2777; font-weight: bold; text-decoration: none; font-size: 16px;">
        ${override.specialLink.text}
      </a>
    </div>
  `
    : "";

  const htmlTemplate = `
<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        
        /* --- MOBILE RESPONSIVENESS --- */
        @media only screen and (max-width: 600px) {
          body { padding: 10px; }
          .content-padding { padding: 15px !important; }
          
          /* Force table columns to stack vertically */
          .stack-column {
            display: block !important;
            width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            text-align: center !important;
          }
          
          /* Left-aligned stacked column for details */
          .stack-column-left {
            display: block !important;
            width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            text-align: left !important;
          }

          /* Add spacing between stacked elements */
          .mobile-mb {
            margin-bottom: 25px !important;
          }
          
          /* Adjust image sizes for mobile */
          .memories-img {
            width: 140px !important;
            margin: 15px auto 0 !important;
            display: block !important;
          }

          /* Center developer section on mobile */
          .dev-table {
            margin: 0 auto !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="${ASSETS.headerImg}" alt="SMUCT CSE FEST V3" style="width: 100%; display: block; border: 0;" />
        
        <div class="content-padding">
          <table>
            <tr>
              <td class="stack-column-left mobile-mb">
                <h2 style="margin: 0; color: #0f172a; font-size: 24px;">${finalGreeting}</h2>
                <p style="color: #475569; line-height: 1.6; margin-top: 10px;">We are excited to see you at the fest! Below are your registration details and your official QR Code Food Pass. Please present this QR code to the volunteers at the food distribution desk.</p>
                ${specialLinkHtml}
              </td>
              <td class="stack-column" style="width: 200px; text-align: right; vertical-align: top;">
                <img src="${finalBubbleImg}" class="memories-img" alt="Let's make some memories" style="width: 180px;" />
              </td>
            </tr>
          </table>

          <div style="height: 30px;"></div>

          <table>
            <tr>
              <td class="stack-column-left mobile-mb" style="width: 50%; vertical-align: top; padding-right: 15px;">
                <div class="card">
                  <h3 class="text-purple" style="margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">PARTICIPANT DETAILS</h3>
                  <table>
                    <tr><td class="label"><span class="icon">🆔</span> ID:</td><td class="value"><strong>${attendee.studentId}</strong></td></tr>
                    <tr><td class="label"><span class="icon">👤</span> Name:</td><td class="value">${attendee.name}</td></tr>
                    <tr><td class="label"><span class="icon">🏷️</span> Segment:</td><td class="value text-purple"><strong>${attendee.segment}</strong></td></tr>
                    <tr><td class="label"><span class="icon">🎓</span> University:</td><td class="value">${attendee.university}</td></tr>
                    <tr><td class="label"><span class="icon">🏢</span> Dept:</td><td class="value">${attendee.department || "N/A"}</td></tr>
                    <tr><td class="label"><span class="icon">📞</span> Phone:</td><td class="value">${attendee.phone || "N/A"}</td></tr>
                    <tr><td class="label"><span class="icon">📧</span> Email:</td><td class="value">${attendee.email}</td></tr>
                    <tr><td class="label"><span class="icon">📅</span> Semester:</td><td class="value">${attendee.semester || "N/A"}</td></tr>
                    <tr><td class="label"><span class="icon">🏫</span> Team:</td><td class="value">${attendee.team || "N/A"} (${attendee.role || "N/A"})</td></tr>
                  </table>
                </div>
              </td>

              <td class="stack-column-left" style="width: 50%; vertical-align: top; padding-left: 15px;">
                <div style="border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; text-align: center;">
                  <div style="background-color: #5b21b6; color: white; padding: 10px; font-weight: bold; letter-spacing: 1px;">
                    ★ FOOD PASS ★
                  </div>
                  <div style="padding: 20px;">
                    <img src="cid:Your_Food_Pass_QR_Code.png" alt="Your Food Pass QR Code" style="width: 200px; height: 200px; border: 1px solid #cbd5e1; border-radius: 8px; margin: 0 auto;" />
                    <p class="text-purple" style="font-weight: bold; margin-bottom: 0; margin-top: 10px;">SCAN FOR FOOD</p>
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

          <div class="card">
            <table style="width: 100%;">
              <tr>
                <td class="stack-column mobile-mb" style="width: 35%; vertical-align: top; padding-right: 15px;">
                  <h4 class="text-purple" style="margin-top: 0;">EVENT INFORMATION</h4>
                  <p style="font-size: 13px; color: #475569; line-height: 1.8; margin: 0;">
                    <strong>🗓️ Date:</strong> 18 July, 2026<br>
                    <strong>⏰ Time:</strong> 09:00 AM - 08:00 PM<br>
                    <strong>📍 Venue:</strong> SMUCT Campus <br>
                    <strong>💬 Queries:</strong> csefest@smuct.ac.bd
                  </p>
                </td>
                
                <td class="stack-column mobile-mb" style="width: 30%; text-align: center; vertical-align: middle;">
                   <img src="${finalRobotImg}" alt="Mascot" style="width: 130px; display: inline-block;" />
                </td>
                
                <td class="stack-column" style="width: 35%; vertical-align: top; padding-left: 15px;">
                  <h4 class="text-purple" style="margin-top: 0;">DEVELOPED BY</h4>
                  
                  <table class="dev-table" style="border-collapse: collapse; margin-top: 10px;">
                    <tr>
                      <td style="padding-right: 1px;">
                        <a href="https://github.com/killuaZoldyck69" target="_blank" style="text-decoration: none;">
                          <img src="https://avatars.githubusercontent.com/u/161418568?v=4" alt="Tanver" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #5b21b6; display: block;" />
                        </a>
                      </td>
                      <td>
                        <a href="https://github.com/ARShishir" target="_blank" style="text-decoration: none;">
                          <img src="https://avatars.githubusercontent.com/u/136100734?v=4" alt="Abdur Rahaman Shishir" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #5b21b6; display: block;" />
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size: 11px; color: #64748b; margin-top: 8px; margin-bottom: 0;">
                    Click to view profiles
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

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": envConfig.BREVO_API_KEY as string,
    },
    body: JSON.stringify({
      sender: {
        name: "SMUCT CSE FEST",
        email: envConfig.FROM_EMAIL,
      },
      to: [
        {
          email: attendee.email,
          name: attendee.name,
        },
      ],
      subject: "Your Event Ticket & Food Pass - SMUCT CSE FEST V3",
      htmlContent: htmlTemplate,
      attachment: [
        {
          name: "Your_Food_Pass_QR_Code.png",
          content: qrBase64,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Brevo API Error:", errorData);
    throw new AppError(500, "Failed to send email via Brevo API.");
  }
};
