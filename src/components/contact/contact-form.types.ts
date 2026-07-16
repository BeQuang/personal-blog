export interface ContactFormValues {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  collaborationType: string;
  budget: string;
  message: string;
}

export type ContactFormErrors = Partial<
  Record<keyof ContactFormValues | "attachment", string>
>;

export type UpdateContactField = <Key extends keyof ContactFormValues>(
  field: Key,
  value: ContactFormValues[Key],
) => void;

export const initialContactFormValues: ContactFormValues = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  collaborationType: "",
  budget: "",
  message: "",
};

export const contactFieldClasses =
  "mt-2 min-h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60";

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  const normalizedPhone = values.phone.replace(/[\s.-]/g, "");

  if (values.fullName.length < 2) {
    errors.fullName = "Vui lòng nhập họ tên hợp lệ.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Vui lòng nhập đúng định dạng email.";
  }
  if (values.phone && !/^(?:\+84|0)\d{9}$/.test(normalizedPhone)) {
    errors.phone = "Số điện thoại cần có dạng 0xxxxxxxxx hoặc +84xxxxxxxxx.";
  }
  if (!values.collaborationType) {
    errors.collaborationType = "Vui lòng chọn loại hợp tác.";
  }
  if (values.message.length < 20) {
    errors.message = "Vui lòng mô tả nhu cầu hợp tác bằng ít nhất 20 ký tự.";
  }

  return errors;
}
