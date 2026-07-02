import Link from "next/link";

/** The Nimbus wordmark + cloud glyph. Used in the sidebar header. */
export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-azure-400 to-azure-600 shadow-lg shadow-azure-500/20">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-white"
          aria-hidden="true"
        >
          <path
            d="M7 18h9a4 4 0 0 0 .6-7.955A5.5 5.5 0 0 0 6.1 9.02 3.5 3.5 0 0 0 7 18Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-white">
          Nimbus
        </span>
        <span className="text-[11px] text-slate-500">Developer Platform</span>
      </span>
    </Link>
  );
}
