// Markdown preview pane — renders .md files as formatted typography
// instead of source tokens. Toggled per-tab via the breadcrumb segmented
// control or ⇧⌘V (Shift-Cmd/Ctrl-V).
//
// Tiny hand-rolled parser: handles headings, paragraphs, lists,
// blockquotes, code fences, and inline bold/italic/code/links/placeholder.
// Production should swap this for a real MDX pipeline; this is enough for
// the prototype to feel real.

(function () {
  const { useContext } = React;

  function MarkdownPreview({ body, openFile }) {
    const T = useContext(window.ThemeCtx);
    const blocks = parse(body);
    return (
      <div style={{
        flex: 1, overflow: 'auto', padding: '36px 56px 80px',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        color: T.chrome.fg, fontSize: 15, lineHeight: 1.65,
      }}>
        <article style={{maxWidth: 680, margin: '0 auto'}}>
          {blocks.map((b, i) => <Block key={i} block={b} T={T} openFile={openFile}/>)}
        </article>
      </div>
    );
  }

  function parse(body) {
    const lines = body.split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const ln = lines[i];

      // Code fence ```lang ... ```
      if (ln.startsWith('```')) {
        const lang = ln.slice(3).trim();
        const buf = []; i++;
        while (i < lines.length && !lines[i].startsWith('```')) { buf.push(lines[i]); i++; }
        i++; // closing fence
        out.push({ kind:'code', lang, text: buf.join('\n') });
        continue;
      }

      // Heading
      const h = ln.match(/^(#{1,6})\s+(.*)$/);
      if (h) { out.push({ kind:'heading', depth: h[1].length, text: h[2] }); i++; continue; }

      // HTML comment — render dimmed instead of hiding (it carries the role/location)
      if (ln.startsWith('<!--') && ln.endsWith('-->')) {
        out.push({ kind:'comment', text: ln.replace(/^<!--\s*|\s*-->$/g, '') });
        i++; continue;
      }

      // Italic-only line (legend style — used in writing/* dates)
      if (ln.startsWith('*') && ln.endsWith('*') && ln.length > 2 && !ln.includes(' *')) {
        out.push({ kind:'em', text: ln.slice(1, -1) }); i++; continue;
      }

      // Blockquote
      if (ln.startsWith('> ')) {
        const buf = [];
        while (i < lines.length && lines[i].startsWith('> ')) { buf.push(lines[i].slice(2)); i++; }
        out.push({ kind:'quote', lines: buf });
        continue;
      }

      // Bullet list (handles - and 1.-style numbered)
      if (/^\s*[-*]\s/.test(ln)) {
        const items = [];
        while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*[-*]\s/, ''));
          i++;
        }
        out.push({ kind:'list', items });
        continue;
      }

      // Blank line
      if (!ln.trim()) { i++; continue; }

      // Paragraph (consecutive non-special lines)
      const para = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^#{1,6}\s/.test(lines[i]) &&
        !lines[i].startsWith('> ') &&
        !lines[i].startsWith('```') &&
        !/^\s*[-*]\s/.test(lines[i]) &&
        !lines[i].startsWith('<!--')
      ) {
        para.push(lines[i]); i++;
      }
      if (para.length) out.push({ kind:'para', text: para.join(' ') });
    }
    return out;
  }

  function Block({ block, T, openFile }) {
    const b = block;
    if (b.kind === 'heading') {
      const text = inline(b.text, T, openFile);
      if (b.depth === 1) return <h1 style={h1Style(T)}>{text}</h1>;
      if (b.depth === 2) return <h2 style={h2Style(T)}>{text}</h2>;
      return <h3 style={h3Style(T)}>{text}</h3>;
    }
    if (b.kind === 'comment') {
      return <div style={{
        color: T.chrome.fgFainter, fontStyle:'italic', fontSize: 13,
        margin: '0 0 14px', fontFamily:'"Geist Mono",monospace',
      }}>{b.text}</div>;
    }
    if (b.kind === 'em') {
      return <p style={{
        color: T.chrome.fgDim, fontStyle:'italic',
        margin: '6px 0 16px', fontSize: 13.5,
        fontFamily:'"Geist Mono",monospace',
      }}>{b.text}</p>;
    }
    if (b.kind === 'para') return <p style={pStyle(T)}>{inline(b.text, T, openFile)}</p>;
    if (b.kind === 'quote') {
      return (
        <blockquote style={{
          margin: '22px 0', padding: '12px 18px',
          borderLeft: '3px solid ' + T.accent,
          background: T.chrome.hoverBg,
          borderRadius: '0 10px 10px 0',
          color: T.chrome.fg, fontStyle: 'italic',
          fontSize: 16, lineHeight: 1.55,
        }}>
          {b.lines.map((l, i) => <div key={i}>{inline(l, T, openFile)}</div>)}
        </blockquote>
      );
    }
    if (b.kind === 'list') {
      return (
        <ul style={{margin:'14px 0 18px', padding: 0, listStyle:'none'}}>
          {b.items.map((it, i) => (
            <li key={i} style={{display:'flex', gap:12, padding:'5px 0', alignItems:'flex-start'}}>
              <span style={{color: T.accent, flex:'0 0 auto', marginTop:2, fontFamily:'"Geist Mono",monospace', fontSize:13}}>—</span>
              <span style={{color: T.chrome.fg, lineHeight: 1.65}}>{inline(it, T, openFile)}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (b.kind === 'code') {
      return <CodeBlock body={b.text} lang={b.lang} T={T}/>;
    }
    return null;
  }

  function CodeBlock({ body, lang, T }) {
    const [copied, setCopied] = React.useState(false);
    const tokens = window.highlight(lang || 'md', body);
    function copy() {
      navigator.clipboard?.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
    return (
      <div style={{
        position:'relative', margin:'20px 0',
      }}
        onMouseEnter={(e) => { const b = e.currentTarget.querySelector('[data-copy]'); if (b) b.style.opacity = 1; }}
        onMouseLeave={(e) => { const b = e.currentTarget.querySelector('[data-copy]'); if (b && !copied) b.style.opacity = 0; }}
      >
        <button
          data-copy
          onClick={copy}
          style={{
            position:'absolute', top:8, right:8, zIndex:1,
            padding:'4px 9px', borderRadius:5, border:'1px solid '+T.chrome.border,
            background: copied ? T.accent : T.chrome.editor,
            color: copied ? T.chrome.statusBarFg : T.chrome.fgDim,
            fontFamily:'"Geist Mono",monospace', fontSize:10.5,
            letterSpacing:'0.12em', textTransform:'uppercase',
            cursor:'pointer', opacity: copied ? 1 : 0,
            transition:'opacity .15s, background .15s, color .15s',
          }}
          onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = T.chrome.fg; }}
          onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = T.chrome.fgDim; }}
        >{copied ? '✓ copied' : 'copy'}</button>
        <pre style={{
          margin: 0, padding: '14px 18px',
          background: T.chrome.titlebar,
          border: '1px solid ' + T.chrome.border,
          borderRadius: 10,
          fontFamily: '"Geist Mono","JetBrains Mono",monospace',
          fontSize: 13, lineHeight: 1.65, overflow: 'auto',
        }}>
          {tokens.map((toks, i) => (
            <div key={i}>
              {toks.length === 0 && <span> </span>}
              {toks.map((tok, j) => (
                <span key={j} style={tokenStyle(tok.t, T)}>{tok.v}</span>
              ))}
            </div>
          ))}
        </pre>
      </div>
    );
  }

  function tokenStyle(t, T) {
    const c = T.syntax[t] || T.syntax.text;
    if (t === 'bold')     return { color: c, fontWeight: 700 };
    if (t === 'emItalic') return { color: c, fontStyle: 'italic' };
    if (t === 'comment')  return { color: c, fontStyle: 'italic' };
    return { color: c };
  }

  function h1Style(T) {
    return {
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      fontSize: 34, fontWeight: 700, color: T.chrome.fg,
      margin: '14px 0 14px', lineHeight: 1.15,
      letterSpacing: '-0.012em',
    };
  }
  function h2Style(T) {
    return {
      fontSize: 22, fontWeight: 700, color: T.chrome.fg,
      margin: '34px 0 10px', lineHeight: 1.25,
      letterSpacing: '-0.005em',
    };
  }
  function h3Style(T) {
    return {
      fontSize: 17, fontWeight: 600, color: T.chrome.fg,
      margin: '24px 0 6px',
      fontFamily: '"Geist Mono",monospace',
      letterSpacing: '0.01em',
    };
  }
  function pStyle(T) {
    return { color: T.chrome.fg, margin: '0 0 16px', fontSize: 15.5, lineHeight: 1.7 };
  }

  // Inline parser for **bold**, *italic*, `code`, [text](url), [placeholder]
  function inline(s, T, openFile) {
    const out = [];
    let i = 0, key = 0;
    while (i < s.length) {
      const rest = s.slice(i);
      let m;
      if ((m = rest.match(/^\*\*([^*]+)\*\*/))) {
        out.push(<strong key={key++} style={{fontWeight:700, color: T.chrome.fg}}>{m[1]}</strong>);
        i += m[0].length; continue;
      }
      if ((m = rest.match(/^`([^`]+)`/))) {
        out.push(<code key={key++} style={{
          background: T.chrome.hoverBg, color: T.syntax.code,
          padding: '1px 6px', borderRadius: 4, fontSize: '0.92em',
          fontFamily: '"Geist Mono",monospace',
        }}>{m[1]}</code>);
        i += m[0].length; continue;
      }
      if ((m = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/))) {
        const text = m[1], href = m[2];
        const isInternal = !/^https?:|^mailto:|^#/.test(href);
        out.push(
          <a key={key++} href={href}
            onClick={(e) => { if (isInternal && openFile) { e.preventDefault(); openFile(href); } }}
            target={isInternal ? undefined : '_blank'} rel="noreferrer"
            style={{
              color: T.syntax.linkText, textDecoration: 'underline',
              textUnderlineOffset: 3, textDecorationColor: T.chrome.borderStrong,
              cursor: 'pointer',
            }}>{text}</a>
        );
        i += m[0].length; continue;
      }
      // Placeholder like [bracketed]
      if ((m = rest.match(/^\[([^\]]+)\]/))) {
        out.push(<span key={key++} style={{
          background: 'rgba(255,170,107,0.14)',
          color: T.syntax.placeholder || '#ffa86b',
          padding: '0 5px', borderRadius: 3, fontWeight: 500,
        }}>{m[0]}</span>);
        i += m[0].length; continue;
      }
      if ((m = rest.match(/^\*([^*]+)\*/))) {
        out.push(<em key={key++} style={{color: T.syntax.emItalic, fontStyle:'italic'}}>{m[1]}</em>);
        i += m[0].length; continue;
      }
      // Plain character — coalesce later by appending to a buffer
      const last = out[out.length - 1];
      if (typeof last === 'string') out[out.length - 1] = last + s[i];
      else out.push(s[i]);
      i++;
    }
    return out;
  }

  window.MarkdownPreview = MarkdownPreview;
})();
