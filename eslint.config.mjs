import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import { plugin as shadcn } from '@shadcn/lint'

const classRule = (pattern, message) => [
  { selector: `Literal[value=${pattern}]`, message },
  { selector: `TemplateElement[value.raw=${pattern}]`, message },
]

// Design-system guardrails; warn until each surface is migrated, then raise to error.
const designSystemRules = [
  ...classRule('/(^|\\s)transition-all(\\s|$)/', 'Name the transitioned properties: transition-[color,background-color,transform], transition-opacity, ...'),
  ...classRule('/transition-\\[[^\\]]*(width|height|padding|margin|top|left)/', 'Do not animate layout properties; animate transform or opacity.'),
  ...classRule('/(^|\\s)(group-)?hover:/', 'Gate hover with can-hover: / group-can-hover: ((hover: hover) and (pointer: fine)).'),
  ...classRule('/-\\[#[0-9a-fA-F]{3,8}\\]/', 'Use a design token (ring-ring, bg-brand, bg-card, ...) instead of a raw hex colour.'),
  ...classRule('/(^|\\s)space-[xy]-/', 'Use flex/grid with gap-* instead of space-x/space-y.'),
  ...classRule('/(^|\\s)duration-(5|7|10)00(\\s|$)/', 'UI interactions stay under 300ms; use duration-(--duration-ui) or duration-(--duration-reveal).'),
  ...classRule('/(^|\\s)ease-in(\\s|$)/', 'Never ease-in on UI; use ease-out or ease-entrance.'),
]

const config = [
  ...nextCoreWebVitals,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/preserve-manual-memoization': 'off'
    }
  },
  {
    files: ['app/**/*.tsx', 'components/**/*.tsx'],
    plugins: { shadcn },
    rules: {
      'no-restricted-syntax': ['warn', ...designSystemRules],
      'shadcn/no-restyle': [
        'warn',
        {
          allow: ['layout'],
          contracts: [
            { pattern: '^Skeleton$', allow: ['layout', 'shape', 'spacing'] },
            { pattern: '^Carousel(Content|Item)?$', allow: ['layout', 'spacing'] },
            { pattern: '^LiquidGlass$', allow: ['layout', 'shape', 'spacing'] },
            { pattern: '^Sidebar(Header|Content|Footer)$', allow: ['layout', 'spacing'] },
            { pattern: '^Card(Header|Content|Footer)?$', allow: ['layout', 'spacing'] },
          ],
        },
      ],
      'shadcn/no-raw-colors': 'warn',
      'shadcn/no-arbitrary-values': ['warn', { allow: ['transition-[*]'] }],
      'shadcn/no-inline-styles': 'warn',
      'shadcn/no-unknown-classes': 'warn',
      'shadcn/require-static-classes': 'warn'
    }
  }
]

export default config
