import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPin } from "@/lib/auth";

export async function POST(req: Request) {
  const { nickname, pin } = await req.json();
  if (!nickname || !pin) {
    return NextResponse.json({ error: "Nickname and PIN required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { nickname }, include: { wallet: true } });
  if (!user || !verifyPin(pin, user.pin_hash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, nickname: user.nickname }, coins: user.wallet?.coins ?? 0 });
}
