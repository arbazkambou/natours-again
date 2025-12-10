import nodemailer, { Transporter } from "nodemailer";
import { convert } from "html-to-text";

interface UserLike {
  email: string;
  name: string;
}

interface SendOptions {
  subject: string;
  html: string;
}

export default class Email {
  private to: string;
  private firstName: string;
  private url?: string;
  private from: string;

  constructor(user: UserLike, url?: string) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Your App <${process.env.EMAIL_FROM}>`;
  }

  private newTransport(): Transporter {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        host: process.env.BREVO_HOST!,
        port: Number(process.env.BREVO_PORT!),
        auth: {
          user: process.env.BREVO_USER!,
          pass: process.env.BREVO_PASS!,
        },
      });
    }

    // Development (Mailtrap)

    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST!,
      port: Number(process.env.MAILTRAP_PORT!),
      auth: {
        user: process.env.MAILTRAP_USER!,
        pass: process.env.MAILTRAP_PASS!,
      },
    });
  }

  private async send({ subject, html }: SendOptions) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    const transporter = this.newTransport();
    await transporter.sendMail(mailOptions);
  }

  // -----------------------------
  // Prebuilt Email Types (HTML)
  // -----------------------------

  async sendWelcome() {
    const html = `
      <div style="font-family:Arial;padding:16px;">
        <h2>Welcome, ${this.firstName}! 🎉</h2>
        <p>We’re excited to have you onboard!</p>
        ${this.url ? `<a href="${this.url}" style="color:blue">Click here to continue</a>` : ""}
      </div>
    `;

    await this.send({
      subject: "Welcome to our platform!",
      html,
    });
  }

  async sendPasswordReset(resetUrl: string) {
    const html = `
      <div style="font-family:Arial;padding:16px;">
        <h2>Password Reset Request</h2>
        <p>Hi ${this.firstName},</p>
        <p>Your reset token is:</p>
        <h3>${resetUrl}</h3>
        <p>This token is valid for 10 minutes.</p>
      </div>
    `;

    await this.send({
      subject: "Your password reset token",
      html,
    });
  }

  async sendVerificationCode(link: string) {
    const html = `
      <div style="font-family:Arial;padding:16px;">
        <h2>Email Verification</h2>
        <p>Hi ${this.firstName},</p>
        <p>Please click on this link to berify your email:</p>
        <h2>${link}</h2>
      </div>
    `;

    await this.send({
      subject: "Verify your email",
      html,
    });
  }

  // Generic custom email
  async sendCustom(subject: string, html: string) {
    await this.send({ subject, html });
  }
}
