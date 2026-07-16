import { AlertTriangle, CalendarDays } from "lucide-react";

import { Container } from "@/components/common/Container";

export interface LegalSection {
  title: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
}

interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  updatedLabel: string;
  sections: readonly LegalSection[];
}

export function LegalDocument({
  eyebrow,
  title,
  description,
  updatedAt,
  updatedLabel,
  sections,
}: LegalDocumentProps) {
  return (
    <article className="pb-20 sm:pb-24">
      <header className="border-b border-[var(--border)] bg-[var(--background-secondary)] py-12 sm:py-16">
        <Container size="article">
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--primary)] uppercase">{eyebrow}</p>
          <h1 className="mt-3 text-[length:var(--text-h1)] font-bold leading-tight tracking-[-0.04em]">{title}</h1>
          <p className="mt-5 text-base leading-7 text-[var(--text-secondary)] sm:text-lg">{description}</p>
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <CalendarDays size={17} aria-hidden="true" /> Cập nhật mẫu: <time dateTime={updatedAt}>{updatedLabel}</time>
          </p>
        </Container>
      </header>

      <Container size="article" className="pt-10 sm:pt-12">
        <aside className="flex gap-3 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--warning)_35%,var(--border))] bg-[color-mix(in_srgb,var(--warning)_8%,var(--surface))] p-5 text-sm leading-6 text-[var(--text-secondary)]" aria-label="Lưu ý pháp lý">
          <AlertTriangle className="mt-0.5 shrink-0 text-[var(--warning)]" size={20} aria-hidden="true" />
          <p><strong className="text-[var(--text-primary)]">Nội dung mẫu:</strong> Tài liệu này chỉ phục vụ giao diện MVP, không phải tư vấn pháp lý và cần được chuyên gia phù hợp kiểm tra trước khi đưa website lên production.</p>
        </aside>

        <div className="mt-10 space-y-10">
          {sections.map((section, index) => (
            <section aria-labelledby={`legal-section-${index + 1}`} key={section.title}>
              <h2 id={`legal-section-${index + 1}`} className="text-2xl font-bold tracking-[-0.025em]">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p className="mt-4 leading-8 text-[var(--text-secondary)]" key={paragraph}>{paragraph}</p>
              ))}
              {section.items ? (
                <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-[var(--text-secondary)] marker:text-[var(--primary)]">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </Container>
    </article>
  );
}
