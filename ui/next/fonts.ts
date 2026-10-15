import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

/**
 * Reads a vendored JetBrains Mono instance for Satori.
 *
 * The faces are committed under `ui/fonts/` rather than fetched from
 * fonts.gstatic.com at build time: the image routes prerender, and a GitHub
 * ARM runner has no IPv6 route, so happy-eyeballs spends its first connect
 * attempt on an ENETUNREACH and leaves the IPv4 address 250ms, which the
 * build worker does not reliably meet. The fetch then failed as ETIMEDOUT and
 * took the whole prerender with it.
 *
 * Static instances, not the variable file: Satori renders a variable font at
 * one weight, so a weight declared against it is silently ignored.
 */
export function loadJetBrainsMono(weight: 400 | 700 | 800): Promise<Buffer> {
  return readFile(
    fileURLToPath(
      new URL(`../fonts/jetbrains-mono-${weight}.ttf`, import.meta.url),
    ),
  )
}
