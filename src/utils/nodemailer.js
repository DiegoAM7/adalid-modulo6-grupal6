import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'adalid.td.2023@gmail.com',
		pass: 'btqwjciwhnriqtoj',
	},
});

export const enviarCorreo = async (correo, asunto, template) => {
	const info = await transporter.sendMail({
		from: '"Servidor Node.js" <correo@mail.com>',
		to: correo,
		subject: asunto,
		html: template,
	});

	return info;
};
