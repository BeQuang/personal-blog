"use client";

import { CheckCircle2, LoaderCircle, Mail } from "lucide-react";
import { type FormEvent, useCallback, useState, useTransition } from "react";

import { subscribeNewsletterAction } from "@/actions/submissions.actions";
import { Button } from "@/components/common/Button";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";

interface NewsletterFormProps {
  privacyNote: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ privacyNote }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    if (token) setError("");
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setSubmitted(false);
      setError("Vui lòng nhập một địa chỉ email hợp lệ.");
      return;
    }
    if (!turnstileToken) {
      setSubmitted(false);
      setError("Vui lòng hoàn tất xác minh chống spam.");
      return;
    }

    startTransition(async () => {
      const result = await subscribeNewsletterAction({
        email: normalizedEmail,
        turnstileToken,
      });
      setTurnstileReset((current) => current + 1);
      if (!result.success) {
        setSubmitted(false);
        setError(result.fieldErrors?.email?.[0] ?? result.message);
        return;
      }

      setError("");
      setSubmitted(true);
      setEmail("");
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div className="newsletter-form">
          <label htmlFor="newsletter-email" className="sr-only">
            Địa chỉ email
          </label>
          <div className="newsletter-input-wrap">
            <Mail size={19} aria-hidden="true" />
            <input
              id="newsletter-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="ban@example.com"
              value={email}
              disabled={pending}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "newsletter-error" : "newsletter-note"}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
                if (submitted) setSubmitted(false);
              }}
            />
          </div>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? <><LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Đang gửi</> : "Đăng ký"}
          </Button>
        </div>
        <div>
          <TurnstileWidget
            action="newsletter"
            onTokenChange={handleTurnstileToken}
            resetSignal={turnstileReset}
          />
        </div>
      </form>

      {error ? (
        <p id="newsletter-error" className="newsletter-error" role="alert">
          {error}
        </p>
      ) : (
        <p id="newsletter-note" className="newsletter-note">{privacyNote}</p>
      )}

      {submitted ? (
        <div className="newsletter-toast" role="status" aria-live="polite">
          <CheckCircle2 size={20} aria-hidden="true" />
          Yêu cầu đăng ký đã được ghi nhận.
        </div>
      ) : null}
    </div>
  );
}
