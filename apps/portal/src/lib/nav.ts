export type NavItem = {
  href: string;
  label: string;
  /** Grouping in the sidebar. */
  section: "Platform" | "Capabilities";
  /** Shown as a muted "Soon" badge and rendered as a coming-soon page. */
  comingSoon?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Overview", section: "Platform" },
  { href: "/about", label: "About", section: "Platform" },
  { href: "/projects", label: "Projects", section: "Platform" },
  { href: "/architecture", label: "Architecture", section: "Platform" },
  { href: "/roadmap", label: "Roadmap", section: "Platform" },
  { href: "/journal", label: "Learning Journal", section: "Platform" },
  { href: "/platform", label: "Platform Status", section: "Platform" },

  { href: "/ai", label: "AI Assistant", section: "Capabilities", comingSoon: true },
  { href: "/telemetry", label: "Telemetry", section: "Capabilities", comingSoon: true },
  { href: "/notifications", label: "Notifications", section: "Capabilities", comingSoon: true },
];
