import { Resend } from "resend";

const FROM = process.env.RESEND_FROM || "Instashop <onboarding@resend.dev>";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
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
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #337357;">Welcome to Instashop, ${name}!</h1>
          <p>Congratulations — your payment is confirmed and <strong>@${instagram}</strong> is now officially listed as an Instashop seller.</p>
          <p>We'll be in touch with the next steps soon. Thanks for joining us!</p>
          <p style="margin-top: 32px; color: #666;">— Team Instashop</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send seller welcome email", err);
  }
}
