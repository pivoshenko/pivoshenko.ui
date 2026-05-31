import type { Config } from 'tailwindcss'

declare const preset: Partial<Config>
export default preset

export declare function withUiContent(siteGlobs: string[]): string[]
