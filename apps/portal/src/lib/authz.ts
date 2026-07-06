import type { NimbusUser } from "./identity";

/**
 * Authorization is a policy layer, never scattered `if (user.isAdmin)` checks.
 * A policy is a named, described predicate over the current user. We start with one
 * policy and grow the registry deliberately as capabilities appear.
 *
 * Note (ADR-0009): authorization enforces *access*; it is a separate concern from
 * identity (who you are) and from data partitioning (where data lives).
 */
export type Policy = {
  name: string;
  describe: string;
  evaluate: (user: NimbusUser | null) => boolean;
};

export const policies = {
  "platform.admin": {
    name: "platform.admin",
    describe: "Manage platform content and settings",
    evaluate: (user) => !!user && user.roles.includes("administrator"),
  },
} satisfies Record<string, Policy>;

export type PolicyName = keyof typeof policies;

/** The single entry point for authorization decisions. */
export function can(user: NimbusUser | null, policy: PolicyName): boolean {
  return policies[policy].evaluate(user);
}
