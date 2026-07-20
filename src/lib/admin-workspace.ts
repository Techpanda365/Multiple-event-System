import { cookies } from "next/headers";

const COOKIE_NAME = "admin_ws_id";

export async function getAdminWorkspaceCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export { COOKIE_NAME };
