#!/usr/bin/env node
// Update controls JSON from a text extract of the CMMC L2 Assessment Guide.
// Usage: node tools/update-from-guide.js --in docs/sources/cmmc-l2.txt --data web/public/data/cmmc-l2.controls.json --out web/public/data/cmmc-l2.controls.json

const fs = require('fs')
const path = require('path')

function arg(name, def) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i+1] : def }
const inTxt = arg('--in', 'docs/sources/cmmc-l2.txt')
const dataPath = arg('--data', 'web/public/data/cmmc-l2.controls.json')
const outPath = arg('--out', dataPath)

function loadLines(p) { return fs.readFileSync(p,'utf8').split(/\r?\n/) }

function parseSections(lines) {
  const sections = new Map()
  const headerRe = /\b([A-Z]{2}\.L2-3\.\d+\.\d+)\b\s*[–-]\s*(.+)$/
  let current = null
  let buf = []
  for (let raw of lines) {
    const line = raw.replace(/\u00a0/g, ' ').trimEnd()
    const m = line.match(headerRe)
    if (m) {
      if (current) sections.set(current, buf.join('\n'))
      current = m[1]
      buf = [line]
    } else if (current) {
      buf.push(line)
    }
  }
  if (current) sections.set(current, buf.join('\n'))
  return sections
}

function extractFields(text) {
  const lines = text.split('\n')
  // Title is on header line after dash
  const headerRe = /\b([A-Z]{2}\.L2-3\.\d+\.\d+)\b\s*[–-]\s*(.+)$/
  const m = lines[0].match(headerRe)
  const title = m ? m[2].replace(/\.+\s*\d+\s*$/, '').trim() : ''
  // Collect description until Assessment Objectives or first objective [a]
  const desc = []
  let i = 1
  const isObjLine = (s) => /^\s*\[[a-z]\]/i.test(s)
  for (; i < lines.length; i++) {
    const s = lines[i].trim()
    if (!s) continue
    if (/^Assessment\s+Objectives/i.test(s) || isObjLine(s)) break
    // skip table-of-contents dots or page numbers
    if (/^\.+\s*\d+\s*$/.test(s)) continue
    desc.push(s)
  }
  // Extract objectives [a] ...
  const objectives = []
  let cur = null
  for (; i < lines.length; i++) {
    let s = lines[i].trim()
    if (!s) { continue }
    const om = s.match(/^\[([a-z])\]\s*(.*)$/i)
    if (om) {
      if (cur) objectives.push(cur)
      cur = { id: om[1].toLowerCase(), text: om[2] }
    } else if (cur) {
      // continuation line for objective text
      cur.text += ' ' + s
    }
  }
  if (cur) objectives.push(cur)
  return { title, description: desc.join(' '), objectives }
}

function main() {
  if (!fs.existsSync(inTxt)) {
    console.error(`Input text not found: ${inTxt}`)
    process.exit(1)
  }
  const lines = loadLines(inTxt)
  const sections = parseSections(lines)
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  let updated = 0
  for (const c of data) {
    const key = c.code
    const block = sections.get(key)
    if (!block) continue
    const { title, description, objectives } = extractFields(block)
    if (title) c.title = title
    if (description) c.description = description
    if (objectives && objectives.length) {
      // Keep done flags if same ids exist
      const doneMap = new Map((c.objectives||[]).map(o=>[o.id, o.done]))
      c.objectives = objectives.map(o=>({ id: o.id, text: o.text, done: !!doneMap.get(o.id) }))
    }
    updated++
  }
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log(`Updated ${updated} controls → ${outPath}`)
}

if (require.main === module) main()

