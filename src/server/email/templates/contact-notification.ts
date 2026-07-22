import "server-only";

import type { ContactNotification } from "../email-provider";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function optionalLine(label: string, value?: string) {
  return value ? `${label}: ${value}\n` : "";
}

function optionalRow(label: string, value?: string) {
  return value
    ? `<tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(value)}</td></tr>`
    : "";
}

export function createContactNotificationTemplate(
  notification: ContactNotification,
) {
  const subjectName = notification.fullName.replace(/[\r\n\t]+/g, " ").trim();
  const subject = `Yêu cầu hợp tác mới từ ${subjectName}`;
  const createdAt = notification.createdAt.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const text = [
    "Website vừa ghi nhận một yêu cầu hợp tác mới.",
    "",
    `Mã yêu cầu: ${notification.submissionId}`,
    `Thời gian: ${createdAt}`,
    `Họ tên: ${notification.fullName}`,
    `Email: ${notification.email}`,
    optionalLine("Số điện thoại", notification.phone).trimEnd(),
    optionalLine("Công ty", notification.company).trimEnd(),
    `Loại hợp tác: ${notification.collaborationType}`,
    optionalLine("Ngân sách", notification.budgetRange).trimEnd(),
    "",
    "Nội dung:",
    notification.message,
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111827">
      <h1 style="font-size:22px">Yêu cầu hợp tác mới</h1>
      <p>Website vừa ghi nhận một yêu cầu hợp tác mới.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e7eb">Mã yêu cầu</th><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(notification.submissionId)}</td></tr>
        <tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e7eb">Thời gian</th><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(createdAt)}</td></tr>
        <tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e7eb">Họ tên</th><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(notification.fullName)}</td></tr>
        <tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e7eb">Email</th><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(notification.email)}</td></tr>
        ${optionalRow("Số điện thoại", notification.phone)}
        ${optionalRow("Công ty", notification.company)}
        <tr><th align="left" style="padding:8px;border-bottom:1px solid #e5e7eb">Loại hợp tác</th><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(notification.collaborationType)}</td></tr>
        ${optionalRow("Ngân sách", notification.budgetRange)}
      </table>
      <h2 style="font-size:17px;margin-top:24px">Nội dung</h2>
      <p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(notification.message)}</p>
      <p style="margin-top:24px;color:#6b7280;font-size:12px">Email này không chứa Turnstile token, địa chỉ IP hoặc dữ liệu theo dõi.</p>
    </div>`;

  return { subject, text, html };
}
