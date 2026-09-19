import type { AccentName } from '../palette'
import { Contours } from './contours'
import { Pixels } from './pixels'

/** Which decorative field a band paints behind its content, site-wide */
export type FieldKind = 'contours' | 'pixels'

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

  if (kind === 'pixels') {
    return (
      <Pixels
        mask={mask}
        accentVar={accentVar}
        cell={16}
        gap={3}
        levels={5}
        speed={0.6}
        opacity={0.5}
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
