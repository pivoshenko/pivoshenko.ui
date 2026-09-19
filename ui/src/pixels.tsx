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

type PixelsVariant = 'mosaic' | 'scan' | 'sparse'
type PixelsMask = 'none' | 'radial' | 'bottom' | 'copy'

const maskClasses: Record<PixelsMask, string> = {
  none: '',
  radial: 'mask-radial',
  bottom: 'mask-bottom',
  copy: 'mask-copy',
}

type PixelsProps = HTMLAttributes<HTMLDivElement> & {
  variant?: PixelsVariant
  mask?: PixelsMask
  /** Edge of one pixel, in CSS px - the whole look hangs off this */
  cell?: number
  /** Gutter inside the cell, so the grid reads as pixels rather than a wash */
  gap?: number
  /** Brightness steps the field is quantized into; fewer reads more 8-bit */
  levels?: number
  speed?: number
  opacity?: number
  /** Field value above which a pixel takes the accent instead of the ink */
  accentAt?: number
  seed?: number
  interactive?: boolean
  scale?: number
  bump?: number
  reach?: number
  colorVar?: string
  accentVar?: string
}

export function Pixels({
  variant = 'mosaic',
  mask = 'none',
  cell = 14,
  gap = 2,
  levels = 6,
  speed = 1,
  opacity = 1,
  accentAt = 0.72,
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
}: PixelsProps) {
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

    // == Colors ==

    let ink = '87 83 78'
    let hi = '141 167 209'
    let colorsDirty = true

    const readColors = () => {
      const cs = getComputedStyle(el)
      ink = cs.getPropertyValue(colorVar).trim() || ink
      hi = cs.getPropertyValue(accentVar).trim() || hi
      colorsDirty = false
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

    /* Quantizing before anything is painted is what makes this read as pixel
       art rather than a blurred gradient - the steps have to be visible */
    const quantize = (v: number) => Math.round(v * levels) / levels

    const draw = (now: number) => {
      if (!ctx) return
      if (colorsDirty) readColors()
      const z = reduce ? 0 : ((now - t0) / 1000) * 0.06 * speed
      const drift = reduce ? 0 : ((now - t0) / 1000) * 2 * speed
      const cols = Math.ceil(W / cell)
      const rows = Math.ceil(H / cell)
      const live = ptr.a > 0.004
      const R2 = 2 * reach * reach
      const side = Math.max(1, cell - gap)
      ptr.x += (ptr.tx - ptr.x) * 0.16
      ptr.y += (ptr.ty - ptr.y) * 0.16
      ptr.a += (ptr.ta - ptr.a) * 0.08

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = (x + drift / cell) * scale * cell * 0.5
          const ny = y * scale * cell * 0.5
          let v =
            noise(nx, ny, z) * 0.65 +
            noise(nx * 2.1 + 5, ny * 2.1 + 9, z * 1.3) * 0.35

          if (live) {
            const dx = x * cell + cell / 2 - ptr.x
            const dy = y * cell + cell / 2 - ptr.y
            v += ptr.a * bump * Math.exp(-(dx * dx + dy * dy) / R2)
          }

          // a scanline dims every other row; sparse drops the quiet cells
          if (variant === 'scan' && y % 2 === 1) v *= 0.55
          const q = quantize(Math.min(1, Math.max(0, v)))
          if (q <= 0) continue
          if (variant === 'sparse' && q < 0.5) continue

          const accent = q >= accentAt
          ctx.fillStyle = rgb(
            accent ? hi : ink,
            accent ? 0.5 + q * 0.4 : q * 0.5,
          )
          ctx.fillRect(x * cell, y * cell, side, side)
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
       so the token read cannot be cached once and kept forever */
    const mo = new MutationObserver(() => {
      colorsDirty = true
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
    cell,
    gap,
    levels,
    speed,
    accentAt,
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
