# Gallery và Media Library

## Người dùng sử dụng

- `/gallery`: lọc category, mở lightbox, xem caption và điều hướng bằng nút/bàn phím.
- Lightbox giới hạn theo viewport; vùng caption dài cuộn riêng để ảnh và nút điều hướng không đẩy dialog vượt màn hình.
- Trang chủ dùng gallery preview giới hạn số item.
- Chỉ item public/published được render.

## Quản trị

`/admin/gallery` dùng một workspace chung với hai tab tách biệt để người quản trị
không nhầm dữ liệu nội dung với tệp gốc:

- Workspace không lặp lại heading/description trong content; breadcrumb của route
  nằm trong header Admin. Thanh tab và nội dung tab đang mở cùng nằm trong một
  panel duy nhất.
- Workspace giữ chiều cao trong phần viewport còn lại dưới header và chừa padding
  8 px quanh nội dung tab. Ở tab Gallery, chỉ body row của bảng cuộn; header cột, bộ
  lọc và pagination luôn nhìn thấy. Body table dùng chiều cao cố định `70vh` ngay
  cả khi trang hiện tại có ít row. Ở tab Thư viện ảnh, chỉ vùng lưới/chi tiết
  media cuộn; heading, upload và bộ lọc đứng yên. Đáy workspace luôn
  cách mép `.admin-content` 16 px khi đạt chiều cao tối đa. Chuỗi wrapper của
  Ant Tabs phải truyền toàn bộ chiều cao khả dụng xuống tab pane để hai panel
  sử dụng hết vùng nội dung, không tạo khoảng trắng dư bên dưới.
- **Gallery công khai**: tạo/sửa/archive item, category, alt, sort order, status; ảnh có thể chọn từ thư viện hoặc tải mới từ máy ngay trong picker. Modal editor rộng 1.040 px trên desktop, không dùng `Form.Item` có label cho hidden media ID để preview nằm sát trường Ảnh. Khi tạo mới, picker chạy chế độ multiple và mỗi ảnh có title/alt riêng; caption/category/status dùng chung, còn sort order tăng tuần tự từ giá trị bắt đầu. Khi sửa, picker giữ chế độ single.
- Bảng Gallery có cột Danh mục riêng, search theo title/description/alt/category và
  select lọc category. `GET /api/admin/gallery` nhận các filter cùng
  `page/pageSize/sortBy/sortOrder`; repository áp dụng `WHERE` trước
  `COUNT + LIMIT/OFFSET`, mặc định theo `sortOrder asc`.
- Select category dùng lookup distinct có giới hạn tối đa 100 giá trị; đây là
  danh sách cấu hình bounded, không phải collection Gallery phân trang.
- Thời điểm scheduled/published dùng picker ngày giờ dùng chung thay cho input native; contract gửi server vẫn là ISO.
- **Thư viện ảnh**: upload, search/filter/sort, chọn media và xóa asset chưa được sử dụng.
- Nội dung tab Thư viện ảnh dùng hai cột 50/50 trên desktop: toàn bộ khối upload
  nằm bên trái, còn toolbar và lưới ảnh nằm bên phải. Preview file mới thuộc khối
  upload và nằm dưới form. Dưới 1.200 px, hai panel xếp dọc thành hai hàng có vùng
  cuộn riêng để không vỡ viewport. File input cho phép chọn hoặc thêm nhiều ảnh
  vào một batch; purpose dùng chung cho batch, còn alt text được nhập riêng trên
  từng preview. Chọn file chỉ validate và tạo Object URL cục bộ; chưa presign
  hoặc PUT R2. Người dùng phải bấm **Xác nhận upload** thì client mới tải tuần tự
  từng ảnh bằng luồng direct-to-R2 hiện có. Ảnh thành công được bỏ khỏi hàng chờ;
  ảnh lỗi được giữ lại kèm thông báo để sửa hoặc thử lại.
- Mỗi lần mở trang chỉ tải dữ liệu của tab đang hoạt động. Thư viện ảnh gọi
  `GET /api/admin/media` để lấy batch đầu tiên và tự gọi batch kế tiếp khi sentinel
  gần đáy vùng cuộn. UI không hiển thị pagination; khi số item đã tích lũy bằng
  `total` thì dừng observer. Search/filter/sort luôn reset về batch 1 và được áp
  dụng trong database trước `COUNT`, nên tác động lên toàn bộ tập dữ liệu thay vì
  chỉ các ảnh đã tải. Mỗi batch mặc định 10 ảnh; contract vẫn mang
  `page/pageSize/sortBy/sortOrder` xuyên suốt và repository thực hiện
  `COUNT + LIMIT/OFFSET + ORDER BY` với ID làm tie-breaker.

## Source ownership

| Vai trò | Source |
| --- | --- |
| Public | `src/app/gallery/page.tsx`, `components/gallery/GalleryExplorer.tsx`, `home/GalleryLightbox.tsx` |
| Admin | `AdminGalleryWorkspace`, `AdminGalleryManager`, `AdminMediaLibrary`, `AdminMediaPicker` |
| Actions/API | `gallery.actions.ts`, `media.actions.ts`, `GET /api/admin/gallery`, `GET /api/admin/media` |
| Services | `gallery.service.ts`, `media.service.ts` |
| Storage | `src/server/storage/*` |
| Validation | `src/server/validation/media.validation.ts` |
| Repositories | `gallery.repository.ts`, `media.repository.ts` |
| Schema | `schema/gallery.ts`, `schema/media.ts` |

## Image upload flow

1. Admin chọn một hoặc nhiều file và purpose; browser validate MIME/size rồi tạo
   preview cục bộ, cho phép nhập alt riêng cho từng ảnh.
2. Chỉ sau khi Admin bấm **Xác nhận upload**, client mới xử lý tuần tự từng ảnh
   và `createMediaUploadAction` mới kiểm tra `media:manage`.
3. Service validate tên, MIME, extension và size.
4. Tạo object key ngẫu nhiên, presigned PUT 5 phút và signed upload ticket gắn user.
5. Browser PUT thẳng R2 với đúng `Content-Type`.
6. Browser gửi ticket + alt + dimensions để confirm.
7. Backend kiểm tra ticket owner/expiry, object metadata, size, MIME và magic signature.
8. Backend ghi `media_assets` status `ready`.
9. Khi upload bắt đầu từ `AdminMediaPicker`, nhánh `Tải từ máy` chỉ validate và tạo Object URL để preview cục bộ. Admin có thể xem, nhập alt riêng, bỏ hoặc thêm ảnh; presign/PUT chỉ bắt đầu sau khi bấm **Xác nhận tải**. Vùng preview tái sử dụng đúng cấu trúc card, toolbar và vùng cuộn có giới hạn chiều cao của màn hình Media Library để ảnh không thoát khỏi card hoặc phủ modal. Picker thêm asset vừa confirm vào danh sách hiện tại, tự động chọn media ID/URL vào form và không buộc người dùng tải lại trang. Ảnh lỗi được giữ trong preview để thử lại.

Allowed:

- JPEG/JPG
- PNG
- WebP
- AVIF
- tối đa 10 MB; avatar tối đa 5 MB

Purpose: `avatar`, `campaign_banner`, `event_banner`, `gallery`, `post_cover`, `post_thumbnail`, `site_banner`.

## Gallery rules

- `mediaAssetId` bắt buộc và phải trỏ tới image public ready.
- Title 2–180, caption tối đa 500, category 1–100, alt 3–300.
- Sort order 0–100.000.
- Publish now không nhận thời gian tương lai.
- Scheduled cần thời gian tương lai, nhưng chưa có scheduler tự publish.
- Xóa gallery item không xóa file gốc.

## Media delete rules

- Chỉ xóa asset do R2 quản lý, status ready và chưa soft-delete.
- Repository kiểm tra references từ post/gallery/event/campaign/settings/video.
- Nếu đang dùng, service trả conflict kèm usage.
- Nếu object deletion thất bại, DB restore record để tránh dangling state.
- Audit orphan bằng `npm run storage:orphans`; lệnh delete là thao tác destructive riêng.

## Environment

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`
- `MEDIA_ORPHAN_MIN_AGE_HOURS`

## Tránh lặp code và kiểm tra

- Mọi màn hình chọn ảnh dùng `AdminMediaPicker`. Component có hai nhánh `Media Library` và `Tải từ máy`; caller bắt buộc truyền đúng `MediaPurpose`.
- `AdminMediaPicker` hỗ trợ `single` mặc định và `multiple` theo opt-in. Chế độ
  multiple giữ vùng chọn nháp trong modal, cho phép toggle nhiều asset hoặc chọn
  nhiều file từ máy. Cả hai chế độ đều preview file cục bộ, nhập alt riêng và
  yêu cầu xác nhận trước khi upload tuần tự; không tạo presign khi vừa chọn file.
  Ở chế độ multiple, picker giữ đúng thứ tự người dùng chọn và chỉ trả selection
  khi người dùng xác nhận vùng chọn; chế độ single tự chọn asset sau khi upload
  thành công. Các picker thumbnail, cover, banner và avatar hiện có tiếp tục dùng
  single.
- `AdminMediaLibrary` và `AdminMediaPicker` cùng dùng `uploadMediaImage`; không nhân đôi validate, presign, PUT R2, đọc dimensions hoặc confirm.
- Không upload binary qua Next.js; giữ direct-to-R2.
- Không tự tạo presigned URL ngoài `MediaStorage`.
- Luôn dùng validator signature hiện có.

Kiểm tra picker tại Posts, Videos, Gallery, Events, Campaigns và Settings: chọn asset có sẵn vẫn hoạt động; upload JPEG/PNG/WebP/AVIF hợp lệ tự chọn asset mới; MIME/size sai hiển thị lỗi; avatar giữ giới hạn 5 MB và các purpose khác giữ giới hạn 10 MB.

```bash
npm run storage:test
npm run storage:test:database
npm run storage:test:security
npm run type-check
```
