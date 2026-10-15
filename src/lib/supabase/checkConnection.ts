export type ConnectionResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

export async function checkSupabaseConnection(
  url: string | undefined,
  key: string | undefined,
): Promise<ConnectionResult> {
  if (!url || !key) {
    return {
      ok: false,
      reason:
        "NEXT_PUBLIC_SUPABASE_URL または NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY が未設定です",
    };
  }

  try {
    const response = await fetch(new URL("/auth/v1/health", url), {
      headers: { apikey: key },
    });
    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status}` };
    }
    return { ok: true, url };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}
