import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { EmailProvider, SendEmailOptions } from "../types/index.js";
import { ProviderError } from "../types/index.js";

export interface SmtpConfig {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
}

export class NodemailerEmailProvider implements EmailProvider {
  private readonly transporter: Transporter;

  constructor(config: SmtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      console.error("Nodemailer failed to deliver email:", error);
      throw new ProviderError(
        `Failed to deliver email: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }
}
