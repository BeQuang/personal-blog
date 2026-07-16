import { ArrowRight, Compass, Home, Newspaper } from "lucide-react";

import { LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";

export default function NotFound() {
  return (
    <section className="relative isolate flex flex-1 items-center overflow-hidden py-20 sm:py-28" aria-labelledby="not-found-title">
      <span className="pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-[clamp(10rem,32vw,25rem)] font-black leading-none tracking-[-0.08em] text-[color-mix(in_srgb,var(--primary)_7%,transparent)]" aria-hidden="true">404</span>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--primary)] shadow-[var(--shadow-card)]">
            <Compass size={30} aria-hidden="true" />
          </span>
          <p className="mt-7 text-xs font-bold tracking-[0.18em] text-[var(--primary)] uppercase">Lạc đường một chút</p>
          <h1 id="not-found-title" className="mt-3 text-[length:var(--text-display)] font-bold leading-tight tracking-[-0.05em]">Trang bạn tìm không tồn tại</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">Liên kết có thể đã thay đổi hoặc nội dung chưa được xuất bản. Bạn có thể quay về trang chủ hoặc tiếp tục khám phá các bài viết mới.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/" size="lg"><Home size={18} aria-hidden="true" /> Về trang chủ</LinkButton>
            <LinkButton href="/blog" size="lg" variant="outline"><Newspaper size={18} aria-hidden="true" /> Xem bài viết <ArrowRight size={18} aria-hidden="true" /></LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
