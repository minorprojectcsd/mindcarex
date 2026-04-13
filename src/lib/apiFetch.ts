/**
 * Failover fetch: tries primary URL first, falls back to backup on network/5xx errors.
 */
export async function failoverFetch(
  primaryBase: string,
  backupBase: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  try {
    const res = await fetch(`${primaryBase}${path}`, init);
    if (res.status >= 500) throw new Error(`Primary returned ${res.status}`);
    return res;
  } catch {
    return fetch(`${backupBase}${path}`, init);
  }
}

export function createDualFetch(envVar: string, fallback1: string, fallback2: string) {
  const raw = envVar || `${fallback1},${fallback2}`;
  const [primary, backup] = raw.split(',').map(u => u.trim());
  return (path: string, init?: RequestInit) =>
    failoverFetch(primary, backup || primary, path, init);
}
