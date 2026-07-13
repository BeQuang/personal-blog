export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  alt: string;
  width?: number;
  height?: number;
  createdAt: string;
}
