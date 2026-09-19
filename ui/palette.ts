// Active palette in raw hex. The source of truth is `ui/tokens.css` (CSS
// variables consumed by the Tailwind preset); this module mirrors those values
// for contexts CSS variables don't reach, such as edge-runtime OG images
// (rendered to PNG via @vercel/og) and the Next `themeColor` meta tag.
//
// Generated alongside `ui/tokens.css` by `just vendor-theme-preset`. Hand
// edits are erased by the next vendor run.
export const palette = {
  bg: {
    canvas: '#1f1f1e',
    surface: '#292928',
    raised: '#323231',
    sunken: '#1a1a19',
    overlay: '#57534e',
  },
  fg: {
    default: '#e4e2de',
    muted: '#b8b3a8',
    subtle: '#9b958a',
    faint: '#78716c',
  },
  border: {
    default: '#323231',
    subtle: '#292928',
    strong: '#3d3d3c',
  },
  accent: {
    primary: '#8da7d1',
    secondary: '#b8b9d7',
    success: '#91ab78',
    warning: '#d4aa5c',
    danger: '#ec7470',
    info: '#5ba7c5',
  },

  // The named slots behind the roles, for picking a site accent
  named: {
    rosewater: '#ddc7c2',
    flamingo: '#e38191',
    pink: '#ce9db9',
    mauve: '#ad8cc0',
    red: '#ec7470',
    maroon: '#d99d8f',
    peach: '#e48d66',
    yellow: '#d4aa5c',
    green: '#91ab78',
    teal: '#70b2a5',
    sky: '#6cb7c0',
    sapphire: '#5ba7c5',
    blue: '#8da7d1',
    lavender: '#b8b9d7',
    text: '#e4e2de',
    subtext1: '#b8b3a8',
    subtext0: '#9b958a',
    overlay2: '#a8a29e',
    overlay1: '#78716c',
    overlay0: '#57534e',
    surface2: '#3d3d3c',
    surface1: '#323231',
    surface0: '#292928',
    base: '#1f1f1e',
    mantle: '#1a1a19',
    crust: '#151514',
  },
} as const

export type AccentName = keyof typeof palette.named
