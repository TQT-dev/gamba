import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { runId, action } = await req.json();
    const run = await prisma.run.findUnique({ where: { id: runId } });
    if (!run || run.user_id !== session.user_id) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }
    const transcript = Array.isArray(run.transcript_json) ? run.transcript_json : [];
    transcript.push(action);
    await prisma.run.update({ where: { id: runId }, data: { transcript_json: transcript } });
    return NextResponse.json({ ok: true, transcript });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed" }, { status: 400 });
  }
}
