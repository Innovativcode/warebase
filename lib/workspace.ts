const WORKSPACE_EXEMPT_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/api",
  "/dashboard",
  "/",
];

export function workspaceHref(staffId: string | null | undefined, path: string): string {
  if (!staffId || !path.startsWith("/") || path.startsWith("//")) return path;

  for (const prefix of WORKSPACE_EXEMPT_PREFIXES) {
    if (path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`)) {
      return path;
    }
  }

  return `/${staffId}${path}`;
}

export function workspacePathname(staffId: string | null | undefined, pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return pathname;
  if (segments[0] !== staffId) return pathname;

  return `/${segments.slice(1).join("/")}`;
}
