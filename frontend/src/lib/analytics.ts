/**
 * Privacy-friendly analytics (Plausible).
 *
 * Loads only in production builds, never on localhost, and uses the serving
 * hostname as the Plausible site id — so it works on the Render URL and on any
 * custom domain with no rebuild. Just add that hostname as a site in your
 * Plausible dashboard (https://plausible.io). No cookies, no consent banner.
 */
export function initAnalytics(): void {
  if (!import.meta.env.PROD) return;

  const host = window.location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1') return;

  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', host);
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}
