export type PostStatus = "draft" | "published" | "scheduled";

export type PostContentBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; style: "ordered" | "unordered"; items: readonly string[] }
  | { type: "code"; language: string; code: string }
  | { type: "video"; url: string; title: string }
  | {
      type: "cta";
      title: string;
      description: string;
      label: string;
      href: string;
    }
  | { type: "divider" };

export interface PostAuthor {
  name: string;
  avatar?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: readonly PostContentBlock[];
  thumbnail: string;
  coverImage?: string;
  category: string;
  tags: readonly string[];
  author: PostAuthor;
  status: PostStatus;
  featured: boolean;
  readingTime: number;
  viewCount?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
