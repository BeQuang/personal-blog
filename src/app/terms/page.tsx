import type { Metadata } from "next";

import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site.config";
import { withSocialMetadata } from "@/lib/metadata";

export const metadata: Metadata = withSocialMetadata({
  title: "Điều khoản sử dụng",
  description: "Điều khoản sử dụng mẫu cho nội dung và tính năng public của Quang Official.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: `Điều khoản sử dụng | ${siteConfig.siteName}`,
    description: "Điều khoản sử dụng mẫu dành cho website Quang Official.",
    url: "/terms",
    images: [{ url: siteConfig.coverImage, alt: "Điều khoản sử dụng" }],
  },
});

const sections: readonly LegalSection[] = [
  {
    title: "1. Mục đích của website",
    paragraphs: [
      "Website là nơi tổng hợp bài viết, video, hình ảnh, sự kiện và chiến dịch của Quang. Người dùng có thể truy cập nội dung public mà không cần tạo tài khoản trong phiên bản MVP.",
    ],
  },
  {
    title: "2. Cách sử dụng nội dung",
    paragraphs: [
      "Nội dung được cung cấp cho mục đích thông tin, tham khảo và giải trí. Người dùng không nên xem các chia sẻ cá nhân trên website là lời khuyên chuyên môn thay thế cho tư vấn phù hợp với hoàn cảnh cụ thể.",
    ],
    items: [
      "Không sao chép hoặc phân phối lại toàn bộ nội dung cho mục đích thương mại khi chưa có sự đồng ý.",
      "Có thể chia sẻ liên kết gốc và trích dẫn ngắn khi ghi nguồn rõ ràng.",
      "Không sử dụng website để thực hiện hành vi gây gián đoạn, xâm nhập hoặc ảnh hưởng đến người dùng khác.",
    ],
  },
  {
    title: "3. Bản quyền và dấu hiệu nhận diện",
    paragraphs: [
      "Bài viết, hình ảnh, thiết kế và các dấu hiệu nhận diện có thể thuộc quyền của Quang Official hoặc bên cấp phép tương ứng. Nội dung từ nền tảng bên ngoài tiếp tục chịu điều khoản của chủ sở hữu trên nền tảng đó.",
    ],
  },
  {
    title: "4. Biểu mẫu và thao tác mô phỏng",
    paragraphs: [
      "Newsletter, form chiến dịch, form liên hệ và file đính kèm hiện chỉ là tính năng mô phỏng. Thông báo thành công không tạo giao dịch, cam kết hợp tác, đăng ký chính thức hoặc nghĩa vụ thanh toán giữa các bên.",
    ],
  },
  {
    title: "5. Liên kết ngoài và tính sẵn sàng",
    paragraphs: [
      "Website có thể dẫn đến dịch vụ của bên thứ ba. Quang Official không kiểm soát toàn bộ nội dung, tính sẵn sàng hoặc thay đổi chính sách của những dịch vụ này. Website cũng có thể tạm ngừng để bảo trì hoặc cập nhật mà không báo trước trong giai đoạn phát triển.",
    ],
  },
  {
    title: "6. Cập nhật điều khoản và liên hệ",
    paragraphs: [
      `Bản điều khoản mẫu có thể được điều chỉnh khi website bổ sung chức năng. Phiên bản production cần hiển thị ngày hiệu lực và được kiểm tra pháp lý. Câu hỏi có thể gửi tới ${siteConfig.contactEmail}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Quy tắc sử dụng"
      title="Điều khoản sử dụng"
      description="Những nguyên tắc mẫu khi truy cập nội dung và sử dụng các tương tác trong phiên bản MVP."
      updatedAt="2026-07-16"
      updatedLabel="16 tháng 7, 2026"
      sections={sections}
    />
  );
}
