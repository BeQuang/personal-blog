import type { Campaign } from "@/types";

export const campaigns = [
  {
    id: "campaign-001",
    title: "Giveaway Góc sáng tạo tháng Tám",
    slug: "giveaway-goc-sang-tao-thang-tam",
    description:
      "Chia sẻ góc làm việc của bạn và có cơ hội nhận một bộ đèn nhỏ gọn dành cho quay video tại nhà.",
    banner: "/images/creator/scene-08.jpg",
    startAt: "2026-07-01T00:00:00.000Z",
    endAt: "2026-08-15T16:59:59.000Z",
    status: "active",
    buttonLabel: "Xem cách tham gia",
    rules: [
      "Theo dõi kênh TikTok và YouTube của Quang",
      "Đăng ảnh góc sáng tạo ở chế độ công khai",
      "Gắn hashtag #GocSangTaoCungQuang",
    ],
    terms: [
      "Mỗi người chỉ gửi một bài dự thi",
      "Bài dự thi phải do người tham gia tự chụp",
      "Kết quả được công bố trên các kênh chính thức",
    ],
    featured: true,
  },
  {
    id: "campaign-002",
    title: "Thử thách 7 ngày kể chuyện bằng video",
    slug: "thu-thach-7-ngay-ke-chuyen-bang-video",
    description:
      "Mỗi ngày hoàn thành một bài tập ngắn để xây dựng thói quen quan sát và kể chuyện rõ ràng hơn.",
    banner: "/images/creator/scene-01.jpg",
    startAt: "2026-08-24T00:00:00.000Z",
    endAt: "2026-08-30T16:59:59.000Z",
    status: "upcoming",
    buttonLabel: "Đăng ký nhắc lịch",
    rules: [
      "Đăng ký bằng biểu mẫu của chương trình",
      "Hoàn thành ít nhất năm trong bảy bài tập",
      "Tôn trọng bản quyền hình ảnh và âm thanh",
    ],
    terms: [
      "Chương trình không thu phí",
      "Nội dung gửi về có thể được giới thiệu lại khi có sự đồng ý",
    ],
    featured: false,
  },
  {
    id: "campaign-003",
    title: "Cùng nhau trồng 1.000 cây xanh",
    slug: "cung-nhau-trong-1000-cay-xanh",
    description:
      "Chiến dịch cộng đồng quy đổi các video chia sẻ thói quen xanh thành cây giống cho khu vực cần phục hồi.",
    banner: "/images/creator/scene-04.jpg",
    startAt: "2026-04-01T00:00:00.000Z",
    endAt: "2026-05-31T16:59:59.000Z",
    status: "ended",
    buttonLabel: "Xem tổng kết",
    rules: [
      "Chia sẻ một thói quen xanh có thể áp dụng hằng ngày",
      "Sử dụng hashtag #1000CayXanh",
      "Không sử dụng nội dung sao chép",
    ],
    terms: [
      "Chiến dịch đã kết thúc",
      "Báo cáo tổng kết được công bố công khai",
    ],
    featured: false,
  },
  {
    id: "campaign-004",
    title: "Media Kit dành cho đối tác 2027",
    slug: "media-kit-danh-cho-doi-tac-2027",
    description:
      "Bản giới thiệu định hướng nội dung và các hình thức hợp tác dự kiến cho năm 2027.",
    banner: "/images/creator/scene-02.jpg",
    startAt: "2026-11-01T00:00:00.000Z",
    endAt: "2027-01-31T16:59:59.000Z",
    status: "draft",
    buttonLabel: "Liên hệ hợp tác",
    buttonUrl: "/contact",
    rules: ["Dành cho nhãn hàng và đối tác truyền thông"],
    terms: [
      "Thông tin hiện đang được hoàn thiện và chưa phải đề nghị thương mại chính thức",
    ],
    featured: false,
  },
] as const satisfies readonly Campaign[];
