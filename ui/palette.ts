// Active palette in raw hex. The source of truth is `ui/tokens.css` (CSS
// variables consumed by the Tailwind preset); this module mirrors those values
// for contexts CSS variables don't reach, such as edge-runtime OG images
// (rendered to PNG via @vercel/og) and the Next `themeColor` meta tag.
//
// Regenerate alongside `ui/tokens.css` via `just vendor-preset`. The two files
// are paired: swap the vendored flavor and both must move together, or off-DOM
// rendering drifts from the in-DOM look
export const palette = {
  bg: {
    canvas: '#1f1f1e',
    surface: '#262625',
    raised: '#2e2e2c',
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
    subtle: '#262625',
    default: '#2e2e2c',
    strong: '#373634',
  },
  accent: {
    primary: '#d97757',
    secondary: '#d4a85a',
    success: '#8a9d68',
    warning: '#d4a85a',
    danger: '#c87a72',
    info: '#7ba0c4',
  },
} as const
