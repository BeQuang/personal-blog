import type { Metadata } from "next";

import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư",
  description: "Nội dung mẫu về cách Quang Official dự kiến xử lý thông tin trên website.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: `Chính sách quyền riêng tư | ${siteConfig.siteName}`,
    description: "Chính sách quyền riêng tư mẫu dành cho website Quang Official.",
    url: "/privacy",
    images: [{ url: siteConfig.coverImage, alt: "Chính sách quyền riêng tư" }],
  },
};

const sections: readonly LegalSection[] = [
  {
    title: "1. Phạm vi của bản chính sách mẫu",
    paragraphs: [
      "Tài liệu mô tả cách website dự kiến tiếp cận quyền riêng tư khi người dùng đọc nội dung, xem media hoặc tương tác với các biểu mẫu mô phỏng.",
      "Phiên bản MVP hiện không có tài khoản người dùng, backend tiếp nhận biểu mẫu hoặc hệ thống thanh toán.",
    ],
  },
  {
    title: "2. Thông tin xuất hiện trong biểu mẫu",
    paragraphs: [
      "Form newsletter, đăng ký chiến dịch và liên hệ hợp tác chỉ chạy trong trình duyệt để minh họa trải nghiệm. Nội dung nhập vào không được gửi đến máy chủ, không được ghi vào cơ sở dữ liệu và không được dùng để liên hệ thật.",
    ],
    items: [
      "Thông tin liên hệ như họ tên, email và số điện thoại chỉ tồn tại tạm thời trong giao diện đang mở.",
      "File được chọn trong form liên hệ chỉ được kiểm tra tên, phần mở rộng và kích thước tại trình duyệt; file không được upload.",
      "Khi làm mới hoặc rời trang, dữ liệu form chưa gửi sẽ không được website khôi phục.",
    ],
  },
  {
    title: "3. Dữ liệu kỹ thuật và đo lường",
    paragraphs: [
      "Bản MVP chỉ có placeholder analytics phía giao diện. Trước khi kích hoạt bất kỳ công cụ đo lường production nào, website cần công bố rõ loại dữ liệu, mục đích, thời hạn lưu và cơ chế đồng ý phù hợp.",
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
      updatedAt="2026-07-16"
      updatedLabel="16 tháng 7, 2026"
      sections={sections}
    />
  );
}
