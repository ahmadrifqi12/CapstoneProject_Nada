import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

export const SearchIcon = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const BagIcon = (p: P) => (
  <svg {...base(p)}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const UserIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const PlusIcon = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const MinusIcon = (p: P) => (<svg {...base(p)}><path d="M5 12h14" /></svg>);
export const TrashIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
);
export const ArrowIcon = (p: P) => (<svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const CheckIcon = (p: P) => (<svg {...base(p)}><path d="m5 12 5 5 9-10" /></svg>);
export const LinkIcon = (p: P) => (
  <svg {...base(p)}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
);

export function SocialIcon({ platform, ...p }: { platform: string } & P) {
  switch (platform.toLowerCase()) {
    case "instagram":
      return (<svg {...base(p)}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></svg>);
    case "tiktok":
      return (<svg {...base(p)}><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 4c.4 2.4 2 4 4.5 4.2" /></svg>);
    case "facebook":
      return (<svg {...base(p)}><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5H14Z" /></svg>);
    case "youtube":
      return (<svg {...base(p)}><rect x="3" y="6" width="18" height="12" rx="4" /><path d="m10.5 9.5 4 2.5-4 2.5v-5Z" /></svg>);
    case "whatsapp":
      return (<svg {...base(p)}><path d="M4 20l1.2-4.2A8 8 0 1 1 8.4 18.9L4 20Z" /><path d="M9 9c.3 2.5 2.5 4.700 5.200 5.300l1-1.300-1.800-.9-.8.700c-.9-.4-1.700-1.200-2.100-2.100l.7-.8L10.300 8 9 9Z" /></svg>);
    case "pinterest":
      return (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M11 8.500c2.500-.8 4.500.7 4 3-.4 2-2.300 3-3.500 2.200M11.500 11l-1.500 7" /></svg>);
    case "x":
    case "twitter":
      return (<svg {...base(p)}><path d="M5 4l14 16M19 4 5 20" /></svg>);
    default:
      return <LinkIcon {...p} />;
  }
}

export const PLATFORMS = ["instagram", "tiktok", "facebook", "youtube", "whatsapp", "pinterest", "x"] as const;
