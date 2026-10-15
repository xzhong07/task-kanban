import { afterEach, describe, expect, test, vi } from "vitest";
import { checkSupabaseConnection } from "@/lib/supabase/checkConnection";

const url = "https://example.supabase.co";
const key = "sb_publishable_test";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("checkSupabaseConnection", () => {
  test("Supabase が 200 を返すと接続成功になる", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await checkSupabaseConnection(url, key);

    expect(result).toEqual({ ok: true, url });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("/auth/v1/health", url),
      { headers: { apikey: key } },
    );
  });

  test("Supabase が 401 を返すと HTTP ステータス付きで接続失敗になる", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 401 })));

    const result = await checkSupabaseConnection(url, key);

    expect(result).toEqual({ ok: false, reason: "HTTP 401" });
  });

  test("ネットワークエラーが起きるとエラーメッセージ付きで接続失敗になる", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fetch failed")));

    const result = await checkSupabaseConnection(url, key);

    expect(result).toEqual({ ok: false, reason: "fetch failed" });
  });

  test.each([
    ["URL が未設定", undefined, key],
    ["キーが未設定", url, undefined],
    ["URL が空文字", "", key],
  ])("%s の場合は通信せずに接続失敗になる", async (_, u, k) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await checkSupabaseConnection(u, k);

    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
