import { prisma } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;  // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minute lockout

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfter?: Date }> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_MS);

    const record = await prisma.rateLimitAttempt.findUnique({ where: { key } });

    if (record) {
      if (record.lockedUntil && record.lockedUntil > now) {
        return { allowed: false, retryAfter: record.lockedUntil };
      }
      if (record.lastAttempt < windowStart) {
        await prisma.rateLimitAttempt.update({
          where: { key },
          data: { attempts: 1, lockedUntil: null, lastAttempt: now },
        });
        return { allowed: true };
      }
      const newAttempts = record.attempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockedUntil = new Date(now.getTime() + LOCKOUT_MS);
        await prisma.rateLimitAttempt.update({
          where: { key },
          data: { attempts: newAttempts, lockedUntil, lastAttempt: now },
        });
        return { allowed: false, retryAfter: lockedUntil };
      }
      await prisma.rateLimitAttempt.update({
        where: { key },
        data: { attempts: newAttempts, lastAttempt: now },
      });
      return { allowed: true };
    }

    await prisma.rateLimitAttempt.create({
      data: { key, attempts: 1, lastAttempt: now },
    });
    return { allowed: true };
  } catch {
    // Rate limit fail hone pe block mat karo — allow karo
    return { allowed: true };
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  try {
    await prisma.rateLimitAttempt.deleteMany({ where: { key } });
  } catch {
    // Silent fail
  }
}
