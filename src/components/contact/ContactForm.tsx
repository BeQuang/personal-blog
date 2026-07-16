"use client";

import { CheckCircle2, FileUp, LoaderCircle, Send } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/common/Button";
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

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialContactFormValues);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submitTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (submitTimer.current !== null) window.clearTimeout(submitTimer.current);
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
    setSuccess(false);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
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
        attachment: "Định dạng file chưa được hỗ trợ trong bản mô phỏng.",
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
    setValues(normalizedValues);
    setErrors((current) => ({
      ...nextErrors,
      attachment: current.attachment,
    }));

    if (Object.keys(nextErrors).length > 0 || errors.attachment) return;

    setSubmitting(true);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    submitTimer.current = window.setTimeout(() => {
      setSubmitting(false);
      setValues(initialContactFormValues);
      setFileName("");
      setErrors({});
      setSuccess(true);
      formRef.current?.reset();
      toastTimer.current = window.setTimeout(() => setSuccess(false), 5_000);
    }, 900);
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
            <strong className="block">Đã ghi nhận yêu cầu mô phỏng</strong>
            Không có thông tin hoặc file nào được gửi hay lưu lại.
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
          Form này chỉ mô phỏng quy trình tiếp nhận brief. Dữ liệu không được gửi tới máy chủ,
          lưu trữ hoặc dùng để liên hệ thật.
        </p>
      </div>

      <form ref={formRef} className="mt-7" onSubmit={handleSubmit} noValidate>
        {hasErrors ? (
          <p className="mb-5 rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-4 py-3 text-sm text-[var(--danger)]" role="alert">
            Vui lòng kiểm tra các trường được đánh dấu bên dưới.
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
                aria-describedby={
                  errors.attachment
                    ? "contact-attachment-note contact-attachment-error"
                    : "contact-attachment-note"
                }
                className="sr-only"
              />
            </span>
            <span id="contact-attachment-note" className="sr-only">File chỉ được đọc tên, định dạng và kích thước trong trình duyệt; không được tải lên.</span>
            <ContactFieldError id="contact-attachment-error" message={errors.attachment} />
          </label>
        </fieldset>

        <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full sm:w-auto">
          {submitting ? (
            <><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Đang xử lý mock...</>
          ) : (
            <><Send size={18} aria-hidden="true" /> Gửi yêu cầu mock</>
          )}
        </Button>
      </form>
    </section>
  );
}
