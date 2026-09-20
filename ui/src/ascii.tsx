'use client'

import { type HTMLAttributes, useEffect, useRef } from 'react'

// == Noise ==

type Noise3D = (x: number, y: number, z: number) => number

/** 3D value noise with a deterministic permutation table, seeded by `seed`. */
function makeNoise(seed: number): Noise3D {
  const p = new Uint8Array(512)
  const perm: number[] = []
  let s = seed | 0 || 7
  for (let i = 0; i < 256; i++) perm[i] = i
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    const t = perm[i]
    perm[i] = perm[j]
    perm[j] = t
  }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255]

  const hash = (x: number, y: number, z: number) =>
    p[(p[(p[x & 255] + y) & 255] + z) & 255] / 255
  const fade = (t: number) => t * t * (3 - 2 * t)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  return (x, y, z) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const zi = Math.floor(z)
    const xf = fade(x - xi)
    const yf = fade(y - yi)
    const zf = fade(z - zi)
    const a = lerp(
      lerp(hash(xi, yi, zi), hash(xi + 1, yi, zi), xf),
      lerp(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), xf),
      yf,
    )
    const b = lerp(
      lerp(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), xf),
      lerp(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), xf),
      yf,
    )
    return lerp(a, b, zf)
  }
}

// == Tokens ==

/** Tokens are `R G B` triples, so a canvas paint string has to be composed. */
function rgb(triple: string, alpha = 1): string {
  return `rgb(${triple} / ${alpha})`
}

// == Variants ==

type AsciiVariant = 'mosaic' | 'scan'
type AsciiMask = 'none' | 'radial' | 'bottom' | 'copy'

const maskClasses: Record<AsciiMask, string> = {
  none: '',
  radial: 'mask-radial',
  bottom: 'mask-bottom',
  copy: 'mask-copy',
}

/* Sparse punctuation through to solid marks, so the field value reads straight
   off the glyph. The leading blank is the empty level and is never painted */
const DENSITY_RAMP = ' .:-=+*#%@'

/* A monospace advance is around 0.6em, so a glyph sized this much larger than
   the column pitch fills its cell horizontally without colliding */
const GLYPH_SCALE = 1.6

const FALLBACK_FAMILY = 'ui-monospace, monospace'

type AsciiProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AsciiVariant
  mask?: AsciiMask
  /** Glyphs from sparsest to densest; the field value indexes into this */
  ramp?: string
  /** Column pitch in CSS px - the whole look hangs off this */
  cell?: number
  /** Row pitch as a multiple of `cell`, since a glyph box is taller than it is
      wide; a single `cell` for both axes would crowd the rows together */
  rowRatio?: number
  /** Brightness steps the field is quantized into before it hits the ramp */
  levels?: number
  speed?: number
  opacity?: number
  /** Field value above which a glyph takes the accent instead of the ink */
  accentAt?: number
  /** How much easier a glyph reaches the accent at the right edge than the
      left, so a band can be lit where its copy is not */
  accentLean?: number
  /** Extra alpha at the left edge, where a band's mask thins the field out */
  lift?: number
  seed?: number
  interactive?: boolean
  scale?: number
  bump?: number
  reach?: number
  colorVar?: string
  accentVar?: string
}

export function Ascii({
  variant = 'mosaic',
  mask = 'none',
  ramp = DENSITY_RAMP,
  cell = 10,
  rowRatio = 1.8,
  levels = 9,
  speed = 1,
  opacity = 1,
  accentAt = 0.72,
  accentLean = 0,
  lift = 0,
  seed = 11,
  interactive = true,
  scale = 0.07,
  bump = 0.3,
  reach = 180,
  colorVar = '--overlay0',
  accentVar = '--accent',
  className = '',
  style,
  ...rest
}: AsciiProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = wrap.current
    const cv = canvas.current
    if (!el || !cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const noise = makeNoise(seed)
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduce = mql.matches
    let raf = 0
    let last = 0
    let visible = true
    let W = 0
    let H = 0
    let dpr = 1
    const t0 = performance.now()

    const row = Math.max(1, cell * rowRatio)
    const fontPx = Math.max(1, cell * GLYPH_SCALE)
    const top = Math.max(1, ramp.length - 1)

    // == Colors ==

    let ink = '87 83 78'
    let hi = '141 167 209'
    /* the mono face arrives as --font-jetbrains-mono, which only SiteLayout
       populates, so the resolved family has to come off the host rather than
       being named here */
    let family = FALLBACK_FAMILY
    let styleDirty = true

    const readStyle = () => {
      const cs = getComputedStyle(el)
      ink = cs.getPropertyValue(colorVar).trim() || ink
      hi = cs.getPropertyValue(accentVar).trim() || hi
      family = cs.fontFamily.trim() || FALLBACK_FAMILY
      styleDirty = false
    }

    const size = () => {
      const r = el.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = Math.max(1, r.width)
      H = Math.max(1, r.height)
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
    }

    // == Pointer ==

    /* x/y is where the cursor sits over the field, a is how hard it presses in */
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0, seen: false }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ptr.tx = e.clientX - r.left
      ptr.ty = e.clientY - r.top
      ptr.ta = 1
      if (!ptr.seen) {
        ptr.x = ptr.tx
        ptr.y = ptr.ty
        ptr.seen = true
      }
    }

    const onLeave = () => {
      ptr.ta = 0
    }

    // == Draw ==

    /* Quantizing before anything is painted is what makes this read as ASCII art
       rather than a blurred gradient - the steps have to land on whole glyphs */
    const quantize = (v: number) => Math.round(v * levels) / levels

    const draw = (now: number) => {
      if (!ctx) return
      if (styleDirty) readStyle()
      const z = reduce ? 0 : ((now - t0) / 1000) * 0.06 * speed
      const drift = reduce ? 0 : ((now - t0) / 1000) * 2 * speed
      const cols = Math.ceil(W / cell)
      const rows = Math.ceil(H / row)
      const live = ptr.a > 0.004
      const R2 = 2 * reach * reach
      ptr.x += (ptr.tx - ptr.x) * 0.16
      ptr.y += (ptr.ty - ptr.y) * 0.16
      ptr.a += (ptr.ta - ptr.a) * 0.08

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      /* set once per frame rather than per glyph - assigning ctx.font reparses
         the shorthand and costs more than the fill itself */
      ctx.font = `${fontPx}px ${family}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          /* the y step uses the row pitch, so a taller character cell does not
             stretch the noise field along with it */
          const nx = (x + drift / cell) * scale * cell * 0.5
          const ny = y * scale * row * 0.5
          let v =
            noise(nx, ny, z) * 0.65 +
            noise(nx * 2.1 + 5, ny * 2.1 + 9, z * 1.3) * 0.35

          if (live) {
            const dx = x * cell + cell / 2 - ptr.x
            const dy = y * row + row / 2 - ptr.y
            v += ptr.a * bump * Math.exp(-(dx * dx + dy * dy) / R2)
          }

          // a scanline dims every other row, the way a glyph display flickers
          if (variant === 'scan' && y % 2 === 1) v *= 0.55
          const q = quantize(Math.min(1, Math.max(0, v)))
          const glyph = ramp[Math.round(q * top)]
          // the blank slot is the empty level, so it costs a fillText for nothing
          if (!glyph || glyph === ' ') continue

          const lean = x / Math.max(1, cols - 1)
          const accent = q >= accentAt - accentLean * lean
          // a floor under the quiet glyphs, so the field reads as a full grid
          // rather than a scatter of bright ones over empty ground
          const alpha = accent ? 0.5 + q * 0.4 : 0.14 + q * 0.55
          ctx.fillStyle = rgb(
            accent ? hi : ink,
            Math.min(1, alpha * (1 + lift * (1 - lean))),
          )
          ctx.fillText(glyph, x * cell + cell / 2, y * row + row / 2)
        }
      }
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      // ~24fps is plenty for a slow drift
      if (!visible || now - last < 42) return
      // a still field with nobody touching it needs no repaint
      if (speed === 0 && ptr.a < 0.004 && ptr.ta < 0.004) return
      last = now
      draw(now)
    }

    // == Wiring ==

    const host = el.parentElement || el
    let listening = false

    const attach = () => {
      if (listening || !interactive) return
      host.addEventListener('pointermove', onMove, { passive: true })
      host.addEventListener('pointerleave', onLeave, { passive: true })
      listening = true
    }

    const detach = () => {
      if (!listening) return
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      listening = false
    }

    const applyMotion = () => {
      if (reduce) {
        cancelAnimationFrame(raf)
        raf = 0
        detach()
        ptr.a = 0
        ptr.ta = 0
        ptr.seen = false
        draw(performance.now())
        return
      }
      attach()
      if (!raf) raf = requestAnimationFrame(loop)
    }

    const onMotionChange = (e: MediaQueryListEvent) => {
      reduce = e.matches
      applyMotion()
    }

    size()
    draw(performance.now())
    applyMotion()
    mql.addEventListener('change', onMotionChange)

    const ro = new ResizeObserver(() => {
      size()
      draw(performance.now())
    })
    ro.observe(el)

    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting
          })
        : null
    if (io) io.observe(el)

    /* the field re-tints when a theme or a data-accent subtree changes under it,
       and a late web font swaps the family out from under the grid, so the
       computed read cannot be cached once and kept forever */
    const mo = new MutationObserver(() => {
      styleDirty = true
      if (reduce) draw(performance.now())
    })
    mo.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'style', 'data-theme', 'data-accent'],
    })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      if (io) io.disconnect()
      mo.disconnect()
      mql.removeEventListener('change', onMotionChange)
      detach()
    }
  }, [
    variant,
    ramp,
    cell,
    rowRatio,
    levels,
    speed,
    accentAt,
    accentLean,
    lift,
    seed,
    interactive,
    scale,
    bump,
    reach,
    colorVar,
    accentVar,
  ])

  return (
    <div
      {...rest}
      ref={wrap}
      aria-hidden="true"
      style={{ opacity, ...style }}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${maskClasses[mask]} ${className}`}
    >
      <canvas ref={canvas} className="absolute inset-0 block w-full h-full" />
    </div>
  )
}
