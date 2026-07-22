import type { Metadata } from "next";

import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site.config";
import { withSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = withSocialMetadata({
  title: "Chính sách quyền riêng tư",
  description: "Nội dung mẫu về cách Quang Official xử lý biểu mẫu và analytics nội bộ.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: `Chính sách quyền riêng tư | ${siteConfig.siteName}`,
    description: "Chính sách quyền riêng tư mẫu dành cho website Quang Official.",
    url: "/privacy",
    images: [{ url: siteConfig.coverImage, alt: "Chính sách quyền riêng tư" }],
  },
});

const sections: readonly LegalSection[] = [
  {
    title: "1. Phạm vi của bản chính sách mẫu",
    paragraphs: [
      "Tài liệu mô tả cách website tiếp cận quyền riêng tư khi người dùng đọc nội dung, xem media hoặc chủ động gửi biểu mẫu.",
      "Website có backend tiếp nhận biểu mẫu public và khu vực quản trị được bảo vệ. Nội dung này vẫn là mẫu và cần được kiểm tra pháp lý trước production.",
    ],
  },
  {
    title: "2. Thông tin xuất hiện trong biểu mẫu",
    paragraphs: [
      "Form newsletter, đăng ký chiến dịch và liên hệ hợp tác được validate, chống spam và lưu trên máy chủ khi người dùng chủ động gửi.",
    ],
    items: [
      "Chỉ các trường cần thiết cho mục đích liên hệ hoặc tham gia chiến dịch mới được lưu; Turnstile token không được lưu.",
      "File được chọn trong form liên hệ chỉ được kiểm tra tên, phần mở rộng và kích thước tại trình duyệt; file không được upload.",
      "Email thông báo thất bại không làm mất submission đã được ghi nhận.",
    ],
  },
  {
    title: "3. Dữ liệu kỹ thuật và đo lường",
    paragraphs: [
      "Analytics nội bộ chỉ bắt đầu sau khi người dùng đồng ý. Hệ thống ghi loại event, đường dẫn, domain giới thiệu, UTM, nhóm thiết bị, country code khi hạ tầng cung cấp và mã băm của session ngẫu nhiên.",
      "Hệ thống không lưu nội dung form, email, số điện thoại, password, authentication token, secret hoặc IP đầy đủ trong analytics. Raw event có chính sách lưu tối đa 90 ngày; aggregate theo ngày có thể được giữ lâu hơn để xem xu hướng.",
      "Số phiên duy nhất chỉ là ước tính theo anonymous session và không đại diện chính xác cho số người dùng.",
    ],
  },
  {
    title: "4. Liên kết đến nền tảng bên ngoài",
    paragraphs: [
      "Website có liên kết đến YouTube, TikTok, Facebook, Instagram và các nền tảng khác. Khi mở các liên kết này, chính sách quyền riêng tư của nền tảng tương ứng sẽ được áp dụng độc lập.",
    ],
  },
  {
    title: "5. Lưu trữ cục bộ và lựa chọn giao diện",
    paragraphs: [
      "Website có thể lưu lựa chọn giao diện sáng hoặc tối trên thiết bị để duy trì trải nghiệm. Thông tin này không dùng để nhận dạng danh tính và có thể được xóa bằng công cụ quản lý dữ liệu website của trình duyệt.",
      "Lựa chọn đồng ý hoặc từ chối analytics cũng được lưu trong localStorage. Người dùng có thể xóa dữ liệu website của trình duyệt để đặt lại lựa chọn.",
    ],
  },
  {
    title: "6. Quyền và kênh liên hệ",
    paragraphs: [
      `Khi website có chức năng thu thập dữ liệu thật, người dùng cần được cung cấp cách yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu theo quy định áp dụng. Câu hỏi về bản chính sách mẫu có thể gửi đến ${siteConfig.contactEmail}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Thông tin và quyền riêng tư"
      title="Chính sách quyền riêng tư"
      description="Bản mô tả minh bạch về dữ liệu trong phiên bản MVP và những việc cần hoàn thiện trước production."
      updatedAt="2026-07-22"
      updatedLabel="22 tháng 7, 2026"
      sections={sections}
    />
  );
}
