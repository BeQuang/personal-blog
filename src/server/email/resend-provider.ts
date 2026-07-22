import "server-only";

import { Resend } from "resend";
import { z } from "zod";

import type {
  ContactNotification,
  EmailProvider,
  NewsletterConfirmation,
} from "./email-provider";
import { createContactNotificationTemplate } from "./templates/contact-notification";
import { createNewsletterConfirmationTemplate } from "./templates/newsletter-confirmation";

const emailConfigurationSchema = z.object({
  apiKey: z.string().trim().min(1),
  from: z.string().trim().min(3),
  notificationEmail: z.email(),
});

export class ResendEmailProvider implements EmailProvider {
  private readonly resend: Resend;

  constructor(
    private readonly configuration: z.infer<typeof emailConfigurationSchema>,
  ) {
    this.resend = new Resend(configuration.apiKey);
  }

  async sendContactNotification(notification: ContactNotification) {
    const template = createContactNotificationTemplate(notification);
    const response = await this.resend.emails.send({
      from: this.configuration.from,
      to: [this.configuration.notificationEmail],
      replyTo: notification.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    if (response.error || !response.data) {
      throw new Error(response.error?.name ?? "RESEND_DELIVERY_FAILED");
    }

    return { id: response.data.id };
  }

  async sendNewsletterConfirmation(confirmation: NewsletterConfirmation) {
    const template = createNewsletterConfirmationTemplate(confirmation);
    const response = await this.resend.emails.send({
      from: this.configuration.from,
      to: [confirmation.email],
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    if (response.error || !response.data) {
      throw new Error(response.error?.name ?? "RESEND_DELIVERY_FAILED");
    }

    return { id: response.data.id };
  }
}

let provider: EmailProvider | undefined;

export function getEmailProvider(): EmailProvider {
  if (provider) return provider;

  const configuration = emailConfigurationSchema.parse({
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL,
    notificationEmail: process.env.CONTACT_NOTIFICATION_EMAIL,
  });
  provider = new ResendEmailProvider(configuration);
  return provider;
}
