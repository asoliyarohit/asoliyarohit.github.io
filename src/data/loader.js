/**
 * Content loader — reads all markdown files from content/ at build time.
 *
 * To add content:    create a new .md file in the right folder
 * To edit content:   edit the .md file
 * To remove content: delete the .md file
 *
 * Files are sorted alphabetically by filename, so prefix with 01-, 02-,
 * etc. to control display order.
 */
import matter from 'gray-matter'

/* ── Auto-color palette for books ──────────────────────────────────────────
 * Colors are assigned by genre. If your genre isn't listed, a color is
 * picked automatically from the fallback palette using the book title.
 * You can always override by adding spine/accent fields to a book's .md.
 */
const GENRE_COLORS = {
  'Data Science':     { spine: '#1a365d', accent: '#63b3ed' },
  'Python':           { spine: '#1a472a', accent: '#68d391' },
  'Statistics':       { spine: '#1a3a1a', accent: '#48bb78' },
  'Mathematics':      { spine: '#0d1a2d', accent: '#4299e1' },
  'Engineering':      { spine: '#0f172a', accent: '#00d4ff' },
  'Software':         { spine: '#0f172a', accent: '#00d4ff' },
  'Machine Learning': { spine: '#2d1b69', accent: '#9f7aea' },
  'AI':               { spine: '#1f0d3b', accent: '#b794f4' },
  'Growth':           { spine: '#3d1a00', accent: '#f6ad55' },
  'Self-Help':        { spine: '#3d1a00', accent: '#f6ad55' },
  'Business':         { spine: '#1a1a3a', accent: '#fc8181' },
  'Science':          { spine: '#0d2137', accent: '#4fd1c7' },
  'Biography':        { spine: '#2d1515', accent: '#ed8936' },
  'Fiction':          { spine: '#1a1a2e', accent: '#f6e05e' },
  'Philosophy':       { spine: '#1a1630', accent: '#d6bcfa' },
  'History':          { spine: '#2d1a00', accent: '#d69e2e' },
}

const FALLBACK_PALETTE = [
  { spine: '#1a2d1a', accent: '#68d391' },
  { spine: '#1a1a2d', accent: '#76e4f7' },
  { spine: '#2d1a1a', accent: '#fc8181' },
  { spine: '#1a2d2d', accent: '#4fd1c7' },
  { spine: '#2d2d1a', accent: '#f6e05e' },
  { spine: '#1a1a1a', accent: '#a0aec0' },
]

function hashStr(s) {
  return s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0)
}

function autoColors(genre, title) {
  const key = Object.keys(GENRE_COLORS).find(
    k => k.toLowerCase() === (genre || '').toLowerCase()
  )
  if (key) return GENRE_COLORS[key]
  return FALLBACK_PALETTE[Math.abs(hashStr(title || '')) % FALLBACK_PALETTE.length]
}

/* ── Generic loader ─────────────────────────────────────────────────────── */
function load(modules) {
  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, raw], i) => ({ id: i + 1, ...matter(raw).data }))
}

/* ── About ──────────────────────────────────────────────────────────────── */
const _aboutFiles = import.meta.glob(
  '../../content/about.md',
  { query: '?raw', import: 'default', eager: true }
)
const _rawAbout     = Object.values(_aboutFiles)[0] || ''
const _parsedAbout  = matter(_rawAbout)
const _bios         = _parsedAbout.content.trim().split(/\n{2,}/).filter(Boolean)

export const about = {
  ..._parsedAbout.data,
  bio:  _bios[0] || '',
  bio2: _bios[1] || '',
}

/* ── Books ──────────────────────────────────────────────────────────────── */
const _booksRaw = import.meta.glob(
  '../../content/books/*.md',
  { query: '?raw', import: 'default', eager: true }
)
export const books = load(_booksRaw).map(b => ({
  ...b,
  spine:  b.spine  || autoColors(b.genre, b.title).spine,
  accent: b.accent || autoColors(b.genre, b.title).accent,
}))

/* ── Learnings ──────────────────────────────────────────────────────────── */
const _learningsRaw = import.meta.glob(
  '../../content/learnings/*.md',
  { query: '?raw', import: 'default', eager: true }
)
export const learnings = load(_learningsRaw)

/* ── Projects ───────────────────────────────────────────────────────────── */
const _projectsRaw = import.meta.glob(
  '../../content/projects/*.md',
  { query: '?raw', import: 'default', eager: true }
)
export const projects = load(_projectsRaw)

/* ── Contributions ──────────────────────────────────────────────────────── */
const _opensourceRaw = import.meta.glob(
  '../../content/contributions/opensource/*.md',
  { query: '?raw', import: 'default', eager: true }
)
const _consultingRaw = import.meta.glob(
  '../../content/contributions/consulting/*.md',
  { query: '?raw', import: 'default', eager: true }
)
export const contributions = {
  opensource: load(_opensourceRaw),
  consulting:  load(_consultingRaw),
}

/* ── Auto-computed stats (always in sync with content) ──────────────────── */
export const stats = [
  { label: 'Projects',   value: projects.length,                              suffix: '+' },
  { label: 'Learnings',  value: learnings.length,                             suffix: '+' },
  { label: 'Books Read', value: books.filter(b => b.status === 'completed').length, suffix: '+' },
]
