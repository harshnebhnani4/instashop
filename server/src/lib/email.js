import { Resend } from "resend";

const FROM = process.env.RESEND_FROM || "Instashop <onboarding@resend.dev>";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL;

const LOGO_URL =
  "https://res.cloudinary.com/drvug594q/image/upload/c_crop,g_north_west,h_164,w_171/Untitled_design__2_-removebg-preview_mcxgyr.png";
const BANNER_URL = "https://res.cloudinary.com/drvug594q/image/upload/v1794002938/flow-image-erasio_1_ketirt.jpg";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

// Shared branded shell: gradient banner with the logo, a white content
// card, and a footer — used by every outbound email so they all look like
// they came from the same place instead of plain system text.
function emailShell({ heading, bodyHtml, ctaLabel, ctaUrl }) {
  return `
    <div style="background: linear-gradient(180deg, #FFDBE5 0%, #FFF7FA 40%); padding: 32px 16px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" style="max-width: 480px; margin: 0 auto; border-collapse: collapse;">
        <tr>
          <td style="background: linear-gradient(135deg, #E27396, #EA9AB2); border-radius: 24px 24px 0 0; padding: 28px 24px; text-align: center;">
            <img src="${LOGO_URL}" alt="Instashop" width="56" height="56" style="display: block; margin: 0 auto 10px; border-radius: 14px; background: #fff; padding: 4px;" />
            <span style="color: #fff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Instashop</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 0;">
            <img src="${BANNER_URL}" alt="" width="480" style="display: block; width: 100%; height: auto;" />
          </td>
        </tr>
        <tr>
          <td style="background: #ffffff; border-radius: 0 0 24px 24px; padding: 32px 28px; box-shadow: 0 20px 50px -25px rgba(32,12,24,0.35);">
            <h1 style="margin: 0 0 16px; color: #337357; font-size: 24px; font-weight: 800; letter-spacing: -0.03em;">
              ${heading}
            </h1>
            <div style="color: #4a3540; font-size: 15px; line-height: 1.6;">
              ${bodyHtml}
            </div>
            ${
              ctaLabel && ctaUrl
                ? `<table role="presentation" style="margin-top: 24px;"><tr><td style="border-radius: 999px; background: #E27396;">
                     <a href="${ctaUrl}" style="display: inline-block; padding: 14px 28px; color: #fff; font-weight: 700; font-size: 15px; text-decoration: none; border-radius: 999px;">${ctaLabel}</a>
                   </td></tr></table>`
                : ""
            }
          </td>
        </tr>
      </table>
      <p style="text-align: center; color: #9b8690; font-size: 12px; margin-top: 20px;">
        Instashop · India's home for Insta brands · <a href="https://myinstashop.in" style="color: #E27396;">myinstashop.in</a>
      </p>
    </div>
  `;
}

// Fire-and-forget: a failed email should never break the checkout flow.
export async function sendSellerWelcomeEmail({ name, email, instagram }) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping welcome email");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Congratulations — you're an Instashop seller now! 🎉",
      html: emailShell({
        heading: `Welcome to Instashop, ${name}! 🎉`,
        bodyHtml: `
          <p style="margin: 0 0 12px;">Congratulations — you're officially in! <strong>@${instagram}</strong> is now listed as an Instashop seller.</p>
          <p style="margin: 0;">We'll be in touch with the next steps soon. Thanks for joining us — excited to have you on board!</p>
        `,
        ctaLabel: "Visit Instashop",
        ctaUrl: "https://myinstashop.in",
      }),
    });
  } catch (err) {
    console.error("Failed to send seller welcome email", err);
  }
}

// Notifies the Instashop team the moment a founding-seller lead comes in,
// so they can reach out on WhatsApp within minutes.
export async function sendLeadNotificationEmail({ name, email, instagram, category, whatsapp }) {
  const resend = getResend();
  if (!resend || !NOTIFY_EMAIL) {
    console.warn("RESEND_API_KEY or NOTIFY_EMAIL not set — skipping lead notification email");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: NOTIFY_EMAIL,
      subject: `New founding seller lead: @${instagram}`,
      html: emailShell({
        heading: "New founding seller lead 🎉",
        bodyHtml: `
          <p style="margin: 0 0 8px;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0 0 8px;"><strong>Instagram:</strong> @${instagram}</p>
          <p style="margin: 0 0 8px;"><strong>Category:</strong> ${category}</p>
          <p style="margin: 0 0 16px;"><strong>WhatsApp:</strong> ${whatsapp}</p>
          <p style="margin: 0; color: #9b8690;">Reply fast — they may already be messaging you on WhatsApp.</p>
        `,
      }),
    });
  } catch (err) {
    console.error("Failed to send lead notification email", err);
  }
}
