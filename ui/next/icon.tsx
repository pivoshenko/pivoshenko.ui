import { ImageResponse } from 'next/og'
import { type AccentName, palette } from '../palette'
import { loadJetBrainsMono } from './fonts'

// rendered at 64 and downsampled by the browser: at 32 the glyphs lose
// their weight to rounding
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default async function Icon({
  accent = 'peach',
}: { accent?: AccentName } = {}) {
  // 800 rather than 700 to match the Logo component's font-extrabold
  const font = await loadJetBrainsMono(800)
  return new ImageResponse(
    <div
      style={{
        width: 64,
        height: 64,
        background: palette.fg.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: palette.bg.canvas,
        fontSize: 32,
        fontWeight: 800,
        letterSpacing: '-1.3px',
        lineHeight: 1,
        fontFamily: 'JetBrains Mono',
        borderRadius: 12,
        // the slice below runs to the hard corner at 64,64; without this it
        // paints over the radius and squares off the bottom-right corner
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      VP
      {/* a corner slice rather than the Logo component's floating chip: at
          favicon size a detached dot reads as a rendering artefact, and the
          slice keeps its shape down to 16px */}
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: rasterised to a PNG by
          Satori, so there is no SVG left in a document to title - and a title
          element renders as visible text in the image */}
      <svg
        width={64}
        height={64}
        viewBox="0 0 64 64"
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <path d="M64 38 L64 64 L38 64 Z" fill={palette.named[accent]} />
      </svg>
    </div>,
    {
      ...size,
      fonts: [{ name: 'JetBrains Mono', data: font, weight: 800 }],
    },
  )
}
