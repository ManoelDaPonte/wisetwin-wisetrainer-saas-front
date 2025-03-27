// lib/mailService.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: "smtp.hostinger.com",
	port: 587,
	secure: false,
	auth: {
		user: "no-reply@wisetwin.eu",
		pass: process.env.EMAIL_PASSWORD,
	},
});

// Fonction pour obtenir l'URL de base selon l'environnement
function getBaseUrl() {
	// Utiliser l'URL configurée si disponible
	if (process.env.NEXT_PUBLIC_APP_URL) {
		return process.env.NEXT_PUBLIC_APP_URL;
	}

	// En développement, utiliser localhost
	if (process.env.NODE_ENV === "development") {
		return "http://localhost:3000";
	}

	// Par défaut, utiliser l'URL de production
	return "https://wisetwin.eu";
}

export async function sendInvitationEmail(email, organizationName, inviteCode) {
	const baseUrl = getBaseUrl();
	const invitationUrl = `${baseUrl}/invitations/${inviteCode}`;

	// Générer la première lettre pour le logo fallback
	const organizationInitial = organizationName.charAt(0).toUpperCase();

	const info = await transporter.sendMail({
		from: '"WiseTwin" <no-reply@wisetwin.eu>',
		to: email,
		subject: `Invitation à rejoindre l'organisation ${organizationName}`,
		text: `Vous avez reçu une invitation à rejoindre l'organisation ${organizationName}. Cliquez sur le lien suivant pour accepter : ${invitationUrl}`,
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <!-- Logo ou initiale -->
          <div style="display: inline-block; width: 120px; height: 120px; background-color: #f5f5f5; border-radius: 50%; text-align: center; line-height: 120px; font-size: 48px; color: #00C7FF; font-weight: bold; margin-bottom: 10px;">
            ${organizationInitial}
          </div>
        </div>
        <h2 style="color: #0F0B66; margin-bottom: 20px;">Invitation à rejoindre une organisation</h2>
        <p>Bonjour,</p>
        <p>Vous avez été invité(e) à rejoindre l'organisation <strong>${organizationName}</strong> sur la plateforme WiseTwin.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationUrl}" style="background-color: #00C7FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accepter l'invitation</a>
        </div>
        <p style="color: #666; font-size: 14px;">Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
        <p style="color: #666; font-size: 14px;">${invitationUrl}</p>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e0e0e0;">
        <p style="color: #999; font-size: 12px;">Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
      </div>
    `,
	});

	return info;
}
