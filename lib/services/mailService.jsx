// lib/mailService.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: "smtp.hostinger.com", // Remplacer par votre serveur SMTP Hostinger
	port: 587,
	secure: false, // true pour 465, false pour d'autres ports
	auth: {
		user: "no-reply@wisetwin.eu",
		pass: process.env.EMAIL_PASSWORD, // Stocker le mot de passe dans les variables d'environnement
	},
});

export async function sendInvitationEmail(email, organizationName, inviteCode) {
	const info = await transporter.sendMail({
		from: '"WiseTwin" <no-reply@wisetwin.eu>',
		to: email,
		subject: `Invitation à rejoindre l'organisation ${organizationName}`,
		text: `Vous avez reçu une invitation à rejoindre l'organisation ${organizationName}. Cliquez sur le lien suivant pour accepter : ${process.env.NEXT_PUBLIC_APP_URL}/invitations/${inviteCode}`,
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${process.env.NEXT_PUBLIC_APP_URL}/logos/logo_parrot_dark.svg" alt="WiseTwin Logo" style="width: 120px;">
        </div>
        <h2 style="color: #0F0B66; margin-bottom: 20px;">Invitation à rejoindre une organisation</h2>
        <p>Bonjour,</p>
        <p>Vous avez été invité(e) à rejoindre l'organisation <strong>${organizationName}</strong> sur la plateforme WiseTwin.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/invitations/${inviteCode}" style="background-color: #00C7FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accepter l'invitation</a>
        </div>
        <p style="color: #666; font-size: 14px;">Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
        <p style="color: #666; font-size: 14px;">${process.env.NEXT_PUBLIC_APP_URL}/invitations/${inviteCode}</p>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e0e0e0;">
        <p style="color: #999; font-size: 12px;">Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
      </div>
    `,
	});

	return info;
}
