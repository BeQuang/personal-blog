import type { SocialPlatform } from "@/types";

export const SOCIAL_DESCRIPTION_MAX_LENGTH = 5000;
export const TIKTOK_AUTOMATION_ENABLED = false;

export interface SocialAudienceConfig {
  label: string | null;
  placeholder: string | null;
  help: string;
  editable: boolean;
}

const noAudiencePlatforms = new Set<SocialPlatform>(["email", "website"]);
const memberPlatforms = new Set<SocialPlatform>(["discord", "telegram"]);

export function getSocialAudienceConfig(platform: SocialPlatform): SocialAudienceConfig {
  if (noAudiencePlatforms.has(platform)) {
    return {
      label: null,
      placeholder: null,
      help: "Nền tảng này không hiển thị chỉ số người theo dõi.",
      editable: false,
    };
  }
  if (platform === "youtube") {
    return {
      label: "Người đăng ký",
      placeholder: null,
      help: "Tự động đồng bộ mỗi ngày; không thể sửa.",
      editable: false,
    };
  }
  if (memberPlatforms.has(platform)) {
    return {
      label: platform === "discord" ? "Thành viên máy chủ" : "Thành viên kênh",
      placeholder: "Ví dụ: 12500",
      help: "Nhập số thành viên đang hiển thị trên kênh.",
      editable: true,
    };
  }
  return {
    label: "Người theo dõi",
    placeholder: "Ví dụ: 50000",
    help: "Nhập số công khai gần nhất từ nền tảng.",
    editable: true,
  };
}
