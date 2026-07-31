"use client";

import { Tabs } from "antd";
import { useRouter } from "next/navigation";

import { AdminGalleryManager } from "@/components/admin/AdminGalleryManager";
import { AdminMediaLibrary } from "@/components/admin/AdminMediaLibrary";
import { startNavigationProgress } from "@/lib/loading-progress";
import type {
  AdminGalleryItem,
  AdminGalleryListQuery,
  AdminListPage,
  MediaLibraryPage,
  MediaMimeType,
  MediaOption,
  MediaPurpose,
} from "@/types";

type GalleryWorkspaceProps =
  | {
      activeTab: "gallery";
      gallery: {
        initialPage: AdminListPage<
          AdminGalleryItem,
          AdminGalleryListQuery["sortBy"]
        >;
        categories: readonly string[];
        mediaOptions: readonly MediaOption[];
        canWrite: boolean;
        canPublish: boolean;
      };
    }
  | {
      activeTab: "library";
      library: {
        data: MediaLibraryPage;
        filters: {
          query: string;
          mimeType: MediaMimeType | "all";
          purpose: MediaPurpose | "all";
        };
      };
    };

export function AdminGalleryWorkspace(props: GalleryWorkspaceProps) {
  const router = useRouter();

  const switchTab = (key: string) => {
    const nextTab = key === "library" ? "library" : "gallery";
    if (nextTab === props.activeTab) return;

    startNavigationProgress();
    router.replace(
      nextTab === "library"
        ? "/admin/gallery?tab=library"
        : "/admin/gallery",
    );
  };

  return (
    <div className="admin-gallery-workspace admin-panel">
      <Tabs
        activeKey={props.activeTab}
        onChange={switchTab}
        items={[
          {
            key: "gallery",
            label: "Gallery công khai",
            children: props.activeTab === "gallery"
              ? <AdminGalleryManager {...props.gallery} />
              : null,
          },
          {
            key: "library",
            label: "Thư viện ảnh",
            children: props.activeTab === "library"
              ? <AdminMediaLibrary {...props.library} />
              : null,
          },
        ]}
      />
    </div>
  );
}
