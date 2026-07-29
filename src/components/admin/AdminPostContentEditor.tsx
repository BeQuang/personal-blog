"use client";

import {
  Alert,
  Button,
  Dropdown,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import type { MenuProps } from "antd";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Braces,
  Code2,
  Copy,
  Heading2,
  Image as ImageIcon,
  List,
  Minus,
  MousePointerClick,
  Plus,
  Quote,
  RotateCcw,
  Trash2,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  clonePostContentBlock,
  createPostContentBlock,
  parsePostContentBlocksJson,
  type PostContentBlockType,
} from "@/lib/post-content-blocks";
import type { MediaOption, PostContentBlock } from "@/types";

interface AdminPostContentEditorProps {
  value?: readonly PostContentBlock[];
  mediaOptions: readonly MediaOption[];
  disabled?: boolean;
  onChange?: (blocks: PostContentBlock[]) => void;
  onAdvancedStateChange: (error: string | null) => void;
}

const blockDefinitions: ReadonlyArray<{
  type: PostContentBlockType;
  label: string;
  description: string;
  icon: typeof AlignLeft;
}> = [
  { type: "heading", label: "Tiêu đề", description: "Chia bài viết thành các phần rõ ràng", icon: Heading2 },
  { type: "paragraph", label: "Đoạn văn", description: "Nội dung chữ thông thường", icon: AlignLeft },
  { type: "image", label: "Hình ảnh", description: "Ảnh, mô tả thay thế và chú thích", icon: ImageIcon },
  { type: "quote", label: "Trích dẫn", description: "Câu nói nổi bật và tác giả", icon: Quote },
  { type: "list", label: "Danh sách", description: "Danh sách có số hoặc dấu đầu dòng", icon: List },
  { type: "code", label: "Đoạn mã", description: "Mã nguồn có tên ngôn ngữ", icon: Code2 },
  { type: "video", label: "Video", description: "YouTube, Vimeo hoặc liên kết video", icon: Video },
  { type: "cta", label: "Nút kêu gọi", description: "Tiêu đề, mô tả và nút hành động", icon: MousePointerClick },
  { type: "divider", label: "Đường phân cách", description: "Ngăn cách hai phần nội dung", icon: Minus },
];

const definitionByType = new Map(blockDefinitions.map((definition) => [
  definition.type,
  definition,
]));

function RequiredLabel({ children }: { children: string }) {
  return (
    <span>
      <span className="admin-content-required" aria-hidden="true">*</span> {children}
    </span>
  );
}

export function AdminPostContentEditor({
  value = [],
  mediaOptions,
  disabled = false,
  onChange,
  onAdvancedStateChange,
}: AdminPostContentEditorProps) {
  const [activeTab, setActiveTab] = useState("visual");
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonDirty, setJsonDirty] = useState(false);
  const blockListRef = useRef<HTMLDivElement>(null);
  const shouldScrollToNewBlockRef = useRef(false);
  const [jsonStatus, setJsonStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  }>({
    type: "info",
    message: "JSON này được tạo tự động từ trình soạn thảo trực quan.",
  });

  useEffect(() => {
    if (!shouldScrollToNewBlockRef.current) return;
    shouldScrollToNewBlockRef.current = false;

    const frame = window.requestAnimationFrame(() => {
      const blockList = blockListRef.current;
      if (blockList) {
        blockList.scrollTo({ top: blockList.scrollHeight, behavior: "auto" });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [value.length]);

  const mediaSelectOptions = useMemo(
    () => mediaOptions.map((item) => ({
      value: item.publicUrl,
      label: item.label,
    })),
    [mediaOptions],
  );

  const addMenuItems: MenuProps["items"] = blockDefinitions.map((definition) => {
    const Icon = definition.icon;
    return {
      key: definition.type,
      label: (
        <span className="admin-content-add-option">
          <Icon size={17} aria-hidden="true" />
          <span>
            <strong>{definition.label}</strong>
            <small>{definition.description}</small>
          </span>
        </span>
      ),
    };
  });

  const changeVisualBlocks = (blocks: PostContentBlock[]) => {
    setJsonDraft(JSON.stringify(blocks, null, 2));
    setJsonDirty(false);
    setJsonStatus({
      type: "info",
      message: "JSON đã được cập nhật từ trình soạn thảo trực quan.",
    });
    onAdvancedStateChange(null);
    onChange?.(blocks);
  };

  const updateBlock = (index: number, block: PostContentBlock) => {
    changeVisualBlocks(
      value.map((item, itemIndex) => itemIndex === index ? block : item),
    );
  };

  const addBlock = (type: PostContentBlockType) => {
    shouldScrollToNewBlockRef.current = true;
    changeVisualBlocks([...value, createPostContentBlock(type)]);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= value.length) return;
    const next = [...value];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    changeVisualBlocks(next);
  };

  const duplicateBlock = (index: number) => {
    const next = [...value];
    next.splice(index + 1, 0, clonePostContentBlock(value[index]));
    changeVisualBlocks(next);
  };

  const removeBlock = (index: number) => {
    changeVisualBlocks(value.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateJsonDraft = (nextValue: string) => {
    setJsonDraft(nextValue);
    setJsonDirty(true);
    const parsed = parsePostContentBlocksJson(nextValue);
    if (parsed.success) {
      const message = "JSON hợp lệ. Bấm “Áp dụng & xem trực quan” để đồng bộ.";
      setJsonStatus({ type: "success", message });
      onAdvancedStateChange("Có thay đổi JSON hợp lệ nhưng chưa được áp dụng.");
    } else {
      setJsonStatus({ type: "error", message: parsed.error });
      onAdvancedStateChange(parsed.error);
    }
  };

  const applyJson = () => {
    const parsed = parsePostContentBlocksJson(jsonDraft);
    if (!parsed.success) {
      setJsonStatus({ type: "error", message: parsed.error });
      onAdvancedStateChange(parsed.error);
      return;
    }

    onChange?.(parsed.data);
    setJsonDraft(JSON.stringify(parsed.data, null, 2));
    setJsonDirty(false);
    setJsonStatus({
      type: "success",
      message: "Đã áp dụng JSON vào trình soạn thảo trực quan.",
    });
    onAdvancedStateChange(null);
    setActiveTab("visual");
  };

  const formatJson = () => {
    const parsed = parsePostContentBlocksJson(jsonDraft);
    if (!parsed.success) {
      setJsonStatus({ type: "error", message: parsed.error });
      onAdvancedStateChange(parsed.error);
      return;
    }
    const formatted = JSON.stringify(parsed.data, null, 2);
    setJsonDraft(formatted);
    setJsonDirty(true);
    setJsonStatus({
      type: "success",
      message: "Đã định dạng JSON. Bấm “Áp dụng & xem trực quan” để đồng bộ.",
    });
    onAdvancedStateChange("Có thay đổi JSON hợp lệ nhưng chưa được áp dụng.");
  };

  const resetJson = () => {
    setJsonDraft(JSON.stringify(value, null, 2));
    setJsonDirty(false);
    setJsonStatus({
      type: "info",
      message: "Đã khôi phục JSON từ dữ liệu trực quan hiện tại.",
    });
    onAdvancedStateChange(null);
  };

  const jsonHasError = jsonStatus.type === "error";

  const renderBlockFields = (block: PostContentBlock, index: number) => {
    switch (block.type) {
      case "heading":
        return (
          <div className="admin-content-field-grid admin-content-field-grid-heading">
            <Form.Item label={<RequiredLabel>Cấp tiêu đề</RequiredLabel>}>
              <Select
                value={block.level}
                disabled={disabled}
                placeholder="Chọn cấp tiêu đề"
                options={[
                  { value: 2, label: "Tiêu đề lớn (H2)" },
                  { value: 3, label: "Tiêu đề nhỏ (H3)" },
                ]}
                onChange={(level: 2 | 3) => updateBlock(index, { ...block, level })}
              />
            </Form.Item>
            <Form.Item label={<RequiredLabel>Nội dung tiêu đề</RequiredLabel>}>
              <Input
                value={block.text}
                disabled={disabled}
                placeholder="Ví dụ: Vì sao nội dung này quan trọng?"
                onChange={(event) => updateBlock(index, { ...block, text: event.target.value })}
              />
            </Form.Item>
          </div>
        );

      case "paragraph":
        return (
          <Form.Item label={<RequiredLabel>Nội dung đoạn văn</RequiredLabel>}>
            <Input.TextArea
              value={block.text}
              disabled={disabled}
              autoSize={{ minRows: 3, maxRows: 10 }}
              placeholder="Nhập nội dung bạn muốn người đọc nhìn thấy..."
              onChange={(event) => updateBlock(index, { ...block, text: event.target.value })}
            />
          </Form.Item>
        );

      case "image":
        return (
          <>
            <Form.Item
              label="Chọn nhanh từ Media Library"
              extra="Không bắt buộc. Bạn vẫn có thể dán URL hoặc đường dẫn ảnh ở bên dưới."
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                value={mediaOptions.some((item) => item.publicUrl === block.src) ? block.src : undefined}
                disabled={disabled}
                placeholder="Chọn ảnh có sẵn..."
                options={mediaSelectOptions}
                onChange={(src?: string) => updateBlock(index, { ...block, src: src ?? "" })}
              />
            </Form.Item>
            <div className="admin-content-field-grid">
              <Form.Item
                label={<RequiredLabel>URL hoặc đường dẫn ảnh</RequiredLabel>}
                extra="Ví dụ: /images/bai-viet.jpg hoặc https://..."
              >
                <Input
                  value={block.src}
                  disabled={disabled}
                  placeholder="/images/bai-viet.jpg"
                  onChange={(event) => updateBlock(index, { ...block, src: event.target.value })}
                />
              </Form.Item>
              <Form.Item
                label={<RequiredLabel>Mô tả ảnh (alt)</RequiredLabel>}
                extra="Mô tả ngắn nội dung ảnh cho SEO và người dùng trình đọc màn hình."
              >
                <Input
                  value={block.alt}
                  disabled={disabled}
                  placeholder="Ví dụ: Góc làm việc của tác giả"
                  onChange={(event) => updateBlock(index, { ...block, alt: event.target.value })}
                />
              </Form.Item>
            </div>
            <Form.Item label="Chú thích dưới ảnh">
              <Input
                value={block.caption ?? ""}
                disabled={disabled}
                placeholder="Không bắt buộc"
                onChange={(event) => updateBlock(index, { ...block, caption: event.target.value })}
              />
            </Form.Item>
          </>
        );

      case "quote":
        return (
          <>
            <Form.Item label={<RequiredLabel>Nội dung trích dẫn</RequiredLabel>}>
              <Input.TextArea
                value={block.text}
                disabled={disabled}
                autoSize={{ minRows: 2, maxRows: 6 }}
                placeholder="Nhập câu nói hoặc nội dung muốn làm nổi bật..."
                onChange={(event) => updateBlock(index, { ...block, text: event.target.value })}
              />
            </Form.Item>
            <Form.Item label="Tác giả hoặc nguồn">
              <Input
                value={block.attribution ?? ""}
                disabled={disabled}
                placeholder="Không bắt buộc"
                onChange={(event) => updateBlock(index, { ...block, attribution: event.target.value })}
              />
            </Form.Item>
          </>
        );

      case "list":
        return (
          <>
            <Form.Item label={<RequiredLabel>Kiểu danh sách</RequiredLabel>}>
              <Radio.Group
                value={block.style}
                disabled={disabled}
                options={[
                  { value: "unordered", label: "Dấu đầu dòng" },
                  { value: "ordered", label: "Đánh số thứ tự" },
                ]}
                onChange={(event) => updateBlock(index, { ...block, style: event.target.value })}
              />
            </Form.Item>
            <Form.Item label={<RequiredLabel>Các mục trong danh sách</RequiredLabel>}>
              <div className="admin-content-list-items">
                {block.items.map((item, itemIndex) => (
                  <div className="admin-content-list-item" key={itemIndex}>
                    <span aria-hidden="true">
                      {block.style === "ordered" ? `${itemIndex + 1}.` : "•"}
                    </span>
                    <Input
                      value={item}
                      disabled={disabled}
                      placeholder={`Nội dung mục ${itemIndex + 1}`}
                      aria-label={`Nội dung mục ${itemIndex + 1}`}
                      onChange={(event) => {
                        const items = [...block.items];
                        items[itemIndex] = event.target.value;
                        updateBlock(index, { ...block, items });
                      }}
                    />
                    <Button
                      type="text"
                      danger
                      disabled={disabled || block.items.length === 1}
                      icon={<Trash2 size={15} aria-hidden="true" />}
                      aria-label={`Xóa mục ${itemIndex + 1}`}
                      onClick={() => updateBlock(index, {
                        ...block,
                        items: block.items.filter((_, currentIndex) => currentIndex !== itemIndex),
                      })}
                    />
                  </div>
                ))}
                <Button
                  disabled={disabled}
                  icon={<Plus size={15} aria-hidden="true" />}
                  onClick={() => updateBlock(index, { ...block, items: [...block.items, ""] })}
                >
                  Thêm mục
                </Button>
              </div>
            </Form.Item>
          </>
        );

      case "code":
        return (
          <>
            <Form.Item
              label={<RequiredLabel>Ngôn ngữ</RequiredLabel>}
              extra="Ví dụ: javascript, typescript, css, html hoặc bash."
            >
              <Input
                value={block.language}
                disabled={disabled}
                placeholder="javascript"
                onChange={(event) => updateBlock(index, { ...block, language: event.target.value })}
              />
            </Form.Item>
            <Form.Item label={<RequiredLabel>Nội dung mã nguồn</RequiredLabel>}>
              <Input.TextArea
                value={block.code}
                disabled={disabled}
                rows={7}
                spellCheck={false}
                className="admin-code-input"
                placeholder={'const message = "Xin chào";'}
                onChange={(event) => updateBlock(index, { ...block, code: event.target.value })}
              />
            </Form.Item>
          </>
        );

      case "video":
        return (
          <div className="admin-content-field-grid">
            <Form.Item
              label={<RequiredLabel>URL video</RequiredLabel>}
              extra="Hỗ trợ nhúng YouTube và Vimeo; URL khác sẽ hiển thị dưới dạng liên kết."
            >
              <Input
                value={block.url}
                disabled={disabled}
                placeholder="https://www.youtube.com/watch?v=..."
                onChange={(event) => updateBlock(index, { ...block, url: event.target.value })}
              />
            </Form.Item>
            <Form.Item label={<RequiredLabel>Tiêu đề video</RequiredLabel>}>
              <Input
                value={block.title}
                disabled={disabled}
                placeholder="Nội dung video nói về điều gì?"
                onChange={(event) => updateBlock(index, { ...block, title: event.target.value })}
              />
            </Form.Item>
          </div>
        );

      case "cta":
        return (
          <>
            <div className="admin-content-field-grid">
              <Form.Item label={<RequiredLabel>Tiêu đề CTA</RequiredLabel>}>
                <Input
                  value={block.title}
                  disabled={disabled}
                  placeholder="Bạn muốn tìm hiểu thêm?"
                  onChange={(event) => updateBlock(index, { ...block, title: event.target.value })}
                />
              </Form.Item>
              <Form.Item label={<RequiredLabel>Nhãn nút</RequiredLabel>}>
                <Input
                  value={block.label}
                  disabled={disabled}
                  placeholder="Xem thêm"
                  onChange={(event) => updateBlock(index, { ...block, label: event.target.value })}
                />
              </Form.Item>
            </div>
            <Form.Item label={<RequiredLabel>Mô tả CTA</RequiredLabel>}>
              <Input.TextArea
                value={block.description}
                disabled={disabled}
                autoSize={{ minRows: 2, maxRows: 5 }}
                placeholder="Giải thích ngắn lý do người đọc nên bấm nút..."
                onChange={(event) => updateBlock(index, { ...block, description: event.target.value })}
              />
            </Form.Item>
            <Form.Item
              label={<RequiredLabel>Liên kết khi bấm nút</RequiredLabel>}
              extra="Dùng đường dẫn nội bộ /lien-he hoặc URL https://..."
            >
              <Input
                value={block.href}
                disabled={disabled}
                placeholder="/lien-he"
                onChange={(event) => updateBlock(index, { ...block, href: event.target.value })}
              />
            </Form.Item>
          </>
        );

      case "divider":
        return (
          <div className="admin-content-divider-preview">
            <span />
            <small>Đường phân cách sẽ hiển thị tại vị trí này trong bài viết.</small>
          </div>
        );
    }
  };

  const visualEditor = (
    <div className="admin-content-visual-editor">
      <div className="admin-content-editor-summary">
        <div>
          <strong>Nội dung bài viết</strong>
          <span>{value.length} block · Thứ tự từ trên xuống dưới</span>
        </div>
        <Dropdown
          trigger={["click"]}
          disabled={disabled}
          menu={{
            items: addMenuItems,
            onClick: ({ key }) => addBlock(key as PostContentBlockType),
          }}
        >
          <Button
            type="primary"
            className="admin-content-add-button"
            icon={<Plus size={16} aria-hidden="true" />}
          >
            Thêm nội dung
          </Button>
        </Dropdown>
      </div>

      {value.length > 0 ? (
        <div
          ref={blockListRef}
          className="admin-content-block-list"
          role="region"
          aria-label="Danh sách nội dung bài viết có thể cuộn"
          tabIndex={0}
        >
          {value.map((block, index) => {
            const definition = definitionByType.get(block.type);
            const Icon = definition?.icon ?? AlignLeft;
            return (
              <section className="admin-content-block-card" key={`${block.type}-${index}`}>
                <header className="admin-content-block-header">
                  <div className="admin-content-block-title">
                    <span className="admin-content-block-icon">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>{index + 1}. {definition?.label ?? block.type}</strong>
                      <small>{definition?.description}</small>
                    </span>
                  </div>
                  <Space size={2} className="admin-content-block-actions">
                    <Tooltip title="Di chuyển lên">
                      <Button
                        type="text"
                        disabled={disabled || index === 0}
                        icon={<ArrowUp size={16} aria-hidden="true" />}
                        aria-label={`Di chuyển block ${index + 1} lên`}
                        onClick={() => moveBlock(index, -1)}
                      />
                    </Tooltip>
                    <Tooltip title="Di chuyển xuống">
                      <Button
                        type="text"
                        disabled={disabled || index === value.length - 1}
                        icon={<ArrowDown size={16} aria-hidden="true" />}
                        aria-label={`Di chuyển block ${index + 1} xuống`}
                        onClick={() => moveBlock(index, 1)}
                      />
                    </Tooltip>
                    <Tooltip title="Nhân bản">
                      <Button
                        type="text"
                        disabled={disabled}
                        icon={<Copy size={16} aria-hidden="true" />}
                        aria-label={`Nhân bản block ${index + 1}`}
                        onClick={() => duplicateBlock(index)}
                      />
                    </Tooltip>
                    <Tooltip title="Xóa block">
                      <Button
                        type="text"
                        danger
                        disabled={disabled}
                        icon={<Trash2 size={16} aria-hidden="true" />}
                        aria-label={`Xóa block ${index + 1}`}
                        onClick={() => removeBlock(index)}
                      />
                    </Tooltip>
                  </Space>
                </header>
                <div className="admin-content-block-body">
                  {renderBlockFields(block, index)}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="admin-content-empty">
          <AlignLeft size={30} aria-hidden="true" />
          <strong>Bài viết chưa có nội dung</strong>
          <span>Hãy thêm ít nhất một block để bắt đầu soạn bài.</span>
          <Dropdown
            trigger={["click"]}
            disabled={disabled}
            menu={{
              items: addMenuItems,
              onClick: ({ key }) => addBlock(key as PostContentBlockType),
            }}
          >
            <Button icon={<Plus size={16} aria-hidden="true" />}>Thêm block đầu tiên</Button>
          </Dropdown>
        </div>
      )}
    </div>
  );

  const jsonEditor = (
    <div className="admin-content-json-editor">
      <Alert
        className="admin-content-json-intro"
        type="info"
        showIcon
        message="Chế độ nâng cao dành cho developer"
        description="JSON phản ánh chính xác dữ liệu từ trình soạn thảo. Hệ thống tự kiểm tra cú pháp và cấu trúc của 9 loại block ngay khi bạn nhập; chỉ JSON hợp lệ mới có thể áp dụng ngược sang giao diện trực quan."
      />
      <Input.TextArea
        value={jsonDraft}
        disabled={disabled}
        rows={20}
        spellCheck={false}
        status={jsonHasError ? "error" : undefined}
        className="admin-code-input admin-content-json-input"
        aria-label="Content blocks JSON nâng cao"
        aria-invalid={jsonHasError}
        aria-describedby="admin-content-json-validation"
        placeholder='[{"type":"paragraph","text":"Nhập nội dung bài viết..."}]'
        onChange={(event) => updateJsonDraft(event.target.value)}
      />
      <div className="admin-content-json-footer">
        <div id="admin-content-json-validation" aria-live="polite" aria-atomic="true">
          <Alert
            type={jsonStatus.type}
            showIcon
            message={jsonHasError ? "JSON chưa hợp lệ" : jsonStatus.type === "success" ? "JSON hợp lệ" : "Kiểm tra JSON tự động"}
            description={jsonStatus.message}
          />
        </div>
        <Space wrap>
          <Button
            disabled={disabled || jsonHasError}
            icon={<Braces size={16} aria-hidden="true" />}
            onClick={formatJson}
          >
            Định dạng JSON
          </Button>
          <Button
            disabled={disabled || !jsonDirty}
            icon={<RotateCcw size={16} aria-hidden="true" />}
            onClick={resetJson}
          >
            Khôi phục
          </Button>
          <Button
            type="primary"
            disabled={disabled || !jsonDirty || jsonHasError}
            onClick={applyJson}
          >
            Áp dụng & xem trực quan
          </Button>
        </Space>
      </div>
    </div>
  );

  const changeTab = (key: string) => {
    if (key === "json" && !jsonDirty) {
      setJsonDraft(JSON.stringify(value, null, 2));
      setJsonStatus({
        type: "info",
        message: "JSON này được tạo tự động từ trình soạn thảo trực quan.",
      });
    }
    setActiveTab(key);
  };

  return (
    <div className="admin-post-content-editor">
      <Tabs
        activeKey={activeTab}
        onChange={changeTab}
        items={[
          {
            key: "visual",
            label: (
              <span className="admin-content-tab-label">
                <AlignLeft size={16} aria-hidden="true" />
                Soạn thảo trực quan
              </span>
            ),
            children: visualEditor,
          },
          {
            key: "json",
            label: (
              <span className="admin-content-tab-label">
                <Braces size={16} aria-hidden="true" />
                JSON nâng cao
                {jsonDirty ? (
                  <Tag color={jsonHasError ? "error" : "gold"}>
                    {jsonHasError ? "JSON lỗi" : "Chưa áp dụng"}
                  </Tag>
                ) : null}
              </span>
            ),
            children: jsonEditor,
          },
        ]}
      />
    </div>
  );
}
