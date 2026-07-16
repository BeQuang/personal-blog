"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/common/Button";

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  platform: string;
  username: string;
  note: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  fullName: "",
  email: "",
  phone: "",
  platform: "",
  username: "",
  note: "",
};

const inputClasses =
  "mt-2 min-h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60";

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const normalizedPhone = values.phone.replace(/[\s.-]/g, "");

  if (values.fullName.length < 2) {
    errors.fullName = "Vui lòng nhập họ tên hợp lệ.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Vui lòng nhập đúng định dạng email.";
  }
  if (!/^(?:\+84|0)\d{9,10}$/.test(normalizedPhone)) {
    errors.phone = "Vui lòng nhập số điện thoại Việt Nam hợp lệ.";
  }
  if (!values.platform) {
    errors.platform = "Vui lòng chọn một nền tảng đã theo dõi.";
  }
  if (values.username.length < 2) {
    errors.username = "Vui lòng nhập username mạng xã hội.";
  }

  return errors;
}

interface CampaignRegistrationFormProps {
  campaignTitle: string;
  disabled?: boolean;
}

export function CampaignRegistrationForm({
  campaignTitle,
  disabled = false,
}: CampaignRegistrationFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const submitTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (submitTimer.current !== null) window.clearTimeout(submitTimer.current);
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  function updateField<Key extends keyof FormValues>(field: Key, value: FormValues[Key]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSuccess(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || submitting) return;

    const normalizedValues: FormValues = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      platform: values.platform.trim(),
      username: values.username.trim(),
      note: values.note.trim(),
    };
    const nextErrors = validate(normalizedValues);
    setValues(normalizedValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    submitTimer.current = window.setTimeout(() => {
      setSubmitting(false);
      setValues(initialValues);
      setSuccess(true);
      toastTimer.current = window.setTimeout(() => setSuccess(false), 4_000);
    }, 800);
  }

  return (
    <section id="registration" aria-labelledby="registration-title" className="scroll-mt-24">
      {success ? (
        <div
          role="status"
          className="fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[var(--surface-elevated)] p-4 text-sm text-[var(--success)] shadow-[var(--shadow-dialog)] sm:right-6 sm:bottom-6"
        >
          <CheckCircle2 className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
          <span>
            <strong className="block">Đăng ký thành công</strong>
            Đây là biểu mẫu mô phỏng; dữ liệu của bạn không được gửi hoặc lưu lại.
          </span>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase">
          Đăng ký tham gia
        </p>
        <h2 id="registration-title" className="mt-2 text-3xl font-bold tracking-[-0.03em]">
          Gửi thông tin cho “{campaignTitle}”
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--text-secondary)]">
          Đây là form mock để kiểm tra trải nghiệm. Thông tin không được gửi, lưu trữ hoặc dùng cho liên hệ thật.
        </p>
      </div>

      {disabled ? (
        <p className="mt-6 rounded-[var(--radius-md)] bg-[var(--primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--primary)]">
          Chiến dịch đã kết thúc nên biểu mẫu hiện không nhận đăng ký.
        </p>
      ) : null}

      <form className="mt-7" onSubmit={handleSubmit} noValidate>
        <fieldset disabled={disabled || submitting} className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--text-primary)]">
            Họ tên <span aria-hidden="true" className="text-[var(--danger)]">*</span>
            <input
              required
              value={values.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              autoComplete="name"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              className={inputClasses}
            />
            {errors.fullName ? <span id="fullName-error" className="mt-1 block text-xs text-[var(--danger)]">{errors.fullName}</span> : null}
          </label>

          <label className="text-sm font-semibold text-[var(--text-primary)]">
            Email <span aria-hidden="true" className="text-[var(--danger)]">*</span>
            <input
              required
              type="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={inputClasses}
            />
            {errors.email ? <span id="email-error" className="mt-1 block text-xs text-[var(--danger)]">{errors.email}</span> : null}
          </label>

          <label className="text-sm font-semibold text-[var(--text-primary)]">
            Số điện thoại <span aria-hidden="true" className="text-[var(--danger)]">*</span>
            <input
              required
              type="tel"
              inputMode="tel"
              value={values.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={inputClasses}
            />
            {errors.phone ? <span id="phone-error" className="mt-1 block text-xs text-[var(--danger)]">{errors.phone}</span> : null}
          </label>

          <label className="text-sm font-semibold text-[var(--text-primary)]">
            Nền tảng đã theo dõi <span aria-hidden="true" className="text-[var(--danger)]">*</span>
            <select
              required
              value={values.platform}
              onChange={(event) => updateField("platform", event.target.value)}
              aria-invalid={Boolean(errors.platform)}
              aria-describedby={errors.platform ? "platform-error" : undefined}
              className={inputClasses}
            >
              <option value="">Chọn nền tảng</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
            {errors.platform ? <span id="platform-error" className="mt-1 block text-xs text-[var(--danger)]">{errors.platform}</span> : null}
          </label>

          <label className="text-sm font-semibold text-[var(--text-primary)] sm:col-span-2">
            Username mạng xã hội <span aria-hidden="true" className="text-[var(--danger)]">*</span>
            <input
              required
              value={values.username}
              onChange={(event) => updateField("username", event.target.value)}
              autoComplete="off"
              placeholder="Ví dụ: @username"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? "username-error" : undefined}
              className={inputClasses}
            />
            {errors.username ? <span id="username-error" className="mt-1 block text-xs text-[var(--danger)]">{errors.username}</span> : null}
          </label>

          <label className="text-sm font-semibold text-[var(--text-primary)] sm:col-span-2">
            Ghi chú <span className="font-normal text-[var(--text-muted)]">(không bắt buộc)</span>
            <textarea
              value={values.note}
              onChange={(event) => updateField("note", event.target.value)}
              rows={4}
              maxLength={500}
              className={`${inputClasses} resize-y py-3`}
            />
          </label>
        </fieldset>

        <Button type="submit" size="lg" disabled={disabled || submitting} className="mt-6 w-full sm:w-auto">
          {submitting ? (
            <><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Đang xử lý...</>
          ) : (
            "Gửi đăng ký mock"
          )}
        </Button>
      </form>
    </section>
  );
}
