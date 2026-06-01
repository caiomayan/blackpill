import { z } from "zod";
import { InGameRole } from "@prisma/client";

export const onboardingSchema = z.object({
  username: z.string().trim().min(3, "Username is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(254),
  inGameRoles: z.array(z.nativeEnum(InGameRole)).max(3, "Select up to 3 roles maximum"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
