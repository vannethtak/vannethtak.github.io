const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const pendingEvents = new Set<string>();

function storedId(storage: Storage, key: string): string {
  const existing = storage.getItem(key);
  if (existing && uuidPattern.test(existing)) return existing;
  const id = crypto.randomUUID();
  storage.setItem(key, id);
  return id;
}

function isLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.startsWith("127.") ||
    host === "[::1]" ||
    /^\[::ffff:7f[0-9a-f]{2}:[0-9a-f]{1,4}\]$/.test(host)
  );
}

// One visit per page per tab session. Stored IDs survive reloads and make
// retries idempotent even when a response is lost after the API saves it.
export async function recordPageVisit(apiUrl: string): Promise<void> {
  try {
    if (
      isLocalHost(window.location.hostname) ||
      isLocalHost(new URL(apiUrl).hostname)
    ) return;

    const session = window.sessionStorage;
    const visitorId = storedId(window.localStorage, "portfolio-visitor-id");
    const sessionId = storedId(session, "portfolio-session-id");
    const path = window.location.pathname;
    const key = `portfolio-page-visit:${sessionId}:${path}`;
    const eventId = storedId(session, key);
    const sentKey = `${key}:sent`;
    if (session.getItem(sentKey) === eventId || pendingEvents.has(eventId)) return;

    pendingEvents.add(eventId);
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/analytics/page-view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          visitorId,
          sessionId,
          path,
          referrer: document.referrer || undefined,
        }),
        keepalive: true,
      });
      if (response.ok) session.setItem(sentKey, eventId);
    } finally {
      pendingEvents.delete(eventId);
    }
  } catch {
    // Skip tracking if storage is blocked or the request fails. Never create
    // fresh anonymous events on every reload when IDs cannot be persisted.
  }
}
