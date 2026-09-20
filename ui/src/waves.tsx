'use client'

import { type HTMLAttributes, useEffect, useRef } from 'react'

// == Random ==

type Random = () => number

/** mulberry32, so a seed reproduces the same still frame on every render. */
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

// == Tokens ==

/** Tokens are `R G B` triples, so a canvas paint string has to be composed. */
function rgb(triple: string, alpha = 1): string {
  return `rgb(${triple} / ${alpha})`
}

// == Wave Terms ==

/* The three wavelengths are deliberately near each other: 230/175/150 beat
   over 430-1050px, which is a fraction of a band's width, so the moire shows
   as a handful of bands rather than one slow swell nobody sees move. Their
   phase speeds (len * freq) all land near 45px/s, so every crest travels at a
   comparable rate and the field reads as one water rather than three */
const PLANE_LEN = 230
/** Wavelength down the stack, tilting the crests so the bands run diagonally */
const PLANE_TILT = 900
const PLANE_FREQ = 0.19
const PLANE_AMP = 0.55

type Source = {
  /** Orbit centre as a fraction of the band, so a resize does not move it */
  fx: number
  fy: number
  rx: number
  ry: number
  /** Orbit rate in rad/s - slow enough to be felt rather than watched */
  drift: number
  phase: number
  /** Angular wavenumber, 2pi / wavelength */
  k: number
  /** Angular frequency, 2pi * cycles per second */
  w: number
  amp: number
  /** Distance over which the source decays to 1/e, keeping it local */
  reach: number
  x: number
  y: number
}

function makeSources(rand: Random): Source[] {
  const spec = [
    { len: 175, freq: 0.26, amp: 0.3, reach: 520 },
    { len: 150, freq: 0.31, amp: 0.28, reach: 460 },
  ]
  return spec.map((s) => ({
    k: (Math.PI * 2) / s.len,
    w: Math.PI * 2 * s.freq,
    amp: s.amp,
    reach: s.reach,
    fx: 0.2 + rand() * 0.6,
    fy: 0.2 + rand() * 0.6,
    rx: 0.1 + rand() * 0.14,
    ry: 0.12 + rand() * 0.16,
    drift: 0.05 + rand() * 0.05,
    phase: rand() * Math.PI * 2,
    x: 0,
    y: 0,
  }))
}

/** Cursor wavelength, sitting under the three so its bulge reads as its own. */
const PTR_LEN = 130
const PTR_FREQ = 0.5
const PTR_AMP = 0.5
const PTR_SIGMA = 170

// == Variants ==

type WavesMask = 'none' | 'radial' | 'bottom' | 'copy'

const maskClasses: Record<WavesMask, string> = {
  none: '',
  radial: 'mask-radial',
  bottom: 'mask-bottom',
  copy: 'mask-copy',
}

/** Brightness steps a crest is quantized into, so runs batch into few strokes. */
const LEVELS = 4
const TONES = 3

type WavesProps = HTMLAttributes<HTMLDivElement> & {
  mask?: WavesMask
  /** Gap between crest lines in px - the density of the stack hangs off this */
  spacing?: number
  /** X sampling step; a crest is a polyline, not a curve solved per pixel */
  step?: number
  /** Peak displacement of a crest in px, before the cursor adds to it */
  amp?: number
  /** Share of full displacement above which a crest lights in the accent */
  accentAt?: number
  /** Extra alpha at the left edge, where a band's mask thins the field out */
  lift?: number
  speed?: number
  opacity?: number
  seed?: number
  interactive?: boolean
  colorVar?: string
  accentVar?: string
  /** A second accent, so lit crests split between two tones rather than one */
  accentAltVar?: string
}

export function Waves({
  mask = 'none',
  spacing = 12,
  step = 9,
  amp = 10,
  accentAt = 0.58,
  lift = 0,
  speed = 1,
  opacity = 1,
  seed = 11,
  interactive = true,
  colorVar = '--overlay0',
  accentVar = '--accent',
  accentAltVar,
  className = '',
  style,
  ...rest
}: WavesProps) {
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
    const t0 = performance.now()

    const rand = makeRandom(seed)
    const sources = makeSources(rand)
    /* A fixed ring of flags rather than one per line: the line count changes
       with the band height, and the tones must not reshuffle on a resize */
    const alts: boolean[] = []
    for (let i = 0; i < 64; i++) alts.push(rand() < 0.5)

    // == Colors ==

    let ink = '87 83 78'
    let hi = '141 167 209'
    let hiAlt = hi
    let colorsDirty = true

    const readColors = () => {
      const cs = getComputedStyle(el)
      ink = cs.getPropertyValue(colorVar).trim() || ink
      hi = cs.getPropertyValue(accentVar).trim() || hi
      // without a second accent the lit crests hold one tone throughout
      hiAlt = accentAltVar ? cs.getPropertyValue(accentAltVar).trim() || hi : hi
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

    /* x/y is where the cursor sits over the field, a is how hard it presses in;
       press is the extra a click lends the cursor's own source for a moment */
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0, press: 0, seen: false }

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

    const onDown = () => {
      ptr.press = 1
    }

    // == Field ==

    const planeK = (Math.PI * 2) / PLANE_LEN
    const tiltK = (Math.PI * 2) / PLANE_TILT
    const planeW = Math.PI * 2 * PLANE_FREQ
    const ptrK = (Math.PI * 2) / PTR_LEN
    const ptrW = Math.PI * 2 * PTR_FREQ
    const ptrR2 = 2 * PTR_SIGMA * PTR_SIGMA

    /* The terms never all peak at once, so normalizing by their raw sum would
       leave the field permanently dim - the divisor sits under the theoretical
       maximum and the rare true peak simply clamps */
    let norm = PLANE_AMP
    for (const s of sources) norm += s.amp
    norm *= 0.7

    /** Summed displacement at a point, in units of `amp`. */
    const disp = (x: number, y: number, t: number, pa: number) => {
      let d = PLANE_AMP * Math.sin(x * planeK + y * tiltK - t * planeW)
      for (const s of sources) {
        const dx = x - s.x
        const dy = y - s.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        d += s.amp * Math.exp(-dist / s.reach) * Math.sin(dist * s.k - t * s.w)
      }
      if (pa > 0.004) {
        const dx = x - ptr.x
        const dy = y - ptr.y
        const d2 = dx * dx + dy * dy
        const dist = Math.sqrt(d2)
        d +=
          PTR_AMP *
          pa *
          Math.exp(-d2 / ptrR2) *
          Math.sin(dist * ptrK - t * ptrW)
      }
      return d
    }

    // == Draw ==

    /* Every sample lands in one of TONES * LEVELS buckets and the run is kept
       open while the bucket holds, so a frame of dozens of lines costs a dozen
       strokes rather than one per segment */
    const paths: Path2D[] = []

    const render = (t: number, pa: number) => {
      if (colorsDirty) readColors()
      for (const s of sources) {
        s.x = (s.fx + s.rx * Math.sin(t * s.drift + s.phase)) * W
        s.y = (s.fy + s.ry * Math.cos(t * s.drift * 0.8 + s.phase)) * H
      }

      paths.length = 0
      for (let i = 0; i < TONES * LEVELS; i++) paths.push(new Path2D())

      // a zero would be an infinite stack of infinitely sampled lines
      const dx0 = Math.max(2, step)
      const gap = Math.max(3, spacing)
      const cols = Math.ceil(W / dx0)
      for (let li = 0; li * gap < H + gap; li++) {
        const y0 = li * gap
        const alt = alts[li % alts.length]
        let run = -1
        let px = 0
        let py = 0
        let pb = 0
        for (let i = 0; i <= cols; i++) {
          const x = i * dx0
          const d = disp(x, y0, t, pa)
          const y = y0 + d * amp
          const m = Math.min(1, Math.abs(d) / norm)
          const level = Math.min(LEVELS - 1, Math.floor(m * LEVELS))
          const tone = m >= accentAt ? (alt ? 2 : 1) : 0
          const b = tone * LEVELS + level
          if (i > 0) {
            // the brighter endpoint owns the segment, so a lit run keeps its
            // colour right up to where it dims rather than ending a sample early
            const sb = b > pb ? b : pb
            if (sb !== run) {
              paths[sb].moveTo(px, py)
              run = sb
            }
            paths[sb].lineTo(x, y)
          }
          px = x
          py = y
          pb = b
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      for (let tone = 0; tone < TONES; tone++) {
        const accent = tone > 0
        const triple = tone === 0 ? ink : tone === 1 ? hi : hiAlt
        for (let l = 0; l < LEVELS; l++) {
          const m = (l + 0.5) / LEVELS
          const alpha = accent ? 0.34 + m * 0.5 : 0.08 + m * 0.34
          ctx.lineWidth = accent ? 1 + m * 0.7 : 0.75 + m * 0.45
          if (lift > 0) {
            // alpha is per bucket, not per sample, so the left-edge boost has
            // to ride the paint itself rather than a per-crest multiplier
            const g = ctx.createLinearGradient(0, 0, W, 0)
            g.addColorStop(0, rgb(triple, Math.min(1, alpha * (1 + lift))))
            g.addColorStop(1, rgb(triple, alpha))
            ctx.strokeStyle = g
          } else {
            ctx.strokeStyle = rgb(triple, alpha)
          }
          ctx.stroke(paths[tone * LEVELS + l])
        }
      }
    }

    const draw = (now: number) => {
      ptr.x += (ptr.tx - ptr.x) * 0.16
      ptr.y += (ptr.ty - ptr.y) * 0.16
      ptr.a += (ptr.ta - ptr.a) * 0.08
      ptr.press += (0 - ptr.press) * 0.04
      render(((now - t0) / 1000) * speed, ptr.a * (1 + ptr.press * 1.6))
    }

    /** One frame at a fixed instant, past the point where the sources overlap. */
    const still = () => {
      ptr.a = 0
      ptr.ta = 0
      ptr.press = 0
      ptr.seen = false
      render(6.5, 0)
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      // ~30fps - the crests travel slowly enough that a full-rate repaint buys
      // nothing, and a stack this dense is the most expensive of the fields
      if (!visible || now - last < 32) return
      // the water never rests, so only a field held still can skip a frame
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
      host.addEventListener('pointerdown', onDown, { passive: true })
      listening = true
    }

    const detach = () => {
      if (!listening) return
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      listening = false
    }

    const applyMotion = () => {
      if (reduce) {
        cancelAnimationFrame(raf)
        raf = 0
        detach()
        still()
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
    applyMotion()
    if (!reduce) draw(performance.now())
    mql.addEventListener('change', onMotionChange)

    const ro = new ResizeObserver(() => {
      size()
      if (reduce) still()
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
      if (reduce) still()
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
    spacing,
    step,
    amp,
    accentAt,
    lift,
    speed,
    seed,
    interactive,
    colorVar,
    accentVar,
    accentAltVar,
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
