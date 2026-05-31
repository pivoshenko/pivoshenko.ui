import type { NextConfig } from 'next'

export const baseNextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['pivoshenko.ui'],
}
