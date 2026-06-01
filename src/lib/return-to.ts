export const DEFAULT_RETURN_TO = "/ranking";

export function sanitizeReturnTo(value: string | null | undefined) {
  if (!value) {
    return DEFAULT_RETURN_TO;
  }

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("://")
  ) {
    return DEFAULT_RETURN_TO;
  }

  return value;
}
