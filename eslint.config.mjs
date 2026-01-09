import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

export default [
  ...nextCoreWebVitals,
  {
    rules: {
      '@next/next/no-img-element': 'off'
    }
  }
]

