export function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

export function publicSurveyUrl(slug: string) {
  return `${window.location.origin}/s/${slug}`
}

export function csvFilename(title: string) {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${safe || 'survey'}-results.csv`
}

export function escapeCsv(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"', '""')}"`
  return value
}

export function downloadTextFile(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= items.length) return items
  const next = items.slice()
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

export function toLocalDateKey(iso: string) {
  const date = new Date(iso)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
