"use client";

import { CheckCircle2, FileUp, LoaderCircle, Send } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { submitContactAction } from "@/actions/submissions.actions";
import { Button } from "@/components/common/Button";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import {
  ContactFieldError,
  ContactFormFields,
} from "@/components/contact/ContactFormFields";
import {
  type ContactFormErrors,
  type ContactFormValues,
  initialContactFormValues,
  validateContactForm,
} from "@/components/contact/contact-form.types";
import { contactFileRules } from "@/config/contact.config";

function firstFieldError(
  fieldErrors: Readonly<Record<string, readonly string[]>> | undefined,
  field: string,
) {
  return fieldErrors?.[field]?.[0];
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialContactFormValues);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [fileName, setFileName] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [success, setSuccess] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [submitting, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  function updateField<Key extends keyof ContactFormValues>(
    field: Key,
    value: ContactFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setResponseMessage("");
    setSuccess(false);
  }

  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    if (token) {
      setErrors((current) => ({ ...current, turnstile: undefined }));
    }
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setResponseMessage("");
    setSuccess(false);

    if (!file) {
      setFileName("");
      setErrors((current) => ({ ...current, attachment: undefined }));
      return;
    }

    const lowerName = file.name.toLowerCase();
    const hasAllowedExtension = contactFileRules.extensions.some((extension) =>
      lowerName.endsWith(extension),
    );

    if (!hasAllowedExtension) {
      event.target.value = "";
      setFileName("");
      setErrors((current) => ({
        ...current,
        attachment: "Định dạng file chưa được hỗ trợ.",
      }));
      return;
    }

    if (file.size > contactFileRules.maxSize) {
      event.target.value = "";
      setFileName("");
      setErrors((current) => ({
        ...current,
        attachment: "File vượt quá giới hạn hiển thị 10 MB.",
      }));
      return;
    }

    setFileName(file.name);
    setErrors((current) => ({ ...current, attachment: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const normalizedValues: ContactFormValues = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      company: values.company.trim(),
      collaborationType: values.collaborationType.trim(),
      budget: values.budget.trim(),
      message: values.message.trim(),
    };
    const nextErrors = validateContactForm(normalizedValues);
    if (!turnstileToken) {
      nextErrors.turnstile = "Vui lòng hoàn tất xác minh chống spam.";
    }
    setValues(normalizedValues);
    setErrors((current) => ({
      ...nextErrors,
      attachment: current.attachment,
    }));

    if (Object.keys(nextErrors).length > 0 || errors.attachment) return;

    startTransition(async () => {
      const result = await submitContactAction({
        ...normalizedValues,
        budgetRange: normalizedValues.budget,
        turnstileToken,
      });
      setTurnstileReset((current) => current + 1);

      if (!result.success) {
        setSuccess(false);
        setResponseMessage(result.message);
        setErrors((current) => ({
          ...current,
          fullName: firstFieldError(result.fieldErrors, "fullName"),
          email: firstFieldError(result.fieldErrors, "email"),
          phone: firstFieldError(result.fieldErrors, "phone"),
          company: firstFieldError(result.fieldErrors, "company"),
          collaborationType: firstFieldError(result.fieldErrors, "collaborationType"),
          budget: firstFieldError(result.fieldErrors, "budgetRange"),
          message: firstFieldError(result.fieldErrors, "message"),
          turnstile: firstFieldError(result.fieldErrors, "turnstileToken"),
        }));
        return;
      }

      setValues(initialContactFormValues);
      setFileName("");
      setErrors({});
      setResponseMessage("");
      setSuccess(true);
      formRef.current?.reset();
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setSuccess(false), 5_000);
    });
  }

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <section id="contact-form" aria-labelledby="contact-form-title" className="scroll-mt-24">
      {success ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[var(--surface-elevated)] p-4 text-sm text-[var(--success)] shadow-[var(--shadow-dialog)] sm:right-6 sm:bottom-6"
        >
          <CheckCircle2 className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
          <span>
            <strong className="block">Đã ghi nhận yêu cầu</strong>
            Thông tin đã được lưu an toàn để quản trị viên xem xét.
          </span>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase">
          Brief hợp tác
        </p>
        <h2 id="contact-form-title" className="mt-2 text-3xl font-bold tracking-[-0.03em]">
          Chia sẻ ý tưởng của bạn
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--text-secondary)]">
          Thông tin được dùng để đánh giá và phản hồi yêu cầu hợp tác. File đính kèm hiện vẫn chỉ
          là giao diện xem trước và chưa được tải lên máy chủ.
        </p>
      </div>

      <form ref={formRef} className="mt-7" onSubmit={handleSubmit} noValidate>
        {hasErrors || responseMessage ? (
          <p className="mb-5 rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-4 py-3 text-sm text-[var(--danger)]" role="alert">
            {responseMessage || "Vui lòng kiểm tra các trường được đánh dấu bên dưới."}
          </p>
        ) : null}

        <fieldset disabled={submitting} className="grid gap-5 sm:grid-cols-2">
          <ContactFormFields values={values} errors={errors} updateField={updateField} />

          <label className="sm:col-span-2">
            <span className="text-sm font-semibold">File đính kèm <span className="font-normal text-[var(--text-muted)]">(UI mock)</span></span>
            <span className="mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--background)] px-5 py-6 text-center transition hover:border-[var(--primary)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--surface)]">
              <FileUp size={25} className="text-[var(--primary)]" aria-hidden="true" />
              <strong className="mt-2 text-sm">{fileName || "Chọn file brief để hiển thị"}</strong>
              <small className="mt-1 max-w-md leading-5 text-[var(--text-muted)]">{contactFileRules.description}</small>
              <input
                type="file"
                accept={contactFileRules.accept}
                onChange={handleFileChange}
                aria-invalid={Boolean(errors.attachment)}
                aria-describedby={errors.attachment ? "contact-attachment-note contact-attachment-error" : "contact-attachment-note"}
                className="sr-only"
              />
            </span>
            <span id="contact-attachment-note" className="sr-only">File chỉ được đọc tên, định dạng và kích thước trong trình duyệt; không được tải lên.</span>
            <ContactFieldError id="contact-attachment-error" message={errors.attachment} />
          </label>

          <div className="sm:col-span-2">
            <TurnstileWidget
              action="contact"
              onTokenChange={handleTurnstileToken}
              resetSignal={turnstileReset}
            />
            <ContactFieldError id="contact-turnstile-error" message={errors.turnstile} />
          </div>
        </fieldset>

        <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full sm:w-auto">
          {submitting ? (
            <><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Đang gửi...</>
          ) : (
            <><Send size={18} aria-hidden="true" /> Gửi yêu cầu</>
          )}
        </Button>
      </form>
    </section>
  );
}
