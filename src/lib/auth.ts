import { cookies } from "next/headers";
import { verifyToken, decodeToken, type SessionPayload } from "./jwt";

export interface Session {
  user: SessionPayload & { id: string };
  expires: string;
}

export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session-token")?.value || cookieStore.get("next-auth.session-token")?.value;

    if (!token) return null;

    const payload = await verifyToken(token);

    if (!payload) return null;

    return {
      user: { ...payload, id: payload.id },
      expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

export const handlers = {
  GET: () => new Response(null, { status: 404 }),
  POST: () => new Response(null, { status: 404 }),
};

export const signIn = async () => { throw new Error("Use /api/login or /api/admin/login instead") };
export const signOut = async () => { throw new Error("Use /api/logout instead") };
