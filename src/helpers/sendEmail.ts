import nodemailer from "nodemailer";

export type EmailOptions = {
  from: string;
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail({ ...options }: EmailOptions) {
  // 1) Create Transporter

  const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST!,
    port: Number(process.env.MAIL_PORT!),
    auth: {
      user: process.env.MAIL_USER!,
      pass: process.env.MAIL_PASS!,
    },
  });

  await transport.sendMail({ ...options });
}
