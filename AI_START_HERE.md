# AI session startup

## Có cần prompt mở đầu không?

Với Codex hoặc AI có cơ chế tự đọc `AGENTS.md`, không cần dán prompt riêng. Chỉ cần giao yêu cầu; agent bắt buộc làm theo startup protocol của repository.

Với AI/tool không tự đọc `AGENTS.md`, hãy chạy lệnh sau ở đầu mỗi phiên:

```bash
npm run ai:start
```

Trên PowerShell bị chặn `npm.ps1`:

```powershell
npm.cmd run ai:start
```

Lệnh này sinh lại system map từ worktree hiện tại, cập nhật fingerprint và in trình tự tài liệu cần đọc.

## Prompt mẫu có thể copy

```text
Trước khi xử lý yêu cầu, hãy thực hiện startup protocol của repository:

1. Đọc AGENTS.md.
2. Chạy `npm run ai:start`.
3. Đọc PROJECT_SPEC.md, docs/ai-map/SYSTEM_MAP.md và feature doc liên quan trong docs/features/.
4. Tra COMPONENTS.md, BACKEND.md, ROUTES.md, DATA_MODEL.md và SOURCE_INDEX.md để tìm phần có thể tái sử dụng và đánh giá phạm vi ảnh hưởng.
5. Kiểm tra git status, không ghi đè thay đổi không liên quan.

Trong khi làm:
- Đối chiếu implementation với feature doc.
- Không tạo component/service/type/validator trùng.
- Nếu sửa tính năng, cập nhật feature doc ngay trong cùng thay đổi.
- Nếu thêm tính năng, tạo file docs/features riêng và thêm vào mục lục.
- Nếu thay đổi route, kiến trúc, schema, permission, environment, security hoặc product contract, cập nhật PROJECT_SPEC.md.

Trước khi kết thúc:
- Chạy lại `npm run ai:setup` sau thay đổi source/config cuối cùng.
- Bắt buộc `npm run ai:check` pass.
- Chạy lint, type-check và test liên quan.
- Báo rõ source, docs và generated map đã thay đổi.

Yêu cầu cần thực hiện:
<DÁN YÊU CẦU Ở ĐÂY>
```

## Khi nào map được xem là mới nhất?

Map chỉ được xem là mới nhất khi:

- `npm run ai:setup` đã chạy sau lần sửa source/config cuối cùng.
- `npm run ai:check` trả exit code 0.
- Fingerprint trong `docs/ai-map/SYSTEM_MAP.md` khớp worktree hiện tại.

Không chỉnh tay file trong `docs/ai-map`; thay đổi thủ công sẽ bị lần setup kế tiếp ghi đè.
