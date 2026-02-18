import { headers } from "next/headers";
import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { IncomingHttpHeaders } from "http";
import { handler } from "next/dist/build/templates/app-page";

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
  let evt = Event | null;

  try {
    const evt = wh.verify(
      JSON.stringify(payload),
      svixHeaders as IncomingHttpHeaders & Webhook,
    ) as Event;
  } catch (err) {
    console.error(err as Error, message);
    return NextResponse.json({}, { status: 400 });
  }
  const eventType: EventType = evt.type;
  if (eventType === "user.created" || eventType === "user.updated") {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      primary_email_address_id,
      ...atributes
    } = evt.data;
    await prisma.user.upsert({
      where: { externalId: id as string },
      create: {
        externalId: id as string,
        attributes,
      },
      update: {
        attributes,
      },
    });
  }
  return NextResponse.json({}, { status: 200 });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
