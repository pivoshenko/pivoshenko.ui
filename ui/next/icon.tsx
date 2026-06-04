import { ImageResponse } from 'next/og'
import { palette } from '../palette'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
export const runtime = 'edge' as const

const JETBRAINS_MONO_URL =
  'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf'

export default async function Icon() {
  const font = await fetch(new URL(JETBRAINS_MONO_URL)).then((res) =>
    res.arrayBuffer(),
  )
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: palette.fg.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: palette.bg.canvas,
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: '-0.5px',
        lineHeight: 1,
        fontFamily: 'JetBrains Mono',
        borderRadius: 4,
      }}
    >
      VP
    </div>,
    {
      ...size,
      fonts: [{ name: 'JetBrains Mono', data: font, weight: 700 }],
    },
  )
}
