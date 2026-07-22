import "server-only";

import type { NewsletterConfirmation } from "../email-provider";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function createNewsletterConfirmationTemplate(
  confirmation: NewsletterConfirmation,
) {
  return {
    subject: "Đăng ký nhận bản tin đã được ghi nhận",
    text: `Đăng ký nhận bản tin của bạn đã được ghi nhận.\n\nBạn có thể hủy đăng ký bất kỳ lúc nào tại: ${confirmation.unsubscribeUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#111827">
        <h1 style="font-size:22px">Đăng ký đã được ghi nhận</h1>
        <p style="line-height:1.6">Cảm ơn bạn đã đăng ký nhận bản tin. Phiên bản hiện tại chưa gửi email marketing hàng loạt.</p>
        <p style="line-height:1.6">Bạn có thể <a href="${escapeHtml(confirmation.unsubscribeUrl)}">hủy đăng ký tại đây</a> bất kỳ lúc nào.</p>
      </div>`,
  };
}
