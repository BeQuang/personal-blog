import "server-only";

export {
  getFeaturedPosts,
  getPostBySlug,
  getPostsByCategory,
  getPublishedPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
} from "@/server/services/posts.service";
