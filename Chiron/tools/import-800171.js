#!/usr/bin/env node
// Importer for NIST SP 800-171 catalog (Rev. 3 by default).
// Generates web/public/data/controls.sample.json with 110+ controls in Chiron format.
// Usage: node tools/import-800171.js [--rev3-url <url>] [--in <local_json>] [--out <path>]

const fs = require('fs')
const https = require('https')
const path = require('path')

const DEFAULT_REV3_URL = 'https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-171/rev3/json/NIST_SP800-171_rev3_catalog.json'

const args = process.argv.slice(2)
function arg(name, def) {
  const i = args.indexOf(name)
  return i >= 0 ? args[i+1] : def
}

const inFile = arg('--in', null)
const url = arg('--rev3-url', DEFAULT_REV3_URL)
const outFile = arg('--out', path.join('web','public','data','controls.sample.json'))

function fetchJson(u) {
  return new Promise((resolve, reject) => {
    https.get(u, { headers: { 'User-Agent': 'chiron-importer' }}, (res) => {
      if (res.statusCode !== 200) return reject(new Error('HTTP '+res.statusCode))
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (c) => data += c)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

function loadJsonLocal(p) {
  return JSON.parse(fs.readFileSync(p,'utf8'))
}

function mapFamilyKeyFromTitle(title) {
  // Expect titles like "3.1 Access Control"; take the leading 3.x
  const m = /^\s*(3\.[0-9]+)/.exec(title || '')
  return m ? m[1] : null
}

const FAMILY_MAP = {
  '3.1': 'AC', '3.2': 'AT', '3.3': 'AU', '3.4': 'CM', '3.5': 'IA', '3.6': 'IR',
  '3.7': 'MA', '3.8': 'MP', '3.9': 'PE', '3.10': 'PS', '3.11': 'RA', '3.12': 'CA',
  '3.13': 'SC', '3.14': 'SI'
}

function extractControlNumber(ctrl) {
  // Try props first (common in OSCAL) then id/title text.
  const props = ctrl.props || []
  for (const p of props) {
    if ((p.name === 'label' || p.name === 'sort-id' || p.name === 'alt-identifier') && /3\.[0-9]+\.[0-9]+/.test(p.value)) {
      return p.value.match(/3\.[0-9]+\.[0-9]+/)[0]
    }
  }
  if (ctrl.id && /3\.[0-9]+\.[0-9]+/.test(ctrl.id)) return ctrl.id.match(/3\.[0-9]+\.[0-9]+/)[0]
  if (ctrl.title && /3\.[0-9]+\.[0-9]+/.test(ctrl.title)) return ctrl.title.match(/3\.[0-9]+\.[0-9]+/)[0]
  return null
}

function controlTitle(ctrl) {
  // Prefer statement/part text if available, else ctrl.title
  if (ctrl.title) return String(ctrl.title).trim()
  const parts = ctrl.parts || []
  const s = parts.find(p => p.name === 'statement')
  if (s && s.prose) return String(s.prose).trim()
  return 'Untitled Control'
}

function transform(catalog) {
  const groups = catalog.catalog && catalog.catalog.groups || []
  const controls = []
  for (const g of groups) {
    const famKey = mapFamilyKeyFromTitle(g.title || '')
    const fam = FAMILY_MAP[famKey] || 'General'
    for (const c of (g.controls || [])) {
      const num = extractControlNumber(c)
      if (!num) continue
      const code = `${fam}.L2-${num}`
      controls.push({
        id: code,
        code,
        family: fam,
        title: controlTitle(c).replace(/^\s*3\.[0-9]+\.[0-9]+\s*-*\s*/,'').trim(),
        objectives: [],
      })
    }
  }
  // Sort by family order, then numeric parts
  const order = ['AC','AT','AU','CM','IA','IR','MA','MP','PE','PS','RA','CA','SC','SI']
  function famIdx(f) { const i = order.indexOf(f); return i < 0 ? 999 : i }
  function parts(c) { const m = c.code.match(/(\d+)\.(\d+)$/); return m ? [Number(m[1]), Number(m[2])] : [999,999] }
  controls.sort((a,b)=> famIdx(a.family)-famIdx(b.family) || parts(a)[0]-parts(b)[0] || parts(a)[1]-parts(b)[1])
  return controls
}

async function main() {
  try {
    const data = inFile ? loadJsonLocal(inFile) : await fetchJson(url)
    const out = transform(data)
    fs.mkdirSync(path.dirname(outFile), { recursive: true })
    fs.writeFileSync(outFile, JSON.stringify(out, null, 2))
    console.log(`Wrote ${out.length} controls to ${outFile}`)
  } catch (e) {
    console.error('Import failed:', e.message)
    process.exit(1)
  }
}

if (require.main === module) main()

