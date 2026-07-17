import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";

import "./admin.css";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard demo",
    template: "%s | Admin demo",
  },
  description: "Giao diện Admin Dashboard dùng dữ liệu mock, không có backend.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AntdRegistry>{children}</AntdRegistry>;
}
