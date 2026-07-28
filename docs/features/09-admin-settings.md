# Admin CMS và Site Settings

## Admin shell

`AdminShell` cung cấp sidebar/navigation, current user, responsive behavior và logout. Nút logout trong header dùng hộp xác nhận Ant Design, ưu tiên focus vào **Ở lại** và chỉ gọi Server Action khi người dùng xác nhận **Đăng xuất**. Ant Design được đăng ký trong admin layout để SSR style đúng, dùng locale `vi_VN`; uPlot stylesheet chỉ được nạp ở admin.

Sidebar desktop dùng vị trí cố định theo viewport, có vùng cuộn riêng và phần content chừa đúng 252 px. `admin-route-root`, shell và content cùng dùng nền admin sáng nên khi dashboard dài hơn viewport không lộ nền dark của website public. Mọi vùng cuộn trong Admin, kể cả body trang, sidebar, table, modal/confirm, drawer và popup Ant Design, dùng chung track trắng xám nhẹ cùng thumb xám trung tính thay cho scrollbar tối của hệ điều hành. Card trong lưới dashboard được cân chiều cao theo hàng, còn card bảng độc lập phải giữ chiều cao tự nhiên theo nội dung để không tạo khoảng trắng và vùng cuộn giả. Dưới 992 px, sidebar desktop được thay bằng Drawer và content trở về toàn chiều rộng.

Mọi `.admin-table-panel` dùng header cột và vùng pagination tím nhạt theo bảng màu badge **Admin MVP**; trang active dùng nền tím đậm và chữ trắng để dễ nhận biết. Pagination bỏ margin mặc định của Ant Design để bám sát nội dung và viền đáy panel.

Mọi Ant Design `Table` trong Admin phải dùng `adminTablePaginationDefaults`: mặc định 10 dòng, cho chọn 10/20/50, luôn hiển thị tổng; cụm số dòng + tổng nằm trái và cụm chuyển trang nằm phải. Table có dữ liệu tăng trưởng phải truyền `page/pageSize/sortBy/sortOrder` qua Route Handler → service → repository; repository áp dụng filter trước `COUNT + LIMIT + OFFSET + ORDER BY`, response chuẩn là `{ items, total, page, pageSize, sortBy, sortOrder }`. `sortBy` luôn là allowlist, `pageSize` tối đa 100 và có tie-breaker ID ổn định. Tập DTO nhỏ có bound được ghi rõ mới được phân trang cục bộ. Mảng lựa chọn riêng phải qua helper normalize dùng chung và không vượt giới hạn server.

`npm run table:audit` quét toàn bộ TSX trong `src`; `npm run api:list-audit` kiểm tra GET collection Route Handler dùng boundary phân trang chung. `npm run ai:check` gọi cả hai audit để từ chối Table thiếu pagination hoặc list API mới không có contract phân trang/sắp xếp.

Riêng `/admin/posts`, content được giới hạn theo chiều cao còn lại dưới header để document không cuộn dọc; page heading, toolbar lọc và pagination ở ngoài vùng cuộn. Manager đo khoảng tối đa từ đầu table panel đến đáy page rồi truyền phần dành cho row vào `Table.scroll.y`; panel co theo số row thực tế, chỉ body row cuộn khi vượt giới hạn, còn header cột và pagination luôn hiển thị.

Điều hướng menu gọi `startNavigationProgress` trước `router.push`; `app/admin/(protected)/loading.tsx` hiển thị skeleton trong content nhưng giữ nguyên sidebar/header tương tác được. Filter/pagination dùng router theo cùng quy ước. Upload R2/Mux kéo dài cũng tham gia NProgress, đồng thời vẫn giữ progress/nút pending chuyên biệt.

Các trường ảnh dùng `AdminMediaPicker` thống nhất hai lựa chọn: chọn asset sẵn có trong Media Library hoặc tải ảnh từ máy. Nhánh tải mới gọi helper direct-to-R2 dùng chung, phân loại theo purpose của trường, confirm asset rồi tự động chọn media ID/URL vào form đang mở.

Admin navigation hiện có:

- Tổng quan
- Bài viết
- Mạng xã hội
- Video
- Hình ảnh
- Sự kiện
- Chiến dịch
- Hộp thư & đăng ký
- Giao diện
- Cài đặt

## Reusable admin components

Tra các module này trước khi tạo UI CRUD:

- `AdminPageHeader`
- `AdminDateTimePicker`
- `AdminDateRangePicker`
- `AdminAnalyticsDateFilter`
- `AdminModal`
- `AdminPostContentEditor`
- `AdminResourceTable`
- `AdminResourceEditorModal`
- `AdminMediaPicker`
- `AdminMediaLibrary`
- `AdminTaxonomyManager`
- `NavigationProgressProvider` và helper `src/lib/loading-progress.ts`
- các manager/editor chuyên domain
- `admin-table-columns.tsx`
- `admin-table.config.ts`

Pattern chuẩn:

```text
Server page fetch DTO + current permission
-> Client manager nhận initial data/can*
-> modal/form gọi Server Action
-> Action trả AdminActionResult
-> toast + router.refresh
-> Action revalidate server routes
```

Mọi trường ngày/giờ trong Admin phải tái sử dụng `AdminDateTimePicker` hoặc `AdminDateRangePicker`. Không dùng `input type="date"`/`datetime-local`; picker hiển thị `DD/MM/YYYY`, hỗ trợ lịch tiếng Việt và chuyển lại chuỗi hiện hành trước khi gửi service để giữ nguyên server contract.

Mọi form popup Ant Design trong Admin phải dùng `AdminModal`, không import `Modal` trực tiếp. Component này bật `scrollLock`, căn giữa và áp dụng trực tiếp semantic `styles` của Ant Design 6: wrapper `overflow: hidden`, container tối đa `80dvh`, header/footer không cuộn và chỉ body cuộn dọc với `overscroll-behavior: contain`. Quy tắc không phụ thuộc thứ tự stylesheet hoặc vị trí portal. Các hộp xác nhận tạo bởi `App.useApp().modal` dùng quy tắc overflow tương đương trong `admin.css`.

## Site Settings

`/admin/settings` sửa:

- site name/description
- creator name/username/contact email
- avatar/cover media
- SEO title/description

`/admin/appearance` sửa:

- light/dark/system
- creator/minimal/magazine layout
- card/button style
- primary/secondary/accent colors
- border radius
- homepage sections

Cả hai form merge phần contract không hiển thị để tránh ghi mất settings và gọi chung `updateSiteSettingsAction`.

## Social links

`/admin/social-links` quản lý platform, label, username, URL, follower count, description, enabled và sort order. Public chỉ đọc enabled links theo order.

## Server contract

- Pool database mặc định production là 2. Admin page có từ ba nguồn DB độc lập trở lên phải gom vào page-data service hoặc await tuần tự; audit hiện tại đã áp dụng cho Posts và Gallery.
- Settings/social mutation cần `settings:manage`.
- Media picker cần `media:manage`; settings page hiện gọi picker nên role thực tế cần thỏa cả luồng dữ liệu. Admin/super admin có cả hai.
- Settings là singleton `settingsKey=default`.
- Save revalidate root layout, homepage, related admin pages và sitemap.
- Social save revalidate root layout, about và contact.

## Mở rộng admin đúng cách

1. Thêm permission hoặc chọn permission hiện hữu theo capability.
2. Tạo Server page fetch DTO.
3. Tái dùng table/modal/picker.
4. Tạo Action chỉ làm error mapping + revalidation.
5. Đặt validation/authorization/business logic trong service.
6. Đặt query/transaction/audit trong repository.
7. Thêm navigation và page guard.
8. Cập nhật feature docs và AI map.

Không:

- mutate local array rồi gọi đó là CRUD
- gọi Drizzle từ Client Component/Action
- tin `canWrite` từ client
- tạo table/modal generic thứ hai khi component hiện có đáp ứng

## Kiểm tra

- Direct URL theo từng role.
- Controls disabled/hidden và server vẫn chặn request thủ công.
- Save/validation/field error.
- Reload vẫn còn dữ liệu.
- Public route phản ánh revalidation.
- Admin mobile/sidebar.
- Logout header: click lần đầu chỉ mở hộp xác nhận; **Ở lại**, nút đóng hoặc click ra ngoài không kết thúc phiên; **Đăng xuất** mới gọi action và chuyển về trang login.
- Date picker: mở lịch, chọn/xóa ngày bằng chuột và bàn phím, hiển thị tiếng Việt; RangePicker không cho chọn ngày analytics sau hôm nay.
- Modal dài: trang nền bị khóa cuộn; header, nút đóng và footer luôn thấy; con lăn chỉ dịch chuyển body của modal, kể cả viewport thấp và mobile. Modal ngắn không bị kéo giãn tạo khoảng trắng.
- Scrollbar Admin: trang, sidebar, table, modal/confirm, drawer, dropdown/select/date picker và editor block đều dùng track sáng, thumb xám nhẹ; hover chỉ đậm hơn vừa đủ và không xuất hiện track đen.
- Table Admin: header và toàn bộ vùng pagination có nền tím nhạt; trang active tím đậm/chữ trắng, fixed column không tạo mảng màu lệch; pagination không có khoảng trắng trên/dưới và bám sát hàng cuối cùng cùng viền đáy.
- Pagination table: mọi bảng có selector 10/20/50 và tổng kể cả chỉ có một trang; đổi page size phải cập nhật row count, STT và `pageSize` của server query nếu có, không chỉ cắt response đã tải từ API.
- Cuộn dashboard dài: sidebar/header vẫn bám viewport, không xuất hiện khoảng đen, tràn ngang hoặc khoảng trắng do card bảng bị kéo cao hơn nội dung.
- `/admin/posts`: document không có thanh cuộn dọc; danh sách row cuộn trong table, header cột sticky, toolbar và pagination vẫn thấy trong viewport.
- Chuyển từng tab trên mạng chậm: NProgress/skeleton xuất hiện và tab mới được selected sau khi route hoàn tất.
- Upload R2/Mux: progress toàn cục kết thúc cả khi request thành công lẫn lỗi; phần trăm upload video vẫn hoạt động.
- Media picker tại mọi admin form: tab thư viện tìm/chọn được ảnh cũ; tab tải từ máy validate MIME/size, tự chọn ảnh mới sau confirm và giữ đúng purpose của thumbnail/cover/banner/avatar/Gallery.
- Post content editor: admin không cần biết JSON vẫn tạo được đủ 9 loại block; tab JSON phản ánh dữ liệu trực quan, chỉ áp dụng thay đổi hợp lệ và chặn lưu khi bản JSON đang sai hoặc chưa được áp dụng.
- Với `DATABASE_POOL_MAX=2`, `/admin/posts` và `/admin/gallery` phải render xong; không khôi phục `Promise.all` chứa ba hoặc bốn lượt đọc DB ở hai page này.
