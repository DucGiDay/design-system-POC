import type { Config } from 'tailwindcss'

/**
 * Tailwind map thẳng vào token CMS-26 trong src/styles/_tokens.scss (CSS variables),
 * không hardcode hex. Prefix `fb-` theo quy ước project Fabi:
 * `fb-flex`, `hover:fb-bg-subtle`, `-fb-mt-1`.
 */
export default {
  prefix: 'fb-',
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        violet: { DEFAULT: 'var(--violet)', text: 'var(--violet-text)', soft: 'var(--violet-soft)' },
        primary: {
          DEFAULT: 'var(--primary)',
          strong: 'var(--primary-strong)',
          text: 'var(--primary-text)',
          soft: 'var(--primary-soft)',
          tint: 'var(--primary-tint)',
          ...Object.fromEntries(
            [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => [step, `var(--primary-${step})`]),
          ),
        },
        accent: {
          DEFAULT: 'var(--accent)',
          text: 'var(--accent-text)',
          soft: 'var(--accent-soft)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          muted: 'var(--ink-muted)',
          faint: 'var(--ink-faint)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
          soft: 'var(--line-soft)',
        },
        surface: 'var(--surface)',
        field: 'var(--field)',
        ground: 'var(--ground)',
        subtle: 'var(--subtle)',
        success: {
          DEFAULT: 'var(--success)',
          text: 'var(--success-text)',
          soft: 'var(--success-soft)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          soft: 'var(--warning-soft)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          soft: 'var(--danger-soft)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      fontSize: {
        "display-number": [
                "var(--type-display-number-font-size)",
                {
                        "lineHeight": "var(--type-display-number-line-height)",
                        "fontWeight": "var(--type-display-number-font-weight)",
                        "letterSpacing": "var(--type-display-number-letter-spacing)"
                }
        ],
        "page-title": [
                "var(--type-page-title-font-size)",
                {
                        "lineHeight": "var(--type-page-title-line-height)",
                        "fontWeight": "var(--type-page-title-font-weight)",
                        "letterSpacing": "var(--type-page-title-letter-spacing)"
                }
        ],
        "section": [
                "var(--type-section-font-size)",
                {
                        "lineHeight": "var(--type-section-line-height)",
                        "fontWeight": "var(--type-section-font-weight)",
                        "letterSpacing": "var(--type-section-letter-spacing)"
                }
        ],
        "number-md": [
                "var(--type-number-md-font-size)",
                {
                        "lineHeight": "var(--type-number-md-line-height)",
                        "fontWeight": "var(--type-number-md-font-weight)",
                        "letterSpacing": "var(--type-number-md-letter-spacing)"
                }
        ],
        "card-title": [
                "var(--type-card-title-font-size)",
                {
                        "lineHeight": "var(--type-card-title-line-height)",
                        "fontWeight": "var(--type-card-title-font-weight)"
                }
        ],
        "body": [
                "var(--type-body-font-size)",
                {
                        "lineHeight": "var(--type-body-line-height)",
                        "fontWeight": "var(--type-body-font-weight)"
                }
        ],
        "body-medium": [
                "var(--type-body-medium-font-size)",
                {
                        "lineHeight": "var(--type-body-medium-line-height)",
                        "fontWeight": "var(--type-body-medium-font-weight)"
                }
        ],
        "body-semibold": [
                "var(--type-body-semibold-font-size)",
                {
                        "lineHeight": "var(--type-body-semibold-line-height)",
                        "fontWeight": "var(--type-body-semibold-font-weight)"
                }
        ],
        "cell": [
                "var(--type-cell-font-size)",
                {
                        "lineHeight": "var(--type-cell-line-height)",
                        "fontWeight": "var(--type-cell-font-weight)"
                }
        ],
        "label": [
                "var(--type-label-font-size)",
                {
                        "lineHeight": "var(--type-label-line-height)",
                        "fontWeight": "var(--type-label-font-weight)"
                }
        ],
        "caption": [
                "var(--type-caption-font-size)",
                {
                        "lineHeight": "var(--type-caption-line-height)",
                        "fontWeight": "var(--type-caption-font-weight)"
                }
        ],
        "overline": [
                "var(--type-overline-font-size)",
                {
                        "lineHeight": "var(--type-overline-line-height)",
                        "fontWeight": "var(--type-overline-font-weight)",
                        "letterSpacing": "var(--type-overline-letter-spacing)"
                }
        ]
},
      borderRadius: {
        full: 'var(--radius-full)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        raised: 'var(--shadow-raised)',
        overlay: 'var(--shadow-overlay)',
      },
    },
  },
} satisfies Config
