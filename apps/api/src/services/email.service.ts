import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import transporter from "../config/email";
import { logger } from "../config/logger";

export class EmailService {
  private compileTemplate(templateName: string, data: any) {
    const templatePath = path.join(__dirname, "..", "templates", `${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(source);
    return template(data);
  }

  async sendInvitationEmail(params: any) {
    try {
      const { to, firstName, lastName, organizationName, organizationType, invitationLink, temporaryPassword } = params;

      const html = this.compileTemplate("invitation", {
        ...params,
        organizationLabel: organizationType === "customer" ? "Customer" : "Vendor"
      });

      const subject = `Welcome to Euroasiann ERP - ${organizationName} Onboarding`;

      const mailOptions = {
        from: `"Euroasiann ERP" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      logger.info(`📧 Sending invitation email to: ${to}`);

      const info = await transporter.sendMail(mailOptions);

      logger.info(`✅ Invitation email sent: ${info.messageId}`);
      return info;

    } catch (error: any) {
      logger.error("Failed to send invitation email:", error);
      throw new Error(error.message);
    }
  }

  async sendWelcomeEmail({ to, firstName, lastName }: any) {
    try {
      const html = this.compileTemplate("welcome", {
        firstName,
        lastName,
      });

      const subject = "Welcome to Euroasiann ERP";

      const mailOptions = {
        from: `"Euroasiann ERP" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${to}`);

      return info;

    } catch (error: any) {
      logger.error("Failed to send welcome email:", error);
      throw new Error(error.message);
    }
  }
}

export const emailService = new EmailService();
