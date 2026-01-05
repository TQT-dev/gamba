import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { nickname, pin } = await req.json();
  if (!nickname || !pin) {
    return NextResponse.json({ error: "Nickname and PIN required" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { nickname } });
  if (existing) {
    return NextResponse.json({ error: "Nickname taken" }, { status: 400 });
  }
  const user = await prisma.user.create({
    data: {
      nickname,
      pin_hash: hashPin(pin),
      wallet: { create: { coins: 500 } },
    },
    include: { wallet: true },
  });
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, nickname: user.nickname }, coins: user.wallet?.coins ?? 0 });
}
