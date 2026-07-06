import Link from "next/link";
import { getCurrentUser } from "@/lib/identity";

const LOGIN = "/.auth/login/aad?post_login_redirect_uri=/account";
const LOGOUT = "/.auth/logout?post_logout_redirect_uri=/";

/** Sidebar identity chip: sign-in prompt when anonymous, user + sign-out when known. */
export async function AccountChip() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <a
        href={LOGIN}
        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/5 text-slate-400">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        Sign in
      </a>
    );
  }

  const label = user.name ?? user.email ?? "Signed in";
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink-900/40 px-2.5 py-2">
      <Link href="/account" className="flex min-w-0 flex-1 items-center gap-2" title="View account">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-azure-400 to-azure-600 text-xs font-semibold text-white">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-white">{label}</span>
          <span className="block truncate text-[11px] text-slate-500">{user.roles.join(" · ")}</span>
        </span>
      </Link>
      <a href={LOGOUT} title="Sign out" className="shrink-0 text-slate-500 transition-colors hover:text-slate-200">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}
