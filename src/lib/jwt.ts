import jwt from "jsonwebtoken";

const SECRET = process.env.AUTH_SECRET || "super-secret-key";

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  image?: string;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export async function signRefreshToken(payload: Pick<SessionPayload, "id" | "email">): Promise<string> {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const decoded = jwt.verify(token, SECRET) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}
