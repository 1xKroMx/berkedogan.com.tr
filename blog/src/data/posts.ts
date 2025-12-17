export type BlogPost = {
  id: string
  dateISO: string // YYYY-MM-DD
  content: string
}

type RawEntries = Record<string, string>

function parseEntryPath(path: string) {
  // ./blog-entries/YYYY-MM-DD__uuid.md
  const file = path.split('/').pop() || ''
  const match = file.match(/^(\d{4}-\d{2}-\d{2})__(.+)\.md$/)
  if (!match) return null
  return { dateISO: match[1]!, id: match[2]! }
}

const raw = import.meta.glob('./blog-entries/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as RawEntries

export const posts: BlogPost[] = Object.entries(raw)
  .map(([path, content]) => {
    const meta = parseEntryPath(path)
    if (!meta) return null
    return {
      id: meta.id,
      dateISO: meta.dateISO,
      content,
    } satisfies BlogPost
  })
  .filter(Boolean) as BlogPost[]
