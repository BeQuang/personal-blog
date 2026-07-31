export type AdminSortOrder = "asc" | "desc";

export interface AdminListQuery<SortField extends string = string> {
  page: number;
  pageSize: number;
  sortBy: SortField;
  sortOrder: AdminSortOrder;
}

export interface AdminListPage<Item, SortField extends string = string>
  extends AdminListQuery<SortField> {
  items: readonly Item[];
  total: number;
}

export interface AdminPostListQuery
  extends AdminListQuery<"createdAt" | "publishedAt" | "status" | "title" | "updatedAt"> {
  query: string;
  status: "all" | "draft" | "scheduled" | "published";
  includeArchived: boolean;
}

export interface AdminVideoListQuery
  extends AdminListQuery<"contentStatus" | "createdAt" | "title" | "updatedAt"> {
  query: string;
  status:
    | "all"
    | "draft"
    | "scheduled"
    | "published"
    | "archived"
    | "pending"
    | "uploading"
    | "processing"
    | "ready"
    | "failed"
    | "deleted";
}

export interface AdminGalleryListQuery
  extends AdminListQuery<"createdAt" | "publishedAt" | "sortOrder" | "status" | "title" | "updatedAt"> {
  query: string;
  category: string;
}

export type AdminEventListQuery =
  AdminListQuery<"contentStatus" | "createdAt" | "startAt" | "title" | "updatedAt">;

export type AdminCampaignListQuery =
  AdminListQuery<"createdAt" | "endAt" | "startAt" | "status" | "title" | "updatedAt">;

export interface AdminSocialLinkListQuery
  extends AdminListQuery<"createdAt" | "enabled" | "followerCount" | "label" | "sortOrder" | "updatedAt"> {
  query: string;
  platform:
    | "all"
    | "facebook"
    | "youtube"
    | "tiktok"
    | "instagram"
    | "x"
    | "threads"
    | "zalo"
    | "telegram"
    | "discord"
    | "website"
    | "email";
}
