import "server-only";

export interface ContactNotification {
  submissionId: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  collaborationType: string;
  budgetRange?: string;
  message: string;
  createdAt: Date;
}

export interface EmailDeliveryResult {
  id: string;
}

export interface NewsletterConfirmation {
  email: string;
  unsubscribeUrl: string;
}

export interface EmailProvider {
  sendContactNotification(
    notification: ContactNotification,
  ): Promise<EmailDeliveryResult>;
  sendNewsletterConfirmation(
    confirmation: NewsletterConfirmation,
  ): Promise<EmailDeliveryResult>;
}
