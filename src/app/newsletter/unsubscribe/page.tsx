import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button, LinkButton } from "@/components/common/Button";
import { Container } from "@/components/common/Container";
import { unsubscribeNewsletter } from "@/server/services/submissions.service";

export const metadata: Metadata = {
  title: "Hủy đăng ký bản tin",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ token?: string; done?: string }>;
}

export default async function NewsletterUnsubscribePage({ searchParams }: PageProps) {
  const { token, done } = await searchParams;

  async function unsubscribeAction() {
    "use server";
    if (token) {
      try {
        await unsubscribeNewsletter(token);
        revalidatePath("/admin/submissions");
      } catch {
        // Keep the response generic so the token cannot be used as an oracle.
      }
    }
    redirect("/newsletter/unsubscribe?done=1");
  }

  return (
    <Container className="py-20 sm:py-28">
      <section className="mx-auto max-w-xl rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[var(--shadow-card)] sm:p-10">
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase">
          Newsletter
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em]">
          {done ? "Yêu cầu đã được xử lý" : "Hủy đăng ký nhận bản tin"}
        </h1>
        <p className="mt-4 leading-7 text-[var(--text-secondary)]">
          {done
            ? "Nếu liên kết hợp lệ, địa chỉ email đã được chuyển sang trạng thái hủy đăng ký."
            : "Bạn sẽ không nhận các bản tin marketing trong tương lai. Thao tác này không ảnh hưởng đến email giao dịch cần thiết."}
        </p>
        {!done && token ? (
          <form action={unsubscribeAction} className="mt-7">
            <Button type="submit" size="lg">Xác nhận hủy đăng ký</Button>
          </form>
        ) : (
          <LinkButton href="/" size="lg" className="mt-7">Về trang chủ</LinkButton>
        )}
        {!done && !token ? (
          <p className="mt-5 text-sm text-[var(--danger)]" role="alert">
            Liên kết hủy đăng ký không hợp lệ. <Link href="/contact" className="underline">Liên hệ hỗ trợ</Link> nếu bạn cần trợ giúp.
          </p>
        ) : null}
      </section>
    </Container>
  );
}
