import type { AccentName } from '../palette'
import { Chunks } from './chunks'
import { Contours } from './contours'
import { Pixels } from './pixels'

/** Which decorative field a band paints behind its content, site-wide */
export type FieldKind = 'chunks' | 'contours' | 'pixels'

type FieldProps = {
  kind: FieldKind
  mask: 'radial' | 'bottom'
  /** Palette slot the lit cells take; defaults to the site accent */
  tint?: AccentName
  interactive?: boolean
}

// One tuning for both bands, so a hero and the footer under it read as the
// same surface rather than two fields that happen to share a palette
export function Field({ kind, mask, tint, interactive = true }: FieldProps) {
  const accentVar = tint ? `--${tint}` : undefined

  // a hero's copy sits at the left, and an opaque field under it costs more
  // legibility than a contour line does, so the pixel and chunk fields thin out
  // behind it. The footer band is a closing note rather than an opening one, so
  // its field runs quieter than the hero's
  const footer = mask === 'radial'

  if (kind === 'chunks') {
    return (
      <Chunks
        mask={mask === 'bottom' ? 'copy' : mask}
        accentVar={accentVar}
        min={footer ? 22 : 30}
        gap={footer ? 3 : 4}
        levels={5}
        speed={footer ? 0.5 : 0.85}
        bloom={footer ? 0.14 : 0.2}
        rise={0.55}
        accentAt={0.7}
        accentLean={footer ? 0 : 0.1}
        lift={footer ? 0 : 0.6}
        opacity={footer ? 0.2 : 0.42}
        seed={7}
        interactive={interactive}
      />
    )
  }

  if (kind === 'pixels') {
    return (
      <Pixels
        mask={mask === 'bottom' ? 'copy' : mask}
        accentVar={accentVar}
        cell={footer ? 12 : 16}
        gap={footer ? 2 : 3}
        levels={5}
        speed={footer ? 0.35 : 0.6}
        accentAt={0.72}
        accentLean={footer ? 0 : 0.1}
        lift={footer ? 0 : 0.6}
        opacity={footer ? 0.22 : 0.5}
        seed={7}
        interactive={interactive}
      />
    )
  }

  return (
    <Contours
      mask={mask}
      accentVar={accentVar}
      levels={10}
      cell={16}
      speed={0.5}
      opacity={0.55}
      seed={7}
      interactive={interactive}
    />
  )
}
