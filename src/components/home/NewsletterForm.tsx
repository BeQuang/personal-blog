"use client";

import { CheckCircle2, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/common/Button";
import { trackNewsletterSubmit } from "@/lib/analytics";

interface NewsletterFormProps {
  privacyNote: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ privacyNote }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!emailPattern.test(normalizedEmail)) {
      setSubmitted(false);
      setError("Vui lòng nhập một địa chỉ email hợp lệ.");
      return;
    }

    setError("");
    setSubmitted(true);
    setEmail("");
    trackNewsletterSubmit();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="newsletter-form">
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
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "newsletter-error" : "newsletter-note"}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError("");
              if (submitted) setSubmitted(false);
            }}
          />
        </div>
        <Button type="submit" size="lg">Đăng ký</Button>
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
          Đăng ký thành công! Đây là thao tác mô phỏng, email của bạn không được lưu.
        </div>
      ) : null}
    </div>
  );
}
