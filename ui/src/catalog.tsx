'use client'

import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Filter,
  RotateCcw,
  SearchX,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Card, CardGrid } from './card'
import { Dialog } from './dialog'
import { EmptyState } from './empty'
import {
  BarButton,
  SearchBar,
  SelectMenu,
  type SelectOption,
  TagFilter,
} from './filters'
import { List, Row } from './list'
import { SubHeader } from './section'
import { SectionHeader } from './section-header'
import { Tag, TagButton, Tags } from './tag'

export type CatalogEntry = {
  id: string
  name: string
  description?: string
  tags: string[]
  /** breadcrumb shown on the row and in the dialog, e.g. "owner/repo/skills/x" */
  path?: string
  /** where the entry actually lives; makes the dialog crumb a link */
  href?: string
  /** false marks it as coming from somewhere else, which drives the source filter */
  local?: boolean
  /** dimmed, for archived or retired entries */
  muted?: boolean
  /** sub-heading to file this entry under; falls back to the own/external split */
  group?: string
  icon?: ReactNode
}

type CatalogProps = {
  id: string
  title: string
  entries: CatalogEntry[]
  archived?: CatalogEntry[]
  /** a handful of entries reads faster unfiltered than it does behind a bar */
  filters?: boolean
  /** rows scan faster; cards give a long description room to breathe */
  layout?: CatalogLayout
  /** entries navigate to their href instead of opening the dialog */
  link?: boolean
  /** cards only: minimum track width, so a row fits as many as it can */
  min?: string
  className?: string
}

export type CatalogLayout = 'rows' | 'cards'

export function Catalog({
  id,
  title,
  entries,
  archived = [],
  filters: withFilters,
  layout = 'rows',
  link = false,
  min = '340px',
  className = '',
}: CatalogProps) {
  const [active, setActive] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [source, setSource] = useState<Source>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [opened, setOpened] = useState<CatalogEntry | null>(null)

  const tags = useMemo(
    () => countTags([...entries, ...archived]),
    [entries, archived],
  )

  const needle = query.trim().toLowerCase()

  // Tags are an OR within themselves and an AND against search and source, so
  // narrowing by one never silently widens another
  const keep = (items: CatalogEntry[]) =>
    items.filter(
      (item) =>
        (active.size === 0 || item.tags.some((tag) => active.has(tag))) &&
        matchesSource(item, source) &&
        matchesQuery(item, needle),
    )

  const toggle = (tag: string) =>
    setActive((prev) => {
      const next = new Set(prev)
      if (!next.delete(tag)) next.add(tag)
      return next
    })

  const filtered = active.size > 0 || needle !== '' || source !== 'all'
  const showFilters = withFilters ?? entries.length + archived.length > 12

  const reset = () => {
    setActive(new Set())
    setQuery('')
    setSource('all')
  }

  const shown = keep(entries)
  const shownArchived = keep(archived)
  const hasExternal = entries.some((entry) => !isOwn(entry))
  // an entry that names its own group opts the whole catalog out of the
  // own/external split - two levels of sub-heading would out-rank the section
  const blocks = entries.some((entry) => entry.group)
    ? bucket(shown, (entry) => entry.group ?? 'elsewhere')
    : bucket(shown, (entry) => (isOwn(entry) ? 'own' : 'external'))

  return (
    <div className={`space-y-10 ${className}`}>
      {showFilters && (
        <section id="filters" className="scroll-mt-24 space-y-2">
          <SectionHeader
            title="Filters"
            count={tags.length}
            action={
              <div className="flex items-center gap-2">
                {hasExternal && (
                  <SelectMenu
                    value={source}
                    options={sourceOptions}
                    onSelect={setSource}
                    icon={
                      <Filter size={14} strokeWidth={2} aria-hidden="true" />
                    }
                  />
                )}
                {filtered && (
                  <BarButton
                    onClick={reset}
                    icon={
                      <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
                    }
                  >
                    Reset
                  </BarButton>
                )}
              </div>
            }
          />
          <div className="space-y-4">
            <SearchBar
              value={query}
              onValueChange={setQuery}
              placeholder="Name, description, tag"
            />
            <TagFilter tags={tags} active={active} onToggle={toggle} />
          </div>
        </section>
      )}

      <section id={id} className="scroll-mt-24 space-y-2">
        <SectionHeader title={title} count={shown.length} />
        {shown.length === 0 ? (
          <NoMatches />
        ) : (
          <div className="space-y-8">
            {blocks.map((block) => (
              <Block
                key={block.label}
                label={blocks.length > 1 ? block.label : undefined}
                count={block.entries.length}
                entries={block.entries}
                layout={layout}
                min={min}
                link={link}
                onOpen={setOpened}
              />
            ))}
          </div>
        )}
      </section>

      {archived.length > 0 && (
        <section id="archived" className="scroll-mt-24 space-y-2">
          <SectionHeader
            title="Archived"
            count={shownArchived.length}
            action={
              <BarButton
                onClick={() => setShowArchived((prev) => !prev)}
                aria-expanded={showArchived}
                aria-controls="archived"
                icon={
                  showArchived ? (
                    <EyeOff size={14} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <Eye size={14} strokeWidth={2} aria-hidden="true" />
                  )
                }
              >
                {showArchived ? 'Hide' : 'Show'}
              </BarButton>
            }
          />
          {!showArchived ? null : shownArchived.length === 0 ? (
            <NoMatches />
          ) : (
            <Entries
              entries={shownArchived}
              layout={layout}
              min={min}
              link={link}
              onOpen={setOpened}
            />
          )}
        </section>
      )}

      <EntryDialog
        entry={opened}
        onClose={() => setOpened(null)}
        onTagClick={toggle}
      />
    </div>
  )
}

// Buckets in first-appearance order, so the caller decides the running order
// by the order it hands the entries over
function bucket(
  entries: CatalogEntry[],
  labelOf: (entry: CatalogEntry) => string,
): Array<{ label: string; entries: CatalogEntry[] }> {
  const out = new Map<string, CatalogEntry[]>()
  for (const entry of entries) {
    const label = labelOf(entry)
    out.set(label, [...(out.get(label) ?? []), entry])
  }
  return Array.from(out, ([label, list]) => ({ label, entries: list }))
}

// == Entries ==

type BlockProps = {
  label?: string
  count: number
  entries: CatalogEntry[]
  layout: CatalogLayout
  min: string
  link: boolean
  onOpen: (entry: CatalogEntry) => void
}

function Block({
  label,
  count,
  entries,
  layout,
  min,
  link,
  onOpen,
}: BlockProps) {
  return (
    <div className="space-y-4">
      {label && <SubHeader label={label} count={count} />}
      <Entries
        entries={entries}
        layout={layout}
        min={min}
        link={link}
        onOpen={onOpen}
      />
    </div>
  )
}

type EntriesProps = {
  entries: CatalogEntry[]
  layout: CatalogLayout
  min: string
  link: boolean
  onOpen: (entry: CatalogEntry) => void
}

function Entries({ entries, layout, min, link, onOpen }: EntriesProps) {
  if (layout === 'cards') {
    return (
      <CardGrid min={min}>
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} link={link} onOpen={onOpen} />
        ))}
      </CardGrid>
    )
  }
  return (
    <List lead="1.75rem">
      {entries.map((entry) => (
        <EntryRow key={entry.id} entry={entry} link={link} onOpen={onOpen} />
      ))}
    </List>
  )
}

// A catalog in link mode still falls back to the dialog for an entry that
// names no href - a row that does nothing at all is worse than one that opens
function destination(entry: CatalogEntry, link: boolean) {
  return link ? entry.href : undefined
}

type EntryCardProps = {
  entry: CatalogEntry
  link: boolean
  onOpen: (entry: CatalogEntry) => void
}

function EntryCard({ entry, link, onOpen }: EntryCardProps) {
  const href = destination(entry, link)
  return (
    <Card
      glyph={entry.icon}
      title={entry.name}
      desc={entry.description}
      clamp
      href={href}
      external={href != null}
      onClick={href ? undefined : () => onOpen(entry)}
      className={entry.muted ? 'opacity-70' : undefined}
    >
      <Tags className="mt-3">
        {entry.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Tags>
    </Card>
  )
}

type EntryRowProps = {
  entry: CatalogEntry
  link: boolean
  onOpen: (entry: CatalogEntry) => void
}

// A row, not a card. Sixty near-identical boxes read as a wall, and the card
// was mostly chrome once the description moved into the dialog - a row gives
// the description the horizontal room it wanted all along
function EntryRow({ entry, link, onOpen }: EntryRowProps) {
  const href = destination(entry, link)
  return (
    <Row
      href={href}
      external={href != null}
      onClick={href ? undefined : () => onOpen(entry)}
      className={entry.muted ? 'opacity-70' : ''}
      lead={
        entry.icon ? (
          <span aria-hidden="true" className="text-accent">
            {entry.icon}
          </span>
        ) : undefined
      }
      title={<span className="block truncate">{entry.name}</span>}
      desc={<span className="line-clamp-1">{entry.description}</span>}
      trail={
        <Tags className="hidden justify-end md:flex">
          {entry.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Tags>
      }
    />
  )
}

type EntryDialogProps = {
  entry: CatalogEntry | null
  onClose: () => void
  onTagClick: (tag: string) => void
}

function EntryDialog({ entry, onClose, onTagClick }: EntryDialogProps) {
  return (
    <Dialog
      open={entry != null}
      onClose={onClose}
      glyph={entry?.icon}
      eyebrow={entry?.path ? <SourceCrumb entry={entry} /> : undefined}
      title={entry?.name ?? ''}
    >
      <p className="type-body fg-body m-0 whitespace-pre-line">
        {entry?.description || 'No description published for this entry.'}
      </p>

      {entry && entry.tags.length > 0 && (
        <Tags>
          {entry.tags.map((tag) => (
            <TagButton
              key={tag}
              onClick={() => {
                onTagClick(tag)
                onClose()
              }}
            >
              {tag}
            </TagButton>
          ))}
        </Tags>
      )}
    </Dialog>
  )
}

// The path is the link - a separate button would say the same thing twice
function SourceCrumb({ entry }: { entry: CatalogEntry }) {
  const crumb = (
    <>
      <span aria-hidden="true" className="text-accent">
        {'//'}
      </span>
      <span className="[overflow-wrap:anywhere]">{entry.path}</span>
    </>
  )

  if (!entry.href) {
    return (
      <span className="fg-subtle inline-flex items-center gap-1.5">
        {crumb}
      </span>
    )
  }

  return (
    <a
      href={entry.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fg-subtle hover-primary focus-ring inline-flex items-center gap-1.5 rounded-sm no-underline transition-colors duration-fast"
    >
      {crumb}
      <ArrowUpRight
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="flex-none transition-[color,transform] duration-base ease-out group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </a>
  )
}

function NoMatches() {
  return (
    <EmptyState
      icon={<SearchX size={20} strokeWidth={2} aria-hidden="true" />}
      title="Nothing here"
      description="No entry matches the current search, source and tags."
    />
  )
}

// == Filtering ==

type Source = 'all' | 'own' | 'external'

const sourceOptions: Array<SelectOption<Source>> = [
  { value: 'all', label: 'All sources' },
  { value: 'own', label: 'Own only' },
  { value: 'external', label: 'External only' },
]

// only an explicit false marks an entry as somebody else's, so a site that
// catalogs nothing external never has to set the flag at all
function isOwn(entry: CatalogEntry) {
  return entry.local !== false
}

function matchesSource(entry: CatalogEntry, source: Source) {
  if (source === 'own') return isOwn(entry)
  if (source === 'external') return !isOwn(entry)
  return true
}

// Searches everything a row or its dialog can show, so a hit is always
// explicable - the term is visible somewhere once you open the entry
function matchesQuery(entry: CatalogEntry, needle: string) {
  if (needle === '') return true
  return [entry.name, entry.description, entry.path, ...entry.tags]
    .join(' ')
    .toLowerCase()
    .includes(needle)
}

function countTags(items: CatalogEntry[]) {
  const counts = new Map<string, number>()
  for (const item of items) {
    for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  )
}
