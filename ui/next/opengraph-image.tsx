import { ImageResponse } from 'next/og'
import type { ReactElement } from 'react'
import { type AccentName, palette } from '../palette'

export type OgImageProps = {
  brand: string
  title: string
  subtitle: string
  domain: string
  /** Match the site's own data-accent, or the card drifts from the live page */
  accent?: AccentName
}

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

// static instances, not the variable file: Satori renders a variable font at
// one weight, so a 700 declaration against it silently rendered regular
const JETBRAINS_MONO_URL =
  'https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPQ.ttf'
const JETBRAINS_MONO_BOLD_URL =
  'https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8L6tjPQ.ttf'

function OgCard({
  brand,
  title,
  subtitle,
  domain,
  accent = 'peach',
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
            color: palette.named[accent],
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
    const [regular, bold] = await Promise.all(
      [JETBRAINS_MONO_URL, JETBRAINS_MONO_BOLD_URL].map((url) =>
        fetch(new URL(url)).then((res) => res.arrayBuffer()),
      ),
    )
    return new ImageResponse(<OgCard {...props} />, {
      ...ogSize,
      fonts: [
        { name: 'JetBrains Mono', data: bold, weight: 700 },
        { name: 'JetBrains Mono', data: regular, weight: 400 },
      ],
    })
  }
}
