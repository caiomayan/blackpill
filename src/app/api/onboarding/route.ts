import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/session";
import { onboardingSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();

    return NextResponse.json(
      {
        error: "Invalid onboarding data.",
        fieldErrors: {
          username: flattened.fieldErrors.username?.[0],
          email: flattened.fieldErrors.email?.[0],
          inGameRoles: flattened.fieldErrors.inGameRoles?.[0],
        },
      },
      { status: 400 },
    );
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        username: parsed.data.username,
        email: parsed.data.email,
        inGameRoles: parsed.data.inGameRoles,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email is already in use." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Unable to complete onboarding." },
      { status: 500 },
    );
  }
}
