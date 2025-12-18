import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        'hero': 'var(--radius-hero)',
        'hero-md': 'var(--radius-hero-md)',
        'card': 'var(--radius-card)',
        'card-md': 'var(--radius-card-md)',
        'episode': 'var(--radius-episode)',
        'episode-md': 'var(--radius-episode-md)',
        'episode-image': 'var(--radius-episode-image)',
        'episode-image-md': 'var(--radius-episode-image-md)',
        'ui': 'var(--radius-ui)',
        'ui-md': 'var(--radius-ui-md)',
        'dialog': 'var(--radius-dialog)',
        'dialog-md': 'var(--radius-dialog-md)',
        'small': 'var(--radius-small)',
        'medium': 'var(--radius-medium)',
        'large': 'var(--radius-large)',
      },
      fontSize: {
        'xs': ['var(--text-xs)', { lineHeight: '1.5' }],
        'sm': ['var(--text-sm)', { lineHeight: '1.5' }],
        'base': ['var(--text-base)', { lineHeight: '1.5' }],
        'md': ['var(--text-md)', { lineHeight: '1.5' }],
        'lg': ['var(--text-lg)', { lineHeight: '1.5' }],
        'xl': ['var(--text-xl)', { lineHeight: '1.5' }],
        '2xl': ['var(--text-2xl)', { lineHeight: '1.2' }],
        '3xl': ['var(--text-3xl)', { lineHeight: '1.2' }],
        '4xl': ['var(--text-4xl)', { lineHeight: '1.1' }],
        '5xl': ['var(--text-5xl)', { lineHeight: '1.1' }],
        '6xl': ['var(--text-6xl)', { lineHeight: '1' }],
        '7xl': ['var(--text-7xl)', { lineHeight: '1' }],
      },
      letterSpacing: {
        'tight': 'var(--tracking-tight)',
        'normal': 'var(--tracking-normal)',
        'wide': 'var(--tracking-wide)',
        'wider': 'var(--tracking-wider)',
        'widest': 'var(--tracking-widest)',
        'extra': 'var(--tracking-extra)',
      },
    },
  },
  plugins: [],
}
export default config
