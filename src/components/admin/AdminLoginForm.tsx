"use client";

import { useActionState } from "react";

import { loginAction } from "@/actions/auth.actions";
import type { LoginActionState } from "@/types";

const initialState: LoginActionState = {};

export function AdminLoginForm({ nextPath }: { nextPath?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="admin-login-form" noValidate>
      <input type="hidden" name="next" value={nextPath ?? "/admin"} />

      <div className="admin-login-field">
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          aria-describedby={state.errors?.email ? "admin-email-error" : undefined}
          aria-invalid={Boolean(state.errors?.email)}
          required
        />
        {state.errors?.email ? (
          <p id="admin-email-error" className="admin-login-error">
            {state.errors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="admin-login-field">
        <label htmlFor="admin-password">Mật khẩu</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-describedby={
            state.errors?.password ? "admin-password-error" : undefined
          }
          aria-invalid={Boolean(state.errors?.password)}
          required
        />
        {state.errors?.password ? (
          <p id="admin-password-error" className="admin-login-error">
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p className="admin-login-alert" role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
