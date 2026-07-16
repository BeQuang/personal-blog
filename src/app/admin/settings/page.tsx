import type { Metadata } from "next";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export const metadata: Metadata = { title: "Cài đặt" };

export default function AdminSettingsPage() {
  return <AdminSettingsForm />;
}
