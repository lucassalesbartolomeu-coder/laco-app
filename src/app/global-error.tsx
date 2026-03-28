"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#F5F3EF",
          color: "#1A3A33",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "320px",
            width: "100%",
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: "28px",
              fontFamily: "Georgia, serif",
              letterSpacing: "0.05em",
              marginBottom: "32px",
              color: "#1A3A33",
            }}
          >
            Laço
          </div>

          {/* Icon */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(196,115,79,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C4734F"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>

          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 8px",
            }}
          >
            Ops, algo deu errado
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(26,58,51,0.6)",
              margin: "0 0 32px",
              lineHeight: "1.5",
            }}
          >
            Ocorreu um erro inesperado. Nosso time foi notificado automaticamente.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={reset}
              style={{
                background: "#1A3A33",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "14px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Tentar novamente
            </button>
            <a
              href="/"
              style={{
                color: "rgba(26,58,51,0.7)",
                fontSize: "14px",
                textDecoration: "none",
                padding: "12px 20px",
                border: "1px solid rgba(26,58,51,0.2)",
                borderRadius: "12px",
                display: "block",
              }}
            >
              Voltar ao início
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
