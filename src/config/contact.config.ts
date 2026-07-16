export const collaborationTypes = [
  "Booking quảng cáo",
  "Review sản phẩm",
  "Tham gia sự kiện",
  "Đại sứ thương hiệu",
  "Sản xuất video",
  "Truyền thông",
  "Khác",
] as const;

export const budgetRanges = [
  "Dưới 10 triệu đồng",
  "10–30 triệu đồng",
  "30–70 triệu đồng",
  "Trên 70 triệu đồng",
  "Cần trao đổi thêm",
] as const;

export const contactFileRules = {
  accept: ".pdf,.doc,.docx,.ppt,.pptx",
  extensions: [".pdf", ".doc", ".docx", ".ppt", ".pptx"],
  maxSize: 10 * 1024 * 1024,
  description: "PDF, DOC, DOCX, PPT hoặc PPTX · tối đa 10 MB · chỉ mô phỏng trên giao diện",
} as const;

export const expectedResponseTime = "Trong vòng 2–3 ngày làm việc";
