# Admin CMS và Site Settings

## Admin shell

`AdminShell` cung cấp sidebar/navigation, current user, responsive behavior và logout. Nút logout trong header dùng hộp xác nhận Ant Design, ưu tiên focus vào **Ở lại** và chỉ gọi Server Action khi người dùng xác nhận **Đăng xuất**. Ant Design được đăng ký trong admin layout để SSR style đúng, dùng locale `vi_VN`; uPlot stylesheet chỉ được nạp ở admin.

Breadcrumb route được đặt trực tiếp trong header Admin thay vì chiếm một hàng riêng
trong vùng content. Mọi Ant Design Tabs trong Admin dùng cùng style toàn cục:
các tab có vạch dọc phân cách, tab active dùng toàn bộ nền tím nhạt nhưng không có
border tím, còn hover dùng nền nhạt hơn. Không tạo override theo từng màn hình nếu
không có khác biệt nghiệp vụ bắt buộc.

Sidebar desktop dùng vị trí cố định theo viewport, có vùng cuộn riêng và phần content chừa đúng 252 px. `admin-route-root`, shell và content cùng dùng nền admin sáng nên khi dashboard dài hơn viewport không lộ nền dark của website public. Mọi vùng cuộn trong Admin, kể cả body trang, sidebar, table, modal/confirm, drawer và popup Ant Design, dùng chung track trắng xám nhẹ cùng thumb xám trung tính thay cho scrollbar tối của hệ điều hành. Card trong lưới dashboard được cân chiều cao theo hàng, còn card bảng độc lập phải giữ chiều cao tự nhiên theo nội dung để không tạo khoảng trắng và vùng cuộn giả. Dưới 992 px, sidebar desktop được thay bằng Drawer và content trở về toàn chiều rộng.

Mọi `.admin-table-panel` dùng header cột và vùng pagination tím nhạt theo bảng màu badge **Admin MVP**; trang active dùng nền tím đậm và chữ trắng để dễ nhận biết. Pagination bỏ margin mặc định của Ant Design để bám sát nội dung và viền đáy panel.

Mọi Ant Design `Table` trong Admin phải dùng `adminTablePaginationDefaults`: mặc định 10 dòng, cho chọn 10/20/50, luôn hiển thị tổng; cụm số dòng + tổng nằm trái và cụm chuyển trang nằm phải. Table có dữ liệu tăng trưởng phải truyền `page/pageSize/sortBy/sortOrder` qua Route Handler → service → repository; repository áp dụng filter trước `COUNT + LIMIT + OFFSET + ORDER BY`, response chuẩn là `{ items, total, page, pageSize, sortBy, sortOrder }`. `sortBy` luôn là allowlist, `pageSize` tối đa 100 và có tie-breaker ID ổn định. Tập DTO nhỏ có bound được ghi rõ mới được phân trang cục bộ. Mảng lựa chọn riêng phải qua helper normalize dùng chung và không vượt giới hạn server.

`npm run table:audit` quét toàn bộ TSX trong `src`; `npm run api:list-audit` kiểm tra GET collection Route Handler dùng boundary phân trang chung. `npm run ai:check` gọi cả hai audit để từ chối Table thiếu pagination hoặc list API mới không có contract phân trang/sắp xếp.

Các route `/admin/posts`, `/admin/social-links` và `/admin/gallery` giới hạn content theo chiều cao còn lại dưới header để document không cuộn dọc. Posts và Social Links đo khoảng tối đa từ đầu table panel đến đáy page rồi truyền phần dành cho row vào `Table.scroll.y`; riêng Gallery dùng body table cao cố định `70vh`. Chỉ body row cuộn khi vượt giới hạn, còn heading, toolbar, header cột và pagination luôn hiển thị. Tab Thư viện ảnh chỉ vùng lưới/chi tiết media cuộn nội bộ; heading, upload và toolbar đứng yên, danh sách tự tải batch tiếp theo khi gần đáy và không hiển thị pagination. Nội dung mỗi tab Gallery có padding 8 px trong panel chung để không chạm sát đường viền; bộ lọc Gallery không có thêm card border bọc ngoài và workspace giữ khoảng hở 16 px với đáy `.admin-content`.

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

`/admin/social-links` quản lý platform, label, username, URL, chỉ số cộng đồng, description, enabled và sort order. Form tạo/sửa đổi nhãn, placeholder và helper theo platform:

- YouTube dùng “Người đăng ký”, khóa nhập tay và lấy từ YouTube Data API.
- Discord/Telegram dùng chỉ số thành viên.
- TikTok dùng follower/tổng lượt thích nhập thủ công. Tự động hóa Login Kit đang tạm tắt nên form không hiển thị nút kết nối và không khóa URL/username/chỉ số.
- Facebook/Instagram/X/Threads/Zalo dùng người theo dõi nhập thủ công từ số công khai gần nhất.
- Email/Website không có chỉ số cộng đồng nên form ẩn trường và service luôn ghi `NULL`.

Modal social link rộng 760px trên desktop và vẫn co theo viewport trên màn hình nhỏ. Các hướng dẫn URL và số người đăng ký dùng cỡ chữ ghi chú; ô subscriber chiếm hết cột còn lại. Khối trạng thái đồng bộ YouTube hiển thị trạng thái và thời điểm gần nhất trên cùng một hàng ở desktop, có khoảng cách dưới trước nhóm Thứ tự/Hiển thị public và được phép xuống dòng trên màn hình nhỏ. Mô tả social link cho phép tối đa 5.000 ký tự ở cả client và service; PostgreSQL dùng cột `text` nên không cần migration schema.

YouTube được cron `GET /api/cron/social-audience-sync` đồng bộ mỗi ngày một lần theo lịch `0 0 * * *` (00:00 UTC, khoảng 07:00 giờ Việt Nam), xác thực fail-closed bằng `Authorization: Bearer $CRON_SECRET`. Job lưu channel ID, thời điểm/trạng thái/lỗi; lỗi provider giữ nguyên số thành công gần nhất, kênh ẩn subscriber count hiển thị không có dữ liệu. Truy vấn job giới hạn tối đa 100 social link YouTube mỗi lần vì tập cấu hình này có chủ đích là bounded.
Route cron trả summary của một tác vụ, không phải collection resource, nên là ngoại lệ có chủ đích của audit list API/pagination.

Khi tạo social link YouTube, đổi sang URL kênh YouTube khác, hoặc lưu lại bản ghi đang `pending/error`, service gọi provider trước khi ghi database. Kết quả thành công được lưu ngay cùng `channelId`, subscriber count, `synced` và timestamp; kênh ẩn count được lưu ở trạng thái `unavailable`. Nếu API key, URL hoặc provider lỗi, service trả field error cho `url`, form giữ nguyên và không tạo/cập nhật bản ghi YouTube trống. Chỉnh các trường khác trên bản ghi đã `synced/unavailable` mà URL YouTube không đổi sẽ giữ số liệu đã đồng bộ và không phát sinh request provider không cần thiết.

`TIKTOK_AUTOMATION_ENABLED=false` là cờ mã nguồn dùng chung cho UI/service/Route Handler. Khi tắt, form chỉ hiện ghi chú nhập thủ công, `GET /api/auth/tiktok/start` và callback vẫn kiểm tra session/quyền `settings:manage` trước khi redirect về Admin với trạng thái `disabled`, service từ chối đổi code/lưu token, còn cron trả summary TikTok bằng 0 mà không gọi provider hay đọc token.

Provider, crypto, bảng `social_oauth_connections` và các biến `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`, `SOCIAL_OAUTH_ENCRYPTION_KEY` được giữ làm nền để bật lại ở giai đoạn production nhưng hiện không bắt buộc. Token/dữ liệu cũ không bị xóa tự động chỉ vì tắt tính năng; TikTok vẫn hiển thị follower/tổng lượt thích nhập thủ công trên Admin và public.

Màn hình giữ heading, bộ lọc và pagination trong viewport; chỉ phần row của bảng cuộn khi danh sách dài. Bộ lọc search và platform nằm trong panel riêng, tách khỏi bảng. Cột Chỉ số cộng đồng cho phép sort tăng/giảm trên toàn bộ tập dữ liệu qua Route Handler → service → repository; public chỉ đọc enabled links theo order.

## Server contract

- Pool database mặc định production là 2. Admin page có từ ba nguồn DB độc lập trở lên phải gom vào page-data service hoặc await tuần tự; audit hiện tại đã áp dụng cho Posts và Gallery.
- Settings/social mutation cần `settings:manage`.
- Cron sync không dùng session Admin; Route Handler kiểm tra `CRON_SECRET`, sau đó service chỉ gọi YouTube provider và repository khi TikTok automation đang tắt. API key YouTube chỉ đọc từ server environment.
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
- `/admin/social-links`: document không có thanh cuộn dọc; search/platform tách khỏi bảng, row cuộn trong table, header/pagination luôn thấy và click Chỉ số cộng đồng đổi sort tăng/giảm trên dữ liệu server.
- `/admin/gallery`: document không có thanh cuộn dọc; Gallery chỉ cuộn body row, còn Thư viện ảnh chỉ cuộn vùng lưới/chi tiết và tự tải batch kế tiếp; tab, heading và upload/filter luôn nằm trong viewport, nội dung không chạm sát viền panel.
- Upload Media Library: chọn file chỉ hiện preview cục bộ; không có presign/PUT R2 trước khi bấm **Xác nhận upload**. Trên desktop, panel Upload nằm bên trái và panel toolbar/lưới ảnh nằm bên phải theo tỷ lệ 50/50; preview nằm trong panel Upload. Dưới 1.200 px, hai panel xếp thành hai hàng có vùng cuộn riêng.
- Form social link đổi trường theo platform; YouTube không cho sửa subscriber, TikTok cho nhập follower/tổng lượt thích thủ công và báo tự động hóa đang tắt, Email/Website không gửi count, Discord dùng thành viên.
- Truy cập trực tiếp OAuth TikTok khi cờ tắt phải redirect an toàn về Admin với `tiktok=disabled`, không gọi TikTok và không ghi token/dữ liệu.
- Tạo mới YouTube hợp lệ phải trả count ngay trong lần lưu đầu tiên; URL/API lỗi phải giữ modal mở, hiển thị field error và không ghi bản ghi pending.
- Cron sai/mất secret trả `401`; thiếu API key hoặc provider lỗi ghi trạng thái lỗi nhưng không xóa số YouTube thành công gần nhất.
- `npm run social:test` kiểm tra lịch cron hằng ngày, cờ TikTok automation đang tắt, giới hạn mô tả 5.000 ký tự, parser/response YouTube, provider TikTok dự phòng và round-trip/tamper detection của token AES-256-GCM.
- Chuyển từng tab trên mạng chậm: NProgress/skeleton xuất hiện và tab mới được selected sau khi route hoàn tất.
- Upload R2/Mux: progress toàn cục kết thúc cả khi request thành công lẫn lỗi; phần trăm upload video vẫn hoạt động.
- Media picker tại mọi admin form: tab thư viện tìm/chọn được ảnh cũ; tab tải từ máy validate MIME/size, tự chọn ảnh mới sau confirm và giữ đúng purpose của thumbnail/cover/banner/avatar/Gallery.
- Post content editor: admin không cần biết JSON vẫn tạo được đủ 9 loại block; tab JSON phản ánh dữ liệu trực quan, chỉ áp dụng thay đổi hợp lệ và chặn lưu khi bản JSON đang sai hoặc chưa được áp dụng.
- Với `DATABASE_POOL_MAX=2`, `/admin/posts` và `/admin/gallery` phải render xong; không khôi phục `Promise.all` chứa ba hoặc bốn lượt đọc DB ở hai page này.
