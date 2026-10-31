import type { SVGProps } from "react";

/**
 * Minimal stroke-based icon set used across the app's navigation and player
 * controls, replacing emoji glyphs for a consistent, premium look across
 * platforms. All icons are 24x24, use `currentColor`, and accept standard
 * SVG props so callers can set size/color via className.
 */
type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function IconHome(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 10.5 12 3l8.5 7.5" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function IconMic(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21M9 21h6" />
    </svg>
  );
}

export function IconFilm(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M8 4.5v15M16 4.5v15M3 9.5h5M16 9.5h5M3 14.5h5M16 14.5h5" />
    </svg>
  );
}

export function IconRadio(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
      <rect x="3.5" y="10.5" width="17" height="10" rx="2" />
      <path d="M7 10.5 17 4" />
      <path d="M8.2 14.5a3.8 3.8 0 0 1 7.6 0" />
    </svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5.5A2 2 0 0 1 6 4h4.5a2 2 0 0 1 1.5.7 2 2 0 0 1 1.5-.7H18a2 2 0 0 1 2 2V18a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 0 0-2 2 2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 18Z" />
      <path d="M12 6.7V20" />
    </svg>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4.5 17v2.5A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5V17" />
    </svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M8 5.2v13.6a.9.9 0 0 0 1.37.77l11-6.8a.9.9 0 0 0 0-1.54l-11-6.8A.9.9 0 0 0 8 5.2Z" />
    </svg>
  );
}

export function IconPause(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <rect x="6.5" y="4.5" width="4" height="15" rx="1" />
      <rect x="13.5" y="4.5" width="4" height="15" rx="1" />
    </svg>
  );
}

export function IconShuffle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 7h3.3c1.3 0 2.5.68 3.17 1.8L15 17a3.7 3.7 0 0 0 3.17 1.8H20.5" />
      <path d="M3.5 18h3.3c1.3 0 2.5-.68 3.17-1.8L13 10.5" />
      <path d="M17.5 4.5 20.5 7l-3 2.5M17.5 21.5l3-2.5-3-2.5" />
    </svg>
  );
}

export function IconRepeat(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M17 2.5 20 5.5l-3 3" />
      <path d="M20 5.5H8a4.5 4.5 0 0 0-4.5 4.5" />
      <path d="M7 21.5 4 18.5l3-3" />
      <path d="M4 18.5h12a4.5 4.5 0 0 0 4.5-4.5" />
    </svg>
  );
}

export function IconRepeatOne(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M17 2.5 20 5.5l-3 3" />
      <path d="M20 5.5H8a4.5 4.5 0 0 0-4.5 4.5" />
      <path d="M7 21.5 4 18.5l3-3" />
      <path d="M4 18.5h12a4.5 4.5 0 0 0 4.5-4.5" />
      <path d="M11.3 9.8h1v4.4" strokeWidth={1.5} />
    </svg>
  );
}

export function IconSkipBack(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M7 5.5a.9.9 0 0 0-1.5-.7v14.4a.9.9 0 0 0 1.5.7l9-7.2a.9.9 0 0 0 0-1.4Z" />
      <rect x="4.5" y="4.8" width="1.6" height="14.4" rx="0.8" />
    </svg>
  );
}

export function IconSkipForward(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M17 5.5a.9.9 0 0 1 1.5-.7v14.4a.9.9 0 0 1-1.5.7l-9-7.2a.9.9 0 0 1 0-1.4Z" />
      <rect x="17.9" y="4.8" width="1.6" height="14.4" rx="0.8" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 9 7 7 7-7" />
    </svg>
  );
}

export function IconVolume(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9.5h3.2L12 5.8v12.4l-4.8-3.7H4z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  );
}
