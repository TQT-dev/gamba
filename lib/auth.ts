import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomUUID, createHash } from "crypto";
import { prisma } from "./prisma";

const SESSION_COOKIE = "gamba_session";

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = await prisma.session.findFirst({
    where: {
      token_hash: tokenHash,
      expires_at: { gt: new Date() },
    },
    include: {
      user: {
        include: {
          wallet: true,
        },
      },
    },
  });
  return session;
}

export function hashPin(pin: string) {
  return bcrypt.hashSync(pin, 10);
}

export function verifyPin(pin: string, hash: string) {
  return bcrypt.compareSync(pin, hash);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomUUID();
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  await prisma.session.create({
    data: {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expires,
    },
  });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
  });
  return token;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
