// Tiny syntax highlighter. Not a real parser — just enough regex per
// language to look like the editor is actually colorizing tokens.
//
// Exports:  highlight(lang, body) -> [[ {t: tokenType, v: string} ]]
//             outer array = lines; inner array = tokens within the line.
//             token types are mapped to colors in editor.tsx via theme.

import type { Lang, Token, OutlineEntry } from '@/types/ide';

function tk(t: string, v: string): Token {
  return { t, v };
}

// ── Markdown ──────────────────────────────────────────────────────
function hl_md(line: string): Token[] {
  if (line.startsWith('# '))     return [tk('hdrHash','# '),    tk('hdr1', line.slice(2))];
  if (line.startsWith('## '))    return [tk('hdrHash','## '),   tk('hdr2', line.slice(3))];
  if (line.startsWith('### '))   return [tk('hdrHash','### '),  tk('hdr3', line.slice(4))];
  if (line.startsWith('> '))     return [tk('quote','> '),      tk('quoteText', line.slice(2))];
  if (line.startsWith('<!--') && line.endsWith('-->')) return [tk('comment', line)];
  if (line.startsWith('_') && line.endsWith('_')) return [tk('emItalic', line)];
  if (/^\s*-\s/.test(line)) {
    const m = line.match(/^(\s*)(-)\s(.*)$/);
    if (m) return [tk('punct', m[1]), tk('listBullet', '- '), ...inline(m[3])];
  }
  if (/^\s*`/.test(line) && line.trim().startsWith('`') && line.trim().endsWith('`')) {
    return [tk('code', line)];
  }
  return inline(line);
}

function inline(s: string): Token[] {
  const out: Token[] = [];
  // Walk the string; pick off **bold**, `code`, [text](url), *italic*.
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    let m: RegExpMatchArray | null;
    if ((m = rest.match(/^\*\*([^*]+)\*\*/)))      { out.push(tk('bold',  m[0])); i += m[0].length; continue; }
    if ((m = rest.match(/^`([^`]+)`/)))            { out.push(tk('code',  m[0])); i += m[0].length; continue; }
    if ((m = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/))) {
      out.push(tk('punct','['), tk('linkText', m[1]), tk('punct','](`'), tk('linkHref', m[2]), tk('punct',')'));
      i += m[0].length; continue;
    }
    if ((m = rest.match(/^\[([^\]]+)\]/)))         { out.push(tk('placeholder', m[0])); i += m[0].length; continue; }
    if ((m = rest.match(/^\*([^*]+)\*/)))          { out.push(tk('emItalic', m[0])); i += m[0].length; continue; }
    out.push(tk('text', s[i])); i++;
  }
  return mergeAdjacent(out);
}

function mergeAdjacent(toks: Token[]): Token[] {
  const out: Token[] = [];
  for (const t of toks) {
    const last = out[out.length - 1];
    if (last && last.t === t.t) last.v += t.v;
    else out.push({ ...t });
  }
  return out;
}

// ── JSON ──────────────────────────────────────────────────────────
function hl_json(line: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);
    let m: RegExpMatchArray | null;
    // whitespace
    if ((m = rest.match(/^\s+/))) { out.push(tk('text', m[0])); i += m[0].length; continue; }
    // key:  "foo":
    if ((m = rest.match(/^"([^"\\]|\\.)*"(?=\s*:)/))) { out.push(tk('jsonKey', m[0])); i += m[0].length; continue; }
    // string value
    if ((m = rest.match(/^"([^"\\]|\\.)*"/)))         { out.push(tk('jsonStr', m[0])); i += m[0].length; continue; }
    // number
    if ((m = rest.match(/^-?\d+(\.\d+)?/)))           { out.push(tk('jsonNum', m[0])); i += m[0].length; continue; }
    // boolean / null
    if ((m = rest.match(/^(true|false|null)\b/)))     { out.push(tk('jsonKw',  m[0])); i += m[0].length; continue; }
    // punct
    if ('{}[],:'.includes(line[i])) { out.push(tk('punct', line[i])); i++; continue; }
    out.push(tk('text', line[i])); i++;
  }
  return mergeAdjacent(out);
}

// ── YAML ──────────────────────────────────────────────────────────
function hl_yaml(line: string): Token[] {
  if (line.trimStart().startsWith('#')) return [tk('comment', line)];
  const m = line.match(/^(\s*)([A-Za-z0-9_./-]+)(\s*:)(\s*)(.*)$/);
  if (m) {
    const [, lead, key, colon, sp, val] = m;
    const valToks: Token[] = [];
    const trim = val.trim();
    if (!trim) {
      // bare key
    } else if (/^\[.*\]$/.test(trim) || /^\{.*\}$/.test(trim)) {
      // inline collection — pick out strings / numbers / punct
      let i = 0;
      while (i < val.length) {
        const c = val[i];
        if ('[]{},'.includes(c)) { valToks.push(tk('punct', c)); i++; continue; }
        const rest = val.slice(i);
        let mm: RegExpMatchArray | null;
        if ((mm = rest.match(/^\s+/)))                  { valToks.push(tk('text', mm[0])); i += mm[0].length; continue; }
        if ((mm = rest.match(/^-?\d+(\.\d+)?/)))        { valToks.push(tk('jsonNum', mm[0])); i += mm[0].length; continue; }
        if ((mm = rest.match(/^"([^"\\]|\\.)*"/)))      { valToks.push(tk('jsonStr', mm[0])); i += mm[0].length; continue; }
        if ((mm = rest.match(/^[A-Za-z][\w-]*/)))       { valToks.push(tk('yamlBare', mm[0])); i += mm[0].length; continue; }
        valToks.push(tk('text', val[i])); i++;
      }
    } else if (/^["']/.test(trim)) {
      valToks.push(tk('jsonStr', val));
    } else if (/^-?\d+(\.\d+)?$/.test(trim)) {
      valToks.push(tk('jsonNum', val));
    } else {
      valToks.push(tk('yamlBare', val));
    }
    return [tk('text', lead), tk('yamlKey', key), tk('punct', colon), tk('text', sp), ...valToks];
  }
  return [tk('text', line)];
}

// ── INI / gitconfig ───────────────────────────────────────────────
function hl_ini(line: string): Token[] {
  if (line.startsWith('#'))                    return [tk('comment', line)];
  if (/^\[.+\]$/.test(line.trim()))            return [tk('iniSection', line)];
  const m = line.match(/^(\s*)([^=]+?)(\s*=\s*)(.*)$/);
  if (m) return [tk('text', m[1]), tk('yamlKey', m[2]), tk('punct', m[3]), tk('yamlBare', m[4])];
  return [tk('text', line)];
}

const PER_LANG: Record<string, (line: string) => Token[]> = {
  md: hl_md,
  json: hl_json,
  yaml: hl_yaml,
  ini: hl_ini,
};

export function highlight(lang: Lang | string, body: string): Token[][] {
  const fn = PER_LANG[lang] || ((l: string) => [tk('text', l)]);
  return body.split('\n').map(fn);
}

// Headings → outline. Returns [{depth, text, line}]
export function extractOutline(body: string): OutlineEntry[] {
  const out: OutlineEntry[] = [];
  body.split('\n').forEach((line, i) => {
    const m = line.match(/^(#{1,3})\s+(.*)$/);
    if (m) out.push({ depth: m[1].length, text: m[2], line: i });
  });
  return out;
}
