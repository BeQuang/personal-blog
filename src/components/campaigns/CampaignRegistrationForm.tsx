"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState, useTransition } from "react";

import { submitCampaignAction } from "@/actions/submissions.actions";
import { Button } from "@/components/common/Button";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  platform: string;
  username: string;
  note: string;
}

type FormErrors = Partial<Record<keyof FormValues | "turnstile", string>>;

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
  campaignSlug: string;
  disabled?: boolean;
}

export function CampaignRegistrationForm({
  campaignTitle,
  campaignSlug,
  disabled = false,
}: CampaignRegistrationFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [responseError, setResponseError] = useState("");
  const [submitting, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  function updateField<Key extends keyof FormValues>(field: Key, value: FormValues[Key]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setResponseError("");
    setSuccess(false);
  }

  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    if (token) {
      setErrors((current) => ({ ...current, turnstile: undefined }));
      setResponseError("");
    }
  }, []);

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
    if (!turnstileToken) {
      nextErrors.turnstile = "Vui lòng hoàn tất xác minh chống spam.";
    }
    setValues(normalizedValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    startTransition(async () => {
      const result = await submitCampaignAction({
        campaignSlug,
        fullName: normalizedValues.fullName,
        email: normalizedValues.email,
        phone: normalizedValues.phone,
        followedPlatform: normalizedValues.platform,
        socialUsername: normalizedValues.username,
        notes: normalizedValues.note,
        turnstileToken,
      });
      setTurnstileReset((current) => current + 1);

      if (!result.success) {
        setSuccess(false);
        setResponseError(result.message);
        setErrors({
          fullName: result.fieldErrors?.fullName?.[0],
          email: result.fieldErrors?.email?.[0],
          phone: result.fieldErrors?.phone?.[0],
          platform: result.fieldErrors?.followedPlatform?.[0],
          username: result.fieldErrors?.socialUsername?.[0],
          note: result.fieldErrors?.notes?.[0],
          turnstile: result.fieldErrors?.turnstileToken?.[0],
        });
        return;
      }

      setValues(initialValues);
      setErrors({});
      setResponseError("");
      setSuccess(true);
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setSuccess(false), 4_000);
    });
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
            Thông tin tham gia đã được lưu để quản trị viên xem xét.
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
          Thông tin được kiểm tra chống spam và lưu để phục vụ việc xét duyệt chiến dịch.
        </p>
      </div>

      {disabled ? (
        <p className="mt-6 rounded-[var(--radius-md)] bg-[var(--primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--primary)]">
          Chiến dịch hiện chưa mở hoặc đã kết thúc nên biểu mẫu không nhận đăng ký.
        </p>
      ) : null}

      <form className="mt-7" onSubmit={handleSubmit} noValidate>
        {responseError ? (
          <p className="mb-5 rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-4 py-3 text-sm text-[var(--danger)]" role="alert">
            {responseError}
          </p>
        ) : null}
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

          <div className="sm:col-span-2">
            <TurnstileWidget
              action="campaign_submission"
              onTokenChange={handleTurnstileToken}
              resetSignal={turnstileReset}
            />
            {errors.turnstile ? <span className="mt-1 block text-xs text-[var(--danger)]">{errors.turnstile}</span> : null}
          </div>
        </fieldset>

        <Button type="submit" size="lg" disabled={disabled || submitting} className="mt-6 w-full sm:w-auto">
          {submitting ? (
            <><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Đang xử lý...</>
          ) : (
            "Gửi đăng ký"
          )}
        </Button>
      </form>
    </section>
  );
}
