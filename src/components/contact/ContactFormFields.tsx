import { budgetRanges, collaborationTypes } from "@/config/contact.config";
import {
  contactFieldClasses,
  type ContactFormErrors,
  type ContactFormValues,
  type UpdateContactField,
} from "@/components/contact/contact-form.types";

interface ContactFormFieldsProps {
  values: ContactFormValues;
  errors: ContactFormErrors;
  updateField: UpdateContactField;
}

export function ContactFieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span id={id} className="mt-1 block text-xs leading-5 text-[var(--danger)]">
      {message}
    </span>
  ) : null;
}

export function ContactFormFields({
  values,
  errors,
  updateField,
}: ContactFormFieldsProps) {
  return (
    <>
      <label className="text-sm font-semibold">
        Họ và tên <span aria-hidden="true" className="text-[var(--danger)]">*</span>
        <input
          required
          value={values.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          autoComplete="name"
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "contact-fullName-error" : undefined}
          className={contactFieldClasses}
        />
        <ContactFieldError id="contact-fullName-error" message={errors.fullName} />
      </label>

      <label className="text-sm font-semibold">
        Email <span aria-hidden="true" className="text-[var(--danger)]">*</span>
        <input
          required
          type="email"
          inputMode="email"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={contactFieldClasses}
        />
        <ContactFieldError id="contact-email-error" message={errors.email} />
      </label>

      <label className="text-sm font-semibold">
        Số điện thoại <span className="font-normal text-[var(--text-muted)]">(không bắt buộc)</span>
        <input
          type="tel"
          inputMode="tel"
          value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          autoComplete="tel"
          placeholder="0901234567"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "contact-phone-error" : undefined}
          className={contactFieldClasses}
        />
        <ContactFieldError id="contact-phone-error" message={errors.phone} />
      </label>

      <label className="text-sm font-semibold">
        Tên công ty <span className="font-normal text-[var(--text-muted)]">(không bắt buộc)</span>
        <input
          value={values.company}
          onChange={(event) => updateField("company", event.target.value)}
          autoComplete="organization"
          className={contactFieldClasses}
        />
      </label>

      <label className="text-sm font-semibold">
        Loại hợp tác <span aria-hidden="true" className="text-[var(--danger)]">*</span>
        <select
          required
          value={values.collaborationType}
          onChange={(event) => updateField("collaborationType", event.target.value)}
          aria-invalid={Boolean(errors.collaborationType)}
          aria-describedby={errors.collaborationType ? "contact-type-error" : undefined}
          className={contactFieldClasses}
        >
          <option value="">Chọn loại hợp tác</option>
          {collaborationTypes.map((type) => <option value={type} key={type}>{type}</option>)}
        </select>
        <ContactFieldError id="contact-type-error" message={errors.collaborationType} />
      </label>

      <label className="text-sm font-semibold">
        Ngân sách dự kiến <span className="font-normal text-[var(--text-muted)]">(không bắt buộc)</span>
        <select
          value={values.budget}
          onChange={(event) => updateField("budget", event.target.value)}
          className={contactFieldClasses}
        >
          <option value="">Chọn khoảng ngân sách</option>
          {budgetRanges.map((range) => <option value={range} key={range}>{range}</option>)}
        </select>
      </label>

      <label className="text-sm font-semibold sm:col-span-2">
        Nội dung hợp tác <span aria-hidden="true" className="text-[var(--danger)]">*</span>
        <textarea
          required
          value={values.message}
          onChange={(event) => updateField("message", event.target.value)}
          rows={6}
          maxLength={2_000}
          placeholder="Mục tiêu, thời gian dự kiến, nền tảng và những yêu cầu quan trọng..."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : "contact-message-note"}
          className={`${contactFieldClasses} resize-y py-3`}
        />
        <ContactFieldError id="contact-message-error" message={errors.message} />
        {!errors.message ? <span id="contact-message-note" className="mt-1 block text-xs font-normal text-[var(--text-muted)]">Tối thiểu 20, tối đa 2.000 ký tự.</span> : null}
      </label>
    </>
  );
}
