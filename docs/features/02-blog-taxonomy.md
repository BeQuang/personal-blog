# Blog và taxonomy

## Người dùng sử dụng

- `/blog`: xem bài nổi bật, tìm title/excerpt, lọc category/tag và tải thêm.
- `/blog/[slug]`: xem cover, metadata, nội dung block, bài liên quan và share.
- Page view được ghi qua `AnalyticsView` sau consent.

## Quản trị

Tại `/admin/posts`:

- Tạo/sửa post.
- Chọn category, nhiều tag, thumbnail và cover từ Media Library.
- Chọn `draft`, `scheduled`, `published`, `archived`.
- Bật/tắt featured.
- Quản lý category và tag.

Editor có `content:write` nhưng không publish/schedule. Admin/super admin có `content:publish`.

## Source ownership

| Vai trò | Source |
| --- | --- |
| Public routes | `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx` |
| Public UI | `src/components/blog/*` |
| Public facade | `src/services/post.service.ts` |
| Actions | `posts.actions.ts`, `taxonomies.actions.ts` |
| Validation | `src/server/validation/posts.validation.ts` |
| Services | `posts.service.ts`, `taxonomies.service.ts` |
| Repositories | `posts.repository.ts`, `categories.repository.ts`, `tags.repository.ts` |
| Mapper/types | `posts.mapper.ts`, `types/post.ts`, `types/content-admin.ts` |
| Schema | `schema/posts.ts` |
| Mock fallback | `src/data/posts.ts` |

## Content blocks

`heading`, `paragraph`, `image`, `quote`, `list`, `code`, `video`, `cta`, `divider`. Mở rộng block phải cập nhật đồng thời:

1. `PostContentBlock` type.
2. Zod discriminated union.
3. `PostContent` renderer.
4. Admin editor serialization/UI.
5. Seed/mock fixture và tests.

## Business rules

- Title 3–180, excerpt 10–500, ít nhất một content block.
- Slug được normalize/tạo từ title và unique case-insensitive.
- Reading time 1–999.
- Category bắt buộc; tag IDs được deduplicate, tối đa 30.
- Thumbnail/cover phải là media public ready image.
- `published` cần `publishedAt <= now`; thiếu thì service đặt thời điểm hiện tại.
- `scheduled` cần thời gian tương lai.
- Public repository chỉ trả status `published`; scheduler tự chuyển scheduled chưa tồn tại.
- Archive là soft state và xóa khỏi public.

## Revalidation

Post/taxonomy mutation revalidate:

- `/admin/posts`
- `/blog`
- `/blog/[slug]`
- slug cụ thể khi biết
- `/`
- `/sitemap.xml`

## Tránh lặp code

- Dùng `PostCard`, `FeaturedPost`, `PostContent`.
- Dùng `AdminPostEditorModal`, `AdminTaxonomyManager`, `AdminMediaPicker`.
- Dùng `createSlug/parseSlug/slugSchema`; không tự viết slug helper mới.
- Public page chỉ gọi facade `@/services/post.service`.

## Kiểm tra

```bash
npm run content:test:service
npm run content:test
npm run content:test:authorization
npm run type-check
```

Kiểm tra thêm metadata/404 cho slug, scheduled date, duplicate slug và permission editor.

