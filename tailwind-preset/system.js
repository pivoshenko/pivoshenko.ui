const preset = require('./preset.js')

/**
 * Design-system layer on top of the generated role-colour preset.
 *
 * `preset.js` is vendored from pivoshenko.theme and only ever carries colours.
 * Everything a component needs beyond colour - the named palette, the live
 * `--accent` indirection, radii, shadows, motion and the display face - is
 * declared here by hand, against the CSS variables `ui/tokens.css` defines.
 * Flavor-agnostic: swapping the vendored palette changes no line in this file.
 */
const withAlpha = (token) => `rgb(var(--${token}) / <alpha-value>)`

const REST =
  'inset 0 1px 0 rgb(255 255 255 / 0.04), 0 1px 2px rgb(0 0 0 / 0.45), 0 10px 24px -18px rgb(0 0 0 / 0.8)'
const LIFT = '0 12px 32px -12px rgb(0 0 0 / 0.6)'
const FLOAT = '0 24px 64px -16px rgb(0 0 0 / 0.7)'

const named = (...names) =>
  Object.fromEntries(names.map((name) => [name, withAlpha(name)]))

module.exports = {
  ...preset,
  theme: {
    ...preset.theme,
    extend: {
      ...preset.theme.extend,
      colors: {
        ...preset.theme.extend.colors,

        // The 14 chromatic slots, for the places a role token cannot name:
        // terminal chrome, per-status tints, accent swatches
        ...named(
          'rosewater',
          'flamingo',
          'pink',
          'mauve',
          'red',
          'maroon',
          'peach',
          'yellow',
          'green',
          'teal',
          'sky',
          'sapphire',
          'blue',
          'lavender',
        ),

        // Neutrals the role layer leaves unnamed
        ...named('crust', 'overlay1', 'overlay2'),

        // Readable text on an accent fill
        'on-accent': withAlpha('on-accent'),

        // Already translucent, so no <alpha-value> to compose
        scrim: 'var(--scrim)',

        accent: {
          ...preset.theme.extend.colors.accent,
          // DEFAULT follows data-accent, the other tones stay pinned to their role
          DEFAULT: withAlpha('accent'),
        },
      },

      fontFamily: {
        ...preset.theme.extend.fontFamily,
        display: [
          'Martian Mono',
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },

      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '10px',
      },

      // `rest` is the seated card. `lifted` and `raised` pre-compose it with the
      // two lift levels, because two Tailwind shadow utilities overwrite each
      // other rather than stacking the way the CSS `box-shadow` list does
      boxShadow: {
        // A chip is too small for the full seated-card stack; it only wants the lit top edge
        chip: 'inset 0 1px 0 rgb(255 255 255 / 0.02)',
        rest: REST,
        lift: LIFT,
        float: FLOAT,
        lifted: `${REST}, ${LIFT}`,
        raised: `${REST}, ${FLOAT}`,
      },

      transitionDuration: {
        fast: '120ms',
        base: '220ms',
        slow: '600ms',
      },

      transitionTimingFunction: {
        out: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },

      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'menu-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },

      animation: {
        rise: 'rise 600ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'menu-in': 'menu-in 120ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
}
