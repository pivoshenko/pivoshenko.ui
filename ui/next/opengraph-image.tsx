import { ImageResponse } from 'next/og'
import type { ReactElement } from 'react'
import { palette } from '../palette'

export type OgImageProps = {
  brand: string
  title: string
  subtitle: string
  domain: string
}

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'
export const ogRuntime = 'edge' as const

const JETBRAINS_MONO_URL =
  'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf'

function OgCard({
  brand,
  title,
  subtitle,
  domain,
}: OgImageProps): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: palette.bg.canvas,
        color: palette.fg.default,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        fontFamily: 'JetBrains Mono',
      }}
    >
      <div style={{ display: 'flex', fontSize: 28, color: palette.fg.subtle }}>
        {brand}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: '-2px',
            color: palette.accent.primary,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 36,
            color: palette.fg.muted,
            lineHeight: 1.3,
            maxWidth: 980,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: 24, color: palette.fg.subtle }}>
        <span>{domain}</span>
      </div>
    </div>
  )
}

export function createOgImage(props: OgImageProps) {
  return async function handler() {
    const font = await fetch(new URL(JETBRAINS_MONO_URL)).then((res) =>
      res.arrayBuffer(),
    )
    return new ImageResponse(<OgCard {...props} />, {
      ...ogSize,
      fonts: [
        { name: 'JetBrains Mono', data: font, weight: 700 },
        { name: 'JetBrains Mono', data: font, weight: 400 },
      ],
    })
  }
}
