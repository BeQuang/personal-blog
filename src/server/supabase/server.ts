import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable/anon key are required",
    );
  }

  return { key, url };
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { key, url } = getSupabasePublicConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. src/proxy.ts refreshes them.
        }
      },
    },
  });
}
