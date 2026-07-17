import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { logoutAction } from "@/actions/auth.actions";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getCurrentUser } from "@/server/auth";

export const metadata: Metadata = {
  title: "Đăng nhập Admin",
  description: "Đăng nhập khu vực quản trị.",
};

type LoginSearchParams = Promise<{
  error?: string | string[];
  next?: string | string[];
  status?: string | string[];
}>;

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  const [currentUser, params] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);

  if (currentUser?.status === "active") {
    redirect("/admin");
  }

  const error = firstValue(params.error);
  const status = firstValue(params.status);
  const nextPath = firstValue(params.next);

  return (
    <section className="admin-login-page" aria-labelledby="admin-login-title">
      <div className="admin-login-card">
        <div className="admin-login-brand" aria-hidden="true">
          Q
        </div>
        <p className="admin-login-eyebrow">Khu vực quản trị</p>
        <h1 id="admin-login-title">Đăng nhập Admin</h1>
        <p className="admin-login-description">
          Sử dụng tài khoản đã được tạo trong Supabase Auth. Không có đăng ký
          quản trị công khai.
        </p>

        {error === "session_expired" ? (
          <p className="admin-login-alert" role="status">
            Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
          </p>
        ) : null}
        {error === "account_disabled" || currentUser?.status === "disabled" ? (
          <p className="admin-login-alert" role="alert">
            Tài khoản của bạn đã bị vô hiệu hóa.
          </p>
        ) : null}
        {error === "callback_failed" ? (
          <p className="admin-login-alert" role="alert">
            Không thể hoàn tất phiên đăng nhập. Vui lòng thử lại.
          </p>
        ) : null}
        {status === "logged_out" ? (
          <p className="admin-login-success" role="status">
            Bạn đã đăng xuất thành công.
          </p>
        ) : null}

        {currentUser?.status === "disabled" ? (
          <form action={logoutAction}>
            <button className="admin-login-secondary" type="submit">
              Đăng xuất để dùng tài khoản khác
            </button>
          </form>
        ) : (
          <AdminLoginForm nextPath={nextPath} />
        )}
      </div>
    </section>
  );
}
