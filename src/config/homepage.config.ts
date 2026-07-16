import type { HomepageConfig } from "@/types";

export const homepageConfig = {
  hero: {
    eyebrow: "Creator · Storyteller · Người bạn đồng hành",
    description:
      "Chia sẻ về TikTok, YouTube, công nghệ, cuộc sống và những câu chuyện thú vị mỗi ngày.",
    topics: ["TikTok", "YouTube", "Đời sống", "Công nghệ", "Giải trí"],
    statistics: [
      { value: "250K+", label: "Người theo dõi" },
      { value: "120+", label: "Video" },
      { value: "30M+", label: "Lượt xem" },
    ],
  },
  socialLinks: {
    eyebrow: "Kết nối",
    title: "Gặp Quang trên nền tảng bạn yêu thích",
    description:
      "Theo dõi nội dung mới, câu chuyện hậu trường và những buổi trò chuyện trực tiếp.",
  },
  featuredContent: {
    eyebrow: "Lựa chọn tuần này",
    title: "Nội dung nổi bật",
  },
  latestPosts: {
    eyebrow: "Góc chia sẻ",
    title: "Bài viết mới nhất",
    description:
      "Kinh nghiệm sáng tạo, công nghệ và những ghi chép chân thật trong hành trình làm nội dung.",
  },
  latestVideos: {
    eyebrow: "Vừa lên sóng",
    title: "Video mới nhất",
    description:
      "Từ video dọc ngắn gọn đến vlog dài hơn — không tự động phát, bạn là người chọn lúc xem.",
  },
  gallery: {
    eyebrow: "Qua ống kính",
    title: "Những khoảnh khắc gần đây",
    description:
      "Một chút hậu trường, vài chuyến đi và những cuộc gặp đáng nhớ cùng cộng đồng.",
  },
  events: {
    eyebrow: "Hẹn gặp nhau",
    title: "Sự kiện sắp tới",
    description:
      "Lịch livestream, công chiếu và workshop để chúng ta không bỏ lỡ nhau.",
  },
  campaign: {
    eyebrow: "Đang diễn ra",
    title: "Tham gia chiến dịch mới",
  },
  newsletter: {
    eyebrow: "Thư gửi bạn",
    title: "Một email nhỏ khi có điều đáng kể",
    description:
      "Nhận bài viết mới, lịch phát sóng và lời mời sự kiện. Không spam, không gửi email thật trong bản demo này.",
    privacyNote: "Bản demo chỉ kiểm tra định dạng và không lưu địa chỉ email.",
  },
  collaboration: {
    eyebrow: "Cùng tạo điều hay",
    title: "Bạn muốn hợp tác cùng Quang?",
    description:
      "Booking quảng cáo, review sản phẩm, tham gia sự kiện hoặc xây dựng một chiến dịch truyền thông chỉn chu và phù hợp với cộng đồng.",
  },
} as const satisfies HomepageConfig;
