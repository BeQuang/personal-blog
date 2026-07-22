import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import "uplot/dist/uPlot.min.css";

import "./admin.css";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s | Admin",
  },
  description: "Admin Dashboard quản lý nội dung và analytics nội bộ.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AntdRegistry>{children}</AntdRegistry>;
}
