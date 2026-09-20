import type { NextConfig } from 'next'

export const baseNextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['pivoshenko.ui'],
  // next dev otherwise writes its own CLAUDE.md and AGENTS.md into the site
  // directory, shadowing the single pair each repo keeps at its root
  agentRules: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}
