/**
 * Privacy-friendly analytics — Cloudflare Web Analytics.
 *
 * Free, unlimited, no cookies, no consent banner. Loads only in production
 * builds and never on localhost.
 *
 * SETUP (one-time):
 *   1. Cloudflare dashboard → Web Analytics → "Add a site".
 *   2. Enter the hostname (e.g. multiplayer-snake-game.onrender.com). You do NOT
 *      need to move your domain/DNS to Cloudflare — choose the JS-beacon option.
 *   3. Copy the token from the snippet (the `data-cf-beacon` "token" value) and
 *      paste it below. Commit + redeploy.
 *
 * While the token is empty this is a no-op, so it's safe to ship before setup.
 */
// Public site identifier (embedded in page HTML by design), not a secret.
const CF_BEACON_TOKEN = '960369369f314a1c8cf0bec0caa5699e'; // pragma: allowlist secret

export function initAnalytics(): void {
  if (!import.meta.env.PROD) return;
  if (!CF_BEACON_TOKEN) return;

  const host = window.location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1') return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_BEACON_TOKEN }));
  document.head.appendChild(script);
}
