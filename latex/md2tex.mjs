// Your Name, student number
// Bonus 1: turns README.md into latex/guide.tex, so the PDF always has the same content as the guide.
// Run: npm run latex   (then: cd latex && xelatex guide.tex && xelatex guide.tex)
// No packages needed. It understands the Markdown that README.md uses: headings, paragraphs,
// fenced code, tables, bullet and numbered lists, **bold**, *italic*, `code` and links.
import { readFileSync, writeFileSync } from 'node:fs'

const readmeUrl = new URL('../README.md', import.meta.url)
const outUrl = new URL('./guide.tex', import.meta.url)
const md = readFileSync(readmeUrl, 'utf8').replace(/\r\n/g, '\n').replace(/^﻿/, '')

// ---------------------------------------------------------------------------
// Text helpers

// Latin Modern has no emoji, so they become words.
const noEmoji = (s) => s.replace(/👍/gu, '(thumbs-up)').replace(/\p{Extended_Pictographic}/gu, '(emoji)')

const ESCAPES = {
  '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', $: '\\$', '&': '\\&', '#': '\\#',
  '^': '\\textasciicircum{}', _: '\\_', '%': '\\%', '~': '\\textasciitilde{}',
}
const esc = (s) => noEmoji(s).replace(/[\\{}$&#^_%~]/g, (c) => ESCAPES[c])

// Inline code: escaped, with break points after punctuation so long code never sticks out of a line.
const code = (s) => {
  const parts = [...noEmoji(s)].map((c) => {
    const e = ESCAPES[c] ?? c
    return /[.,;:(<\[{\/=|>&-]/.test(c) ? `${e}\\allowbreak{}` : e
  })
  // Long camelCase names (noUncheckedIndexedAccess) may also break before a capital letter.
  const joined = parts.join('').replace(/(?<=[a-z]{3})(?=[A-Z][a-z])/g, '\\allowbreak{}')
  return `\\code{${joined}}`
}

// GitHub's anchor rule: lower case, drop punctuation, spaces become hyphens.
const used = new Map()
function slug(text) {
  const base = text.replace(/`/g, '').toLowerCase().replace(/[^\p{L}\p{N} _-]/gu, '').replace(/ /g, '-')
  const n = used.get(base) ?? 0
  used.set(base, n + 1)
  return n === 0 ? base : `${base}-${n}`
}
const labelOf = (s) => s.replace(/[^a-zA-Z0-9-]/g, '')

// Bold, italic, links and code spans. Code spans first, so ** inside code stays as it is.
function inline(s) {
  let out = ''
  let last = 0
  const re = /(`+)([\s\S]*?[^`])\1(?!`)|\*\*([\s\S]+?)\*\*|(?<![\w*])\*([^*\s][^*]*?)\*(?![\w*])|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)]+)/g
  for (const m of s.matchAll(re)) {
    out += esc(s.slice(last, m.index))
    last = m.index + m[0].length
    if (m[1]) {
      let c = m[2]
      if (c.startsWith(' ') && c.endsWith(' ') && c.trim()) c = c.slice(1, -1)
      out += code(c)
    } else if (m[3]) out += `\\textbf{${inline(m[3])}}`
    else if (m[4]) out += `\\emph{${inline(m[4])}}`
    else if (m[5]) {
      const target = m[6]
      out += target.startsWith('#')
        ? `\\hyperref[${labelOf(target.slice(1))}]{${inline(m[5])}}`
        : `\\href{${target.replace(/[#%\\]/g, '\\$&')}}{${inline(m[5])}}`
    } else out += `\\url{${m[7]}}`
  }
  return out + esc(s.slice(last))
}

// Plain text for PDF bookmarks.
const plain = (s) => esc(s.replace(/`/g, ''))

// ---------------------------------------------------------------------------
// Blocks

const LANGS = { js: 'JavaScript', mjs: 'JavaScript', jsx: 'JavaScript', ts: 'TypeScript', tsx: 'TypeScript' }

function table(rows) {
  const split = (line) => line.trim().replace(/^\||\|$/g, '').replace(/\\\|/g, '\u0000').split('|')
    .map((c) => c.trim().replace(/\u0000/g, '|'))
  const header = split(rows[0])
  const body = rows.slice(2).map(split)
  const n = header.length
  // Column widths follow the amount of text in each column (square root, so no column gets tiny).
  const weight = header.map((h, i) => {
    const lengths = [h, ...body.map((r) => r[i] ?? '')].map((c) => c.replace(/[`*]/g, '').length)
    return Math.sqrt(Math.max(3, lengths.reduce((a, b) => a + b, 0) / lengths.length))
  })
  const total = weight.reduce((a, b) => a + b, 0)
  const spec = weight
    .map((w) => `>{\\raggedright\\arraybackslash\\hsize=${((w / total) * n).toFixed(3)}\\hsize}X`)
    .join('')
  const row = (cells) => cells.slice(0, n).concat(Array(Math.max(0, n - cells.length)).fill('')).map(inline).join(' & ') + ' \\\\'
  return [
    '\\begin{small}',
    `\\begin{xltabular}{\\linewidth}{@{}${spec}@{}}`,
    '\\toprule',
    row(header.map((h) => `**${h}**`)),
    '\\midrule',
    '\\endhead',
    ...body.map(row),
    '\\bottomrule',
    '\\end{xltabular}',
    '\\end{small}',
  ].join('\n')
}

const isFence = (l) => /^\s*(```|~~~)/.test(l)
const isTableStart = (lines, i) => /^\s*\|/.test(lines[i]) && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] ?? '')
const itemRe = /^(\s*)([-*]|\d+\.)\s+(.*)$/
const isHeading = (l) => /^#{1,6}\s/.test(l)

function blocks(lines) {
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }

    if (isFence(line)) {
      const indent = line.match(/^\s*/)[0].length
      const lang = line.trim().replace(/^(```|~~~)/, '').trim().toLowerCase()
      const body = []
      i++
      while (i < lines.length && !isFence(lines[i])) body.push(lines[i++].slice(indent))
      i++
      const style = LANGS[lang] ? `language=${LANGS[lang]}` : 'style=plain'
      out.push(`\\begin{lstlisting}[${style}]\n${noEmoji(body.join('\n'))}\n\\end{lstlisting}`)
      continue
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      const level = h[1].length
      const text = h[2].trim()
      const cmd = ['section', 'section', 'subsection', 'subsubsection', 'paragraph', 'paragraph'][level - 1]
      out.push(`\\${cmd}{\\texorpdfstring{${inline(text)}}{${plain(text)}}}\\label{${labelOf(slug(text))}}`)
      i++
      continue
    }

    if (isTableStart(lines, i)) {
      const rows = []
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++])
      out.push(table(rows))
      continue
    }

    const item = line.match(itemRe)
    if (item) {
      const ordered = /\d/.test(item[2])
      const baseIndent = item[1].length
      const items = []
      while (i < lines.length) {
        const m = lines[i].match(itemRe)
        if (!m || m[1].length !== baseIndent || /\d/.test(m[2]) !== ordered) break
        const width = m[1].length + m[2].length + 1
        const content = [m[3]]
        i++
        // Continuation: indented lines, blank lines followed by indented lines, lazy text lines.
        while (i < lines.length) {
          const l = lines[i]
          if (!l.trim()) {
            const next = lines[i + 1] ?? ''
            if (next.trim() && next.match(/^\s*/)[0].length > baseIndent) { content.push(''); i++; continue }
            break
          }
          const indent = l.match(/^\s*/)[0].length
          if (indent > baseIndent) { content.push(l.slice(Math.min(width, indent))); i++; continue }
          if (itemRe.test(l) || isHeading(l) || isFence(l) || /^\s*\|/.test(l)) break
          content.push(l)
          i++
        }
        items.push({ number: Number(m[2]) || 1, content })
      }
      const env = ordered ? 'enumerate' : 'itemize'
      const opt = ordered && items[0].number !== 1 ? `[start=${items[0].number}]` : ''
      out.push(`\\begin{${env}}${opt}\n${items.map((it) => `\\item ${blocks(it.content)}`).join('\n')}\n\\end{${env}}`)
      continue
    }

    // Paragraph: lines up to a blank line or the start of another block.
    const para = []
    while (i < lines.length && lines[i].trim() && !isFence(lines[i]) && !isHeading(lines[i]) &&
      !isTableStart(lines, i) && !(para.length && itemRe.test(lines[i]))) {
      para.push(lines[i++].trim())
    }
    out.push(inline(para.join(' ')))
  }
  return out.join('\n\n')
}

// ---------------------------------------------------------------------------
// Front matter: the title, name and student number go on the title page; the Markdown
// "Contents" section is replaced by LaTeX's own linked table of contents.

const lines = md.split('\n')
let title = 'Destructuring Field Guide'
let name = ''
let number = ''
const front = []
const rest = []
let inFront = true
let skipping = false
for (const line of lines) {
  if (inFront && /^##\s/.test(line)) inFront = false
  if (inFront) {
    const t = line.match(/^#\s+(.*)/)
    const n = line.match(/^Name:\s*(.*)/i)
    const s = line.match(/^Student number:\s*(.*)/i)
    if (t) title = t[1].trim()
    else if (n) name = n[1].trim()
    else if (s) number = s[1].trim()
    else front.push(line)
    continue
  }
  if (/^##\s/.test(line)) skipping = /^##\s+Contents\s*$/i.test(line)
  if (!skipping) rest.push(line)
}

const preamble = String.raw`% Generated by latex/md2tex.mjs from README.md. Do not edit by hand: edit README.md and run npm run latex.
% Compile with XeLaTeX (twice, for the contents page): xelatex guide.tex
\documentclass[11pt,a4paper]{article}
\usepackage{fontspec}
\setmainfont{Latin Modern Roman}
\setsansfont{Latin Modern Sans}
\setmonofont{Latin Modern Mono}[Scale=1.0]
\usepackage[a4paper,margin=2.3cm,headheight=14pt]{geometry}
\usepackage{microtype}
\usepackage{xcolor}
\usepackage{booktabs,array,xltabular}
\usepackage{enumitem}
\usepackage{parskip}
\usepackage[document]{ragged2e}
\usepackage{listings}
\usepackage{fancyhdr}
\usepackage[hidelinks]{hyperref}
\usepackage{bookmark}

\definecolor{codebg}{HTML}{F6F8FA}
\definecolor{coderule}{HTML}{D0D7DE}
\definecolor{kw}{HTML}{8250DF}
\definecolor{str}{HTML}{0A3069}
\definecolor{com}{HTML}{6E7781}
\definecolor{link}{HTML}{0550AE}
\hypersetup{colorlinks=true,linkcolor=link,urlcolor=link,pdftitle={${plain(title)}},pdfauthor={${plain(name)}}}

\DeclareRobustCommand{\code}[1]{\texttt{#1}}
\setlength{\parindent}{0pt}
\setlength{\emergencystretch}{2em}
\setlist{itemsep=2pt,topsep=4pt}
\setcounter{secnumdepth}{1}
\setcounter{tocdepth}{2}
\urlstyle{tt}

\lstdefinelanguage{JavaScript}{
  morekeywords={const,let,var,function,return,if,else,for,of,in,new,try,catch,finally,throw,typeof,
    import,from,export,default,async,await,true,false,null,undefined,class,extends,while,switch,case,
    break,continue,yield,delete,void,this},
  sensitive=true,
  morecomment=[l]{//},
  morecomment=[s]{/*}{*/},
  morestring=[b]',
  morestring=[b]",
  morestring=[b]\`,
}
\lstdefinelanguage{TypeScript}[]{JavaScript}{
  morekeywords={type,interface,as,keyof,infer,readonly,extends,satisfies,never,unknown,string,number,boolean},
}
\lstdefinestyle{plain}{}
\lstset{
  basicstyle=\ttfamily\small,
  columns=fullflexible,
  keepspaces=true,
  backgroundcolor=\color{codebg},
  frame=single,
  rulecolor=\color{coderule},
  framesep=4pt,
  xleftmargin=4pt,
  xrightmargin=4pt,
  breaklines=true,
  breakatwhitespace=false,
  postbreak=\mbox{\textcolor{com}{$\hookrightarrow$}\space},
  keywordstyle=\color{kw}\bfseries,
  stringstyle=\color{str},
  commentstyle=\color{com}\itshape,
  showstringspaces=false,
  upquote=true,
  extendedchars=true,
  aboveskip=6pt,
  belowskip=6pt,
}

\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\small ${esc(title)}}
\fancyhead[R]{\small ${esc(name)}}
\fancyfoot[C]{\small\thepage}
\renewcommand{\headrulewidth}{0.4pt}

\title{${esc(title)}}
\author{${esc(name)}\\ ${esc(number)}}
\date{\today}
`

const tex = `${preamble}
\\begin{document}
\\maketitle
\\thispagestyle{empty}

${blocks(front)}

\\tableofcontents
\\newpage

${blocks(rest)}

\\end{document}
`

writeFileSync(outUrl, tex)
console.log(`Wrote ${outUrl.pathname} (${tex.split('\n').length} lines)`)
