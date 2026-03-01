import type { UserRole } from "@/providers/auth-provider/context";

/**
 * Returns true when the user has only the SalesRep role (no Admin, SalesManager, or BDM).
 * Use for nav, redirects, and list scoping so sales reps get a focused experience.
 */
export function isSalesRepOnly(roles: UserRole[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.length === 1 && roles[0] === "SalesRep";
}

/**
 * Paths (or prefixes) that require specific roles.
 * null = any authenticated user.
 * Order matters for prefix matching: more specific paths first if we add overlapping entries.
 */
const ROUTE_ROLE_MAP: { path: string; roles: UserRole[] }[] = [
  { path: "/reports", roles: ["Admin", "SalesManager"] },
];

/**
 * Returns the list of roles allowed to access the given path, or null if any authenticated user may access it.
 */
export function getAllowedRoles(pathname: string): UserRole[] | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  for (const { path, roles } of ROUTE_ROLE_MAP) {
    if (normalized === path || normalized.startsWith(path + "/")) {
      return roles;
    }
  }
  return null;
}

/**
 * Returns true if the user has at least one of the roles required for the path (or if the path has no role restriction).
 */
export function hasAccess(userRoles: UserRole[], pathname: string): boolean {
  const allowed = getAllowedRoles(pathname);
  if (allowed === null) return true;
  return userRoles.some((r) => allowed.includes(r));
}
