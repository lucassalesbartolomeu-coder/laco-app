// Analytics — Google Analytics 4 + cookie consent
// Adaptado do Colo: cookie key "laco-cookie-consent"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("laco-cookie-consent") === "accepted";
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(args);
}

export function initAnalytics() {
  if (typeof window === "undefined" || !GA_ID) return;
  if (document.getElementById("ga4-script")) return;

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", GA_ID, {
    send_page_view: true,
    cookie_flags: "SameSite=None;Secure",
  });
}

export function track(event: string, properties?: Record<string, unknown>): void {
  if (!hasAnalyticsConsent()) return;
  if (GA_ID) gtag("event", event, properties || {});
  if (process.env.NODE_ENV === "development") console.log("[analytics]", event, properties);
}

export function identify(userId: string, traits?: Record<string, unknown>): void {
  if (!hasAnalyticsConsent()) return;
  if (GA_ID) gtag("config", GA_ID, { user_id: userId, ...traits });
}

export function page(name: string, properties?: Record<string, unknown>): void {
  if (!hasAnalyticsConsent()) return;
  if (GA_ID) gtag("event", "page_view", { page_title: name, ...properties });
}
