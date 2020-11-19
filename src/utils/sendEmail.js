import nodemailer from 'nodemailer';

async function sendEmail({ receiverEmail, subject, html }) {
  const transporter = nodemailer.createTransport({
    tls: {
      rejectUnauthorized: false,
    },
    service: 'gmail',
    auth: {
      user: process.env.MAIL,
      pass: process.env.PASSWORD,
    },
  });

  const message = {
    from: 'covalmichael23@gmail.com',
    to: receiverEmail,
    subject,
    html,
  };

  return await transporter.sendMail(message);
}

export default sendEmail;
