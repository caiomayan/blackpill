"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InGameRole } from "@prisma/client";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/validation";

type OnboardingFormProps = {
  defaultValues: Partial<OnboardingInput>;
  returnTo: string;
};

type FormState = {
  username: string;
  email: string;
  inGameRoles: InGameRole[];
};

export function OnboardingForm({
  defaultValues,
  returnTo,
}: OnboardingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    username: defaultValues.username ?? "",
    email: defaultValues.email ?? "",
    inGameRoles: defaultValues.inGameRoles ?? [],
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);

  const IN_GAME_ROLES = Object.values(InGameRole);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  }

  const toggleRole = (role: InGameRole) => {
    setFormState((prev) => {
      const isSelected = prev.inGameRoles.includes(role);
      if (isSelected) {
        return { ...prev, inGameRoles: prev.inGameRoles.filter((r) => r !== role) };
      }
      if (prev.inGameRoles.length >= 3) {
        return prev;
      }
      return { ...prev, inGameRoles: [...prev.inGameRoles, role] };
    });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const validation = onboardingSchema.safeParse(formState);

    if (!validation.success) {
      const flattened = validation.error.flatten();

      setFieldErrors({
        username: flattened.fieldErrors.username?.[0],
        email: flattened.fieldErrors.email?.[0],
        inGameRoles: flattened.fieldErrors.inGameRoles?.[0],
      });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        fieldErrors?: Partial<Record<keyof FormState, string>>;
      } | null;

      if (!response.ok) {
        if (payload?.fieldErrors) {
          setFieldErrors(payload.fieldErrors);
        }

        setFormError(payload?.error ?? "Could not complete onboarding.");
        return;
      }

      router.push(returnTo);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <label className="grid gap-2 text-sm text-black font-bold">
        Username
        <Input
          name="username"
          value={formState.username}
          onChange={handleChange}
          placeholder="Choose your username"
          autoComplete="nickname"
          className="rounded-xl"
        />
        {fieldErrors.username ? (
          <span className="text-xs text-red-600">{fieldErrors.username}</span>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm text-black font-bold">
        Email
        <Input
          name="email"
          type="email"
          value={formState.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          className="rounded-xl"
        />
        {fieldErrors.email ? (
          <span className="text-xs text-red-600">{fieldErrors.email}</span>
        ) : null}
      </label>

      <div className="grid gap-2">
        <label className="text-sm text-black font-bold">In-Game Roles</label>
        <div className="flex flex-wrap gap-2">
          {IN_GAME_ROLES.map((role) => {
            const isSelected = formState.inGameRoles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-500 border-neutral-200 hover:border-black hover:text-black"
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>
        {fieldErrors.inGameRoles ? (
          <span className="text-xs text-red-600">{fieldErrors.inGameRoles}</span>
        ) : null}
      </div>

      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

      <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl mt-2 font-bold bg-black hover:bg-neutral-800">
        {isSubmitting ? "Saving..." : "Complete profile"}
      </Button>
    </form>
  );
}
