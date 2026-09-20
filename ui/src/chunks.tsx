'use client'

import { type HTMLAttributes, useEffect, useRef } from 'react'

// == Random ==

type Random = () => number

/** mulberry32, so a seed reproduces the same subdivision on every render. */
function makeRandom(seed: number): Random {
  let s = (seed | 0 || 7) >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// == Carving ==

type Chunk = {
  x: number
  y: number
  w: number
  h: number
  /** Resting tone, before the bloom cycle and the cursor add to it */
  base: number
  phase: number
  rate: number
}

/* A recursive split of the band into rectangles: the longer side halves at a
   seeded ratio until a piece cannot halve again without going under `min`.
   Past a couple of levels a roll leaves some pieces whole, which is what mixes
   big slabs in among the small ones instead of settling to one uniform grain */
function carve(W: number, H: number, min: number, rand: Random): Chunk[] {
  const out: Chunk[] = []

  const keep = (x: number, y: number, w: number, h: number) => {
    // a large slab holds a quiet tone: at full brightness it reads as a panel
    // laid over the page rather than as part of the field
    const scale = Math.min(1, (min * 3) / Math.max(w, h))
    out.push({
      x,
      y,
      w,
      h,
      base: rand() ** 2 * 0.82 * (0.4 + 0.6 * scale),
      phase: rand() * Math.PI * 2,
      rate: 0.5 + rand(),
    })
  }

  const split = (x: number, y: number, w: number, h: number, depth: number) => {
    const canX = w >= min * 2
    const canY = h >= min * 2
    const big = w > min * 5 || h > min * 5
    if (
      (!canX && !canY) ||
      depth > 12 ||
      (!big && depth >= 2 && rand() < 0.35)
    ) {
      keep(x, y, w, h)
      return
    }

    // the longer side, so a chunk stays nearer square than sliver
    const vertical = canX && (!canY || w > h)
    const span = vertical ? w : h
    // the preferred range, clamped into what leaves both halves above `min`
    const lo = Math.max(0.3, min / span)
    const hi = Math.min(0.7, 1 - min / span)
    const t = hi > lo ? lo + rand() * (hi - lo) : 0.5
    const cut = Math.round(span * t)

    if (vertical) {
      split(x, y, cut, h, depth + 1)
      split(x + cut, y, w - cut, h, depth + 1)
    } else {
      split(x, y, w, cut, depth + 1)
      split(x, y + cut, w, h - cut, depth + 1)
    }
  }

  split(0, 0, W, H, 0)
  return out
}

// == Tokens ==

/** Tokens are `R G B` triples, so a canvas paint string has to be composed. */
function rgb(triple: string, alpha = 1): string {
  return `rgb(${triple} / ${alpha})`
}

// == Variants ==

type ChunksMask = 'none' | 'radial' | 'bottom' | 'copy'

const maskClasses: Record<ChunksMask, string> = {
  none: '',
  radial: 'mask-radial',
  bottom: 'mask-bottom',
  copy: 'mask-copy',
}

type ChunksProps = HTMLAttributes<HTMLDivElement> & {
  mask?: ChunksMask
  /** Smallest chunk edge, in CSS px - the whole look hangs off this */
  min?: number
  /** Mortar between chunks, so the field reads as slabs rather than a wash */
  gap?: number
  /** Brightness steps the field is quantized into; fewer reads more blocky */
  levels?: number
  speed?: number
  opacity?: number
  /** Share of its cycle a chunk spends lit; the rest of the time it rests */
  bloom?: number
  /** How far a bloom carries a chunk above its resting tone */
  rise?: number
  /** Field value above which a chunk takes the accent instead of the ink */
  accentAt?: number
  /** How much easier a chunk reaches the accent at the right edge than the
      left, so a band can be lit where its copy is not */
  accentLean?: number
  /** Extra alpha at the left edge, where a band's mask thins the field out */
  lift?: number
  seed?: number
  interactive?: boolean
  bump?: number
  reach?: number
  colorVar?: string
  accentVar?: string
}

export function Chunks({
  mask = 'none',
  min = 28,
  gap = 4,
  levels = 5,
  speed = 1,
  opacity = 1,
  bloom = 0.18,
  rise = 0.55,
  accentAt = 0.7,
  accentLean = 0,
  lift = 0,
  seed = 11,
  interactive = true,
  bump = 0.34,
  reach = 200,
  colorVar = '--overlay0',
  accentVar = '--accent',
  className = '',
  style,
  ...rest
}: ChunksProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = wrap.current
    const cv = canvas.current
    if (!el || !cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduce = mql.matches
    let raf = 0
    let last = 0
    let visible = true
    let W = 0
    let H = 0
    let dpr = 1
    let chunks: Chunk[] = []
    let carvedW = 0
    let carvedH = 0
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
      // the subdivision is of this rect, so a resize re-carves rather than
      // stretching slabs measured against the old one. Whole pixels only:
      // a scrollbar appearing is a sub-pixel change, and re-carving on one
      // reshuffles the whole field for no visible reason
      const w = Math.round(W)
      const h = Math.round(H)
      if (w === carvedW && h === carvedH) return
      carvedW = w
      carvedH = h
      chunks = carve(W, H, Math.max(4, min), makeRandom(seed))
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

    /* Quantizing before anything is painted is what keeps the slabs flat -
       a chunk mid-bloom has to step, not slide, or the field reads as a
       gradient wash with rectangles drawn over it */
    const quantize = (v: number) => Math.round(v * levels) / levels

    // sin spends most of its arc below the gate, so at any moment only a few
    // chunks are climbing out of rest - that is the whole "semi" in the motion
    const gate = 1 - Math.min(0.9, Math.max(0.02, bloom))

    const draw = (now: number) => {
      if (!ctx) return
      if (colorsDirty) readColors()
      const t = reduce ? 0 : ((now - t0) / 1000) * 0.35 * speed
      const live = ptr.a > 0.004
      const R2 = 2 * reach * reach
      ptr.x += (ptr.tx - ptr.x) * 0.16
      ptr.y += (ptr.ty - ptr.y) * 0.16
      ptr.a += (ptr.ta - ptr.a) * 0.08

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      for (const c of chunks) {
        const cx = c.x + c.w / 2
        const cy = c.y + c.h / 2
        const s = Math.sin(t * c.rate + c.phase)
        let v = c.base + (s > gate ? ((s - gate) / (1 - gate)) * rise : 0)

        if (live) {
          const dx = cx - ptr.x
          const dy = cy - ptr.y
          v += ptr.a * bump * Math.exp(-(dx * dx + dy * dy) / R2)
        }

        const q = quantize(Math.min(1, Math.max(0, v)))
        if (q <= 0) continue

        const lean = cx / W
        const accent = q >= accentAt - accentLean * lean
        // a floor under the quiet chunks, so the field reads as a full mosaic
        // rather than a scatter of bright slabs over empty ground
        const alpha = accent ? 0.5 + q * 0.4 : 0.14 + q * 0.55
        ctx.fillStyle = rgb(
          accent ? hi : ink,
          Math.min(1, alpha * (1 + lift * (1 - lean))),
        )
        ctx.fillRect(
          c.x + gap / 2,
          c.y + gap / 2,
          Math.max(1, c.w - gap),
          Math.max(1, c.h - gap),
        )
      }
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      // ~24fps is plenty for a cross-fade this slow
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
    min,
    gap,
    levels,
    speed,
    bloom,
    rise,
    accentAt,
    accentLean,
    lift,
    seed,
    interactive,
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
