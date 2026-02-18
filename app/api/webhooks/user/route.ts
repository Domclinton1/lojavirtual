import { headers } from "next/headers";
import { Webhook } from "svix";
import { NextResponse } from "next/server";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  const payload = await req.json();
  const headersList = await headers();

  const svixHeaders = {
    "svix-id": headersList.get("svix-id")!,
    "svix-timestamp": headersList.get("svix-timestamp")!,
    "svix-signature": headersList.get("svix-signature")!,
  };

  const wh = new Webhook(webhookSecret);

  try {
    const evt = wh.verify(JSON.stringify(payload), svixHeaders);

    console.log("Webhook recebido:", evt);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return NextResponse.json({ error: "Erro" }, { status: 400 });
  }
}
