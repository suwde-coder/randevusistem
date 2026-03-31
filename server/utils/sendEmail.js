import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Use ethereal for dev testing, normally inject SMTP credentials via env
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
      user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
      pass: process.env.EMAIL_PASS || 'ethereal_password',
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Appointment System'} <${process.env.FROM_EMAIL || 'noreply@appointments.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`Email sent: ${info.messageId}`);
  } catch (err) {
    console.error(`Error sending email: ${err.message}`);
  }
};

export default sendEmail;
