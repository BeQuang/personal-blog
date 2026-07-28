# Blog và taxonomy

## Người dùng sử dụng

- `/blog`: xem bài nổi bật, tìm title/excerpt, lọc category/tag và tải thêm.
- `/blog/[slug]`: xem cover, metadata, nội dung block, bài liên quan và share.
- Page view được ghi qua `AnalyticsView` sau consent.

## Quản trị

Tại `/admin/posts`:

- Tạo/sửa post.
- Soạn nội dung bằng `AdminPostContentEditor`: mặc định là editor trực quan cho 9 loại block, có thêm/xóa/nhân bản/di chuyển và biểu mẫu tiếng Việt theo từng loại. Tab JSON nâng cao hiển thị dữ liệu được sinh ra, cho phép developer sửa/định dạng rồi áp dụng ngược vào editor sau khi schema dùng chung xác nhận hợp lệ.
- Bảng bài viết đánh STT bằng số thường và liên tục theo trang. Toolbar lọc không dùng nền card: trên desktop, search và trạng thái có cùng chiều cao, luôn nằm trên một hàng trong cụm bên trái; toggle **Hiện bài đã lưu trữ** cùng chiều cao được đẩy sang phải. Dropdown trạng thái chỉ quản lý draft/scheduled/published, còn bài `archived` mặc định bị loại khỏi kết quả và được hiển thị bổ sung bằng toggle riêng.
- Bảng bài viết dùng pagination server-side: mặc định 10 dòng, cho chọn 10/20/50, hiển thị tổng và tính STT theo `pageSize` đang chọn. Search, trạng thái, toggle lưu trữ, trang, số dòng và thứ tự đều được gửi tới `GET /api/admin/posts`; service validate và repository thực hiện filter + `COUNT + LIMIT + OFFSET + ORDER BY`. Filter đưa bảng về trang 1. Mặc định bài mới chỉnh sửa đứng trước (`updatedAt desc`); header tiêu đề, trạng thái và ngày cho phép đổi thứ tự bằng allowlist server.
- Tiêu đề trang dùng mô tả hướng người quản trị: **Quản lý nội dung, lịch xuất bản, phân loại và tối ưu SEO cho bài viết.** Cụm toggle lưu trữ có viền tím-xám nhẹ để tách khỏi nền toolbar nhưng không dùng bóng hoặc nền card.
- Chọn category, nhiều tag; thumbnail và cover có thể dùng asset trong Media Library hoặc tải ảnh mới từ máy ngay trong picker.
- Chọn `draft`, `scheduled`, `published`, `archived`.
- Thời điểm lên lịch/xuất bản dùng picker ngày giờ dùng chung, hiển thị `DD/MM/YYYY HH:mm` và tiếp tục gửi ISO cho service.
- Bật/tắt featured.
- Quản lý category và tag bằng modal rộng 820 px. Modal dùng table có STT, tên, slug, thao tác và pagination server-side; mặc định cho chọn 10, 20 hoặc 50 dòng mỗi trang, đồng thời component nhận mảng `pageSizeOptions` khác khi màn hình cần cấu hình riêng. Footer pagination được tách thành hai cụm độc lập: bộ chọn số dòng đứng trước tổng bản ghi và bám góc trái, còn toàn bộ nút chuyển trang bám góc phải. Chỉ khi mở modal, đổi trang hoặc đổi số dòng mới gọi `GET /api/admin/taxonomies`, vì vậy response của UI quản lý không trả toàn bộ taxonomy cùng lúc. Service xác thực `content:view`, validate `page/pageSize/sortBy/sortOrder`, giới hạn `pageSize` tối đa 100 và chỉ cho sort theo trường allowlist.
- Trên desktop, vùng `/admin/posts` được giới hạn trong phần viewport còn lại dưới Admin header: page không cuộn dọc, toolbar và pagination giữ nguyên vị trí. Manager đo chiều cao tối đa còn lại từ đầu panel đến đáy page và truyền phần dành cho row vào `Table.scroll.y`; panel tự co theo số row thực tế, chỉ body cuộn khi dữ liệu vượt giới hạn. Pagination bỏ margin mặc định để luôn bám sát hàng cuối và viền đáy của panel.

Page dùng `getAdminPostsPageData` để kiểm tra `content:view` đúng một lần và tạo trang DTO đầu tiên cho manager. Lượt đọc bài viết thực hiện `COUNT + items` trong giới hạn pool, sau đó category → tag → media được đọc tuần tự; không gom các nguồn độc lập này vào một `Promise.all` khi production vẫn dùng pool serverless nhỏ.

Editor có `content:write` nhưng không publish/schedule. Admin/super admin có `content:publish`.

## Source ownership

| Vai trò | Source |
| --- | --- |
| Public routes | `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx` |
| Public UI | `src/components/blog/*` |
| Public facade | `src/services/post.service.ts` |
| Actions | `posts.actions.ts`, `taxonomies.actions.ts` |
| Admin read API | `src/app/api/admin/posts/route.ts`, `src/app/api/admin/taxonomies/route.ts` |
| Validation | `src/lib/post-content-blocks.ts`, `src/lib/url-schema.ts`, `src/server/validation/posts.validation.ts` |
| Services | `admin-posts-page.service.ts`, `posts.service.ts`, `taxonomies.service.ts` |
| Repositories | `posts.repository.ts`, `categories.repository.ts`, `tags.repository.ts` |
| Mapper/types | `posts.mapper.ts`, `types/post.ts`, `types/content-admin.ts` |
| Schema | `schema/posts.ts` |
| Mock fallback | `src/data/posts.ts` |

## Content blocks

`heading`, `paragraph`, `image`, `quote`, `list`, `code`, `video`, `cta`, `divider`. Admin không phải nhập JSON ở luồng mặc định: mỗi block có trường được đặt tên bằng tiếng Việt; block ảnh cho phép chọn nhanh URL từ Media Library. JSON nâng cao là bản xem trước hai chiều, nhưng thay đổi từ tab này chỉ đi vào form sau khi bấm **Áp dụng & xem trực quan**; JSON sai hoặc hợp lệ nhưng chưa áp dụng sẽ chặn submit để tránh lưu nhầm dữ liệu cũ.

Schema block và JSON parser dùng chung ở `src/lib/post-content-blocks.ts` được cả client editor và server post validator sử dụng, nên hai chế độ có cùng quy tắc. JSON nâng cao được kiểm tra tự động mỗi khi nhập: lỗi cú pháp ưu tiên báo dòng/cột, lỗi schema chỉ rõ block không hợp lệ; nút định dạng/áp dụng bị khóa cho tới khi sửa xong. `src/server/validation/url.validation.ts` giữ server-only boundary và re-export các URL schema client-safe từ `src/lib/url-schema.ts`.

Mở rộng block phải cập nhật đồng thời:

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
- Dùng `AdminPostEditorModal`, `AdminPostContentEditor`, `AdminTaxonomyManager`, `AdminMediaPicker`.
- Dùng `createSlug/parseSlug/slugSchema`; không tự viết slug helper mới.
- Public page chỉ gọi facade `@/services/post.service`.
- Admin Posts page chỉ gọi `getAdminPostsPageData`; không ghép lại bốn service read riêng ở page.

## Kiểm tra

```bash
npm run content:test:service
npm run content:test
npm run content:test:authorization
npm run type-check
```

Kiểm tra thêm metadata/404 cho slug, scheduled date, duplicate slug và permission editor.

Kiểm tra đủ 9 block trong editor trực quan: thêm, nhập trường bắt buộc, nhân bản, đổi thứ tự và xóa. Chuyển sang JSON phải thấy đúng thứ tự/dữ liệu; JSON sai hiển thị lỗi, JSON hợp lệ nhưng chưa áp dụng chặn submit, còn **Áp dụng & xem trực quan** phải cập nhật lại toàn bộ block mà không mất dữ liệu.

Kiểm tra visual hierarchy của editor ở desktop/mobile: hai tab và body dùng chung một khung viền nhẹ; phần tóm tắt **Nội dung bài viết** cùng nút **Thêm nội dung** liền sát tab, không có viền riêng và nằm ngoài vùng cuộn. Danh sách block có chiều cao tối đa theo viewport, chỉ danh sách này cuộn với overscroll được chặn; sau khi thêm block, vùng cuộn tự đưa block mới vào cuối danh sách. Danh sách block/JSON chỉ thụt vào bằng padding nhỏ. Nút **Thêm nội dung** luôn có chữ/icon trắng tương phản trên nền tím và chỉ dùng bóng ngắn; mỗi block có một viền xám nhẹ, một bóng đồng nhất, trạng thái focus tím nhạt và padding đủ để input không dính sát cạnh card.

Kiểm tra cả hai nhánh chọn thumbnail/cover có sẵn và tải mới trong cả form tạo mới lẫn chỉnh sửa; hai media ID phải là field đã đăng ký của form, ảnh vừa chọn phải hiển thị ngay và được gửi trong mutation. Ảnh tải mới phải dùng purpose `post_thumbnail`/`post_cover`, được thêm vào Media Library và tự động gắn media ID vào post form.

Khi thay đổi page loader, mô phỏng `NODE_ENV=production` với `DATABASE_POOL_MAX=2`; loader phải hoàn tất và không phát sinh nhóm từ ba database query song song.

Kiểm tra `/admin/posts` ở viewport desktop thấp và cao: document không xuất hiện thanh cuộn dọc, breadcrumb/page heading/toolbar/pagination vẫn nằm trong màn hình, chỉ phần row của table cuộn và header cột giữ nguyên khi cuộn.

Kiểm tra filter bài viết: toolbar không có nền card; ở desktop search/trạng thái cùng chiều cao, không xuống dòng và nằm bên trái, toggle cùng chiều cao nằm sát phải. Ở mobile các control được phép xếp dọc để không tràn viewport. Lần đầu mở trang không có row `archived`; bật **Hiện bài đã lưu trữ** phải bổ sung các row lưu trữ, tắt lại phải ẩn ngay. Search/trạng thái/toggle đều đưa pagination về trang 1; đổi 10/20/50 phải đổi số row và STT tiếp tục đúng theo page size đang chọn; pagination phải bám sát hàng cuối và viền đáy.

Kiểm tra hai modal taxonomy: chiều rộng desktop 820 px và co trong viewport mobile; form thêm được tách khỏi bảng bằng khoảng trống rõ ràng; bảng có STT/tên/slug/thao tác, mặc định 10 item mỗi trang, cho chọn 10/20/50 hoặc mảng `pageSizeOptions` riêng và pagination dùng `total` từ server. Footer phải hiển thị theo thứ tự **số dòng → tổng bản ghi** ở góc trái, trong khi cụm nút chuyển trang giữ ở góc phải. Mở modal, chuyển trang, đổi số dòng, tạo, sửa và xóa phải tải lại đúng trang; xóa item cuối trang phải lùi về trang hợp lệ. API phải từ chối `pageSize > 100`; gọi `GET /api/admin/taxonomies` khi chưa có `content:view` phải bị từ chối và mọi response phải `private, no-store`.
