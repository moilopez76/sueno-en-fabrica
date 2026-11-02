"use client";

import type { Icon as PhosphorIcon, IconProps as PhosphorIconProps, IconWeight } from "@phosphor-icons/react";

/**
 * Single wrapper around @phosphor-icons/react so every icon in the app shares
 * the same stroke weight rules and size presets, Spotify-style:
 * - "nav": sidebar / tab bar items, 24px
 * - "player": inline transport controls, 20-24px
 * - "playerLarge": the big circular play/pause button, 26-28px
 * - "card": card/button-sized icons (play buttons, downloads...), 20px
 * - "inline": small inline icons (volume glyph, chevrons...), 18px
 *
 * `active` switches the icon to `weight="fill"` to mirror Spotify's
 * inactive/active nav and control treatment; pass an explicit `weight` to
 * override when a control needs a different rule (e.g. shuffle/repeat use
 * colour, not fill, to indicate the active state).
 */
export type IconSizeContext = "nav" | "player" | "playerLarge" | "card" | "inline";

const SIZE_MAP: Record<IconSizeContext, number> = {
  nav: 24,
  player: 22,
  playerLarge: 28,
  card: 20,
  inline: 18,
};

export interface IconProps extends Omit<PhosphorIconProps, "size" | "weight"> {
  icon: PhosphorIcon;
  context?: IconSizeContext;
  size?: number;
  weight?: IconWeight;
  active?: boolean;
}

export function Icon({ icon: IconComponent, context = "inline", size, weight, active, ...rest }: IconProps) {
  const resolvedSize = size ?? SIZE_MAP[context];
  const resolvedWeight: IconWeight = weight ?? (active ? "fill" : "regular");
  return <IconComponent size={resolvedSize} weight={resolvedWeight} {...rest} />;
}
