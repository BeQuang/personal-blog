# AI system map

Thư mục này được tạo tự động bởi `npm run ai:setup`. Không sửa tay các file trong đây vì lần quét tiếp theo sẽ ghi đè.

## Trình tự đọc bắt buộc cho AI và thành viên mới

1. Đọc [PROJECT_SPEC.md](../../PROJECT_SPEC.md) để hiểu hợp đồng sản phẩm và kiến trúc.
2. Đọc [SYSTEM_MAP.md](./SYSTEM_MAP.md) để nắm luồng tổng thể và fingerprint hiện tại.
3. Mở tài liệu nghiệp vụ phù hợp trong [docs/features](../features/README.md).
4. Tra [ROUTES.md](./ROUTES.md), [COMPONENTS.md](./COMPONENTS.md), [BACKEND.md](./BACKEND.md) và [DATA_MODEL.md](./DATA_MODEL.md) trước khi tạo code mới.
5. Dùng [SOURCE_INDEX.md](./SOURCE_INDEX.md) và cột “Imported by” để đánh giá phạm vi ảnh hưởng.

## Lệnh

- `npm run ai:start`: lệnh mở đầu phiên; sinh lại map và in checklist bắt buộc.
- `npm run ai:setup`: quét lại source và cập nhật toàn bộ system map.
- `npm run ai:check`: không ghi file; trả mã lỗi nếu map đã cũ so với source.

Prompt mẫu cho AI không tự đọc `AGENTS.md`: [AI_START_HERE.md](../../AI_START_HERE.md).

Source fingerprint hiện tại: `b246b7bda3e000266060ac6b0a58503df414df37ba69faf94cc1e6f988fcad2f`.
