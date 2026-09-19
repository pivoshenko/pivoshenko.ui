import type { HTMLAttributes, ReactNode } from 'react'

/* Rendered markdown arrives as arbitrary HTML, so every rule is an
   arbitrary-variant child selector rather than a class on the element itself.
   Tailwind's preflight strips the UA list markers and the `pre` margin the
   bundle relied on, so `list-disc`, `list-decimal` and `[&_pre]:mb-4` put them
   back rather than adding to the bundle */
const prose = [
  'max-w-[76ch] type-body fg-body',
  '[&>*:first-child]:mt-0',

  // headings diverge from the bundle only in the face - h2 is the display one
  '[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:leading-[1.375]',
  '[&_h2]:font-display [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-fg-default',
  '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:leading-6',
  '[&_h3]:font-semibold [&_h3]:text-fg-default',

  '[&_p]:mt-0 [&_p]:mb-4',
  '[&_ul]:mt-0 [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc',
  '[&_ol]:mt-0 [&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal',
  '[&_li]:mb-1 [&_li::marker]:text-accent',

  '[&_a]:text-fg-default [&_a]:underline [&_a]:decoration-accent-info',
  '[&_a]:underline-offset-[3px] [&_a:hover]:text-accent-info',
  '[&_strong]:text-fg-default [&_strong]:font-semibold',

  '[&_code]:px-1 [&_code]:py-px [&_code]:rounded-sm [&_code]:bg-bg-raised',
  '[&_code]:text-accent-secondary [&_code]:text-[13px]',
  '[&_pre]:mb-4 [&_pre]:p-4 [&_pre]:border [&_pre]:border-border-default',
  '[&_pre]:rounded-lg [&_pre]:bg-crust [&_pre]:overflow-x-auto',
  '[&_pre_code]:p-0 [&_pre_code]:bg-transparent [&_pre_code]:text-fg-muted',

  '[&_blockquote]:mt-0 [&_blockquote]:mb-4 [&_blockquote]:py-2 [&_blockquote]:pl-4',
  '[&_blockquote]:border-l [&_blockquote]:border-border-strong [&_blockquote]:text-fg-subtle',
  '[&_hr]:my-8 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-dashed [&_hr]:border-border-strong',
  '[&_img]:max-w-full [&_img]:rounded-lg',

  '[&_table]:w-full [&_table]:border-collapse [&_table]:mb-4 [&_table]:text-[13px]',
  '[&_th]:px-3 [&_th]:py-2 [&_th]:border-b [&_th]:border-border-subtle [&_th]:text-left',
  '[&_th]:text-fg-default [&_th]:font-semibold',
  '[&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-border-subtle [&_td]:text-left',
].join(' ')

type ProseProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Prose({ className = '', children, ...rest }: ProseProps) {
  return (
    <div {...rest} className={`${prose} ${className}`}>
      {children}
    </div>
  )
}
