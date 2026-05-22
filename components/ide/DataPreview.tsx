"use client";

// Data-file preview pane — renders structured content files as recruiter-
// friendly views instead of raw source. Toggled per-tab via the breadcrumb
// segmented control or ⇧⌘V, exactly like the markdown preview.
//
//   experience.json → a career timeline (roles, education, certs, stack)
//   contact.yaml    → a contact card (links, availability, response time)
//
// JSON parses natively; YAML uses a tiny subset parser (parseMiniYaml) since
// contact.yaml has a fixed shallow shape — no js-yaml dependency needed.
// Both paths are wrapped in try/catch so a malformed edit degrades to a
// readable error rather than a blank pane.

import React, { useContext } from 'react';
import { ThemeCtx } from '@/lib/theme';

const STATUS_GREEN = '#3fb950'; // semantic "available" — intentionally theme-independent

// ── date formatting ────────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2025-02" → "Feb 2025" · "2026-Q3" → "Q3 2026" · anything else passes through
function fmtMonth(s: string): string {
  if (!s) return '';
  const q = s.match(/^(\d{4})-Q([1-4])$/);
  if (q) return `Q${q[2]} ${q[1]}`;
  const m = s.match(/^(\d{4})-(\d{2})$/);
  if (m) return `${MONTHS[+m[2] - 1]} ${m[1]}`;
  return s;
}

function span(from: string, to?: string): string {
  return `${fmtMonth(from)} – ${to ? fmtMonth(to) : 'Present'}`;
}

// ── tiny YAML-subset parser ─────────────────────────────────────────────────
// Handles: flat `key: value`, one level of 2-space-indented nested maps,
// inline `[a, b, c]` arrays, `# comments`, and quoted strings. That is the
// full shape of contact.yaml — nothing more is needed.
type YamlLeaf = string | string[];
type YamlValue = YamlLeaf | Record<string, YamlLeaf>;

function parseVal(v: string): YamlLeaf {
  v = v.trim();
  if (v.startsWith('[') && v.endsWith(']')) {
    return v
      .slice(1, -1)
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function parseMiniYaml(src: string): Record<string, YamlValue> {
  const out: Record<string, YamlValue> = {};
  let curKey: string | null = null;
  for (const raw of src.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indent = line.length - line.trimStart().length;
    const m = line.trim().match(/^([\w-]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    if (indent === 0) {
      if (rawVal === '') {
        out[key] = {};
        curKey = key;
      } else {
        out[key] = parseVal(rawVal);
        curKey = null;
      }
    } else if (curKey) {
      const parent = out[curKey];
      if (parent && typeof parent === 'object' && !Array.isArray(parent)) {
        (parent as Record<string, YamlLeaf>)[key] = parseVal(rawVal);
      }
    }
  }
  return out;
}

// ── shared bits ─────────────────────────────────────────────────────────────
interface Theme {
  chrome: { fg: string; fgDim: string; fgFainter: string; border: string; editor: string; hoverBg: string };
  accent: string;
}

function SectionLabel({ T, children }: { T: Theme; children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: '"Geist Mono", monospace',
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: T.chrome.fgFainter,
        margin: '34px 0 16px',
      }}
    >
      {children}
    </div>
  );
}

function Tag({ T, label, muted }: { T: Theme; label: string; muted?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 9px',
        borderRadius: 5,
        fontSize: 12,
        fontFamily: '"Geist Mono", monospace',
        background: T.chrome.hoverBg,
        color: muted ? T.chrome.fgFainter : T.chrome.fgDim,
        border: '1px solid ' + T.chrome.border,
      }}
    >
      {label}
    </span>
  );
}

// ── career timeline (experience.json) ───────────────────────────────────────
interface ExperienceData {
  role?: string;
  based_in?: string;
  remote?: boolean;
  available_from?: string;
  current?: { from: string; company: string; title: string; scope?: string };
  history?: Array<{ from: string; to?: string; company: string; title: string; note?: string }>;
  education?: Array<{
    degree: string;
    school: string;
    from: string;
    to: string;
    highlights?: string[];
    credential_id?: string;
  }>;
  certifications?: Array<{ name: string; issuer: string; issued: string }>;
  stack?: { love?: string[]; fluent?: string[]; learning?: string[] };
}

function TimelineEntry({
  T,
  title,
  company,
  dates,
  note,
  current,
}: {
  T: Theme;
  title: string;
  company: string;
  dates: string;
  note?: string;
  current?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 16, paddingBottom: 22 }}>
      {/* dot column — the connecting line is drawn by the parent */}
      <div style={{ position: 'relative', width: 16, flex: '0 0 16px' }}>
        <div
          style={{
            position: 'absolute',
            left: 1,
            top: 4,
            width: current ? 13 : 11,
            height: current ? 13 : 11,
            borderRadius: '50%',
            background: current ? T.accent : T.chrome.editor,
            border: '2px solid ' + (current ? T.accent : T.chrome.fgFainter),
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15.5, fontWeight: 600, color: T.chrome.fg }}>{title}</span>
          {current && (
            <span
              style={{
                fontFamily: '"Geist Mono", monospace',
                fontSize: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: STATUS_GREEN,
              }}
            >
              ● current
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.chrome.fgDim,
            margin: '3px 0 0',
            fontFamily: '"Geist Mono", monospace',
          }}
        >
          {company} · {dates}
        </div>
        {note && (
          <div style={{ fontSize: 13.5, color: T.chrome.fgFainter, marginTop: 8, lineHeight: 1.6 }}>{note}</div>
        )}
      </div>
    </div>
  );
}

function CareerTimeline({ T, data }: { T: Theme; data: ExperienceData }) {
  return (
    <>
      {/* header */}
      <div style={{ fontSize: 21, fontWeight: 700, color: T.chrome.fg, lineHeight: 1.35 }}>
        {data.role || 'Experience'}
      </div>
      <div
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 12.5,
          color: T.chrome.fgFainter,
          marginTop: 8,
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        {data.based_in && <span>📍 {data.based_in}</span>}
        {data.remote && <span>· remote</span>}
        {data.available_from && (
          <span style={{ color: STATUS_GREEN }}>● available {fmtMonth(data.available_from)}</span>
        )}
      </div>

      {/* experience timeline */}
      <SectionLabel T={T}>Experience</SectionLabel>
      <div style={{ position: 'relative' }}>
        {/* the vertical thread behind the dots */}
        <div
          style={{
            position: 'absolute',
            left: 7,
            top: 10,
            bottom: 18,
            width: 2,
            background: T.chrome.border,
          }}
        />
        {data.current && (
          <TimelineEntry
            T={T}
            current
            title={data.current.title}
            company={data.current.company}
            dates={span(data.current.from)}
            note={data.current.scope}
          />
        )}
        {(data.history || []).map((h, i) => (
          <TimelineEntry
            key={i}
            T={T}
            title={h.title}
            company={h.company}
            dates={span(h.from, h.to)}
            note={h.note}
          />
        ))}
      </div>

      {/* education */}
      {data.education && data.education.length > 0 && (
        <>
          <SectionLabel T={T}>Education</SectionLabel>
          {data.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.chrome.fg }}>{e.degree}</div>
              <div
                style={{
                  fontSize: 13,
                  color: T.chrome.fgDim,
                  margin: '3px 0',
                  fontFamily: '"Geist Mono", monospace',
                }}
              >
                {e.school} · {span(e.from, e.to)}
              </div>
              {e.highlights && (
                <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                  {e.highlights.map((h, j) => (
                    <li key={j} style={{ fontSize: 13.5, color: T.chrome.fgFainter, lineHeight: 1.6 }}>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {/* certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <>
          <SectionLabel T={T}>Certifications ({data.certifications.length})</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
            {data.certifications.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  border: '1px solid ' + T.chrome.border,
                  borderRadius: 7,
                  background: T.chrome.hoverBg,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: T.chrome.fg, lineHeight: 1.4 }}>{c.name}</div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: T.chrome.fgFainter,
                    marginTop: 4,
                    fontFamily: '"Geist Mono", monospace',
                  }}
                >
                  {c.issuer} · {fmtMonth(c.issued)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* stack */}
      {data.stack && (
        <>
          <SectionLabel T={T}>Stack</SectionLabel>
          {(['love', 'fluent', 'learning'] as const).map((tier) => {
            const items = data.stack?.[tier];
            if (!items || items.length === 0) return null;
            return (
              <div key={tier} style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'baseline' }}>
                <span
                  style={{
                    fontFamily: '"Geist Mono", monospace',
                    fontSize: 11.5,
                    color: T.chrome.fgFainter,
                    width: 64,
                    flex: '0 0 64px',
                  }}
                >
                  {tier}
                </span>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {items.map((it) => (
                    <Tag key={it} T={T} label={it} muted={tier === 'learning'} />
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

// ── contact card (contact.yaml) ─────────────────────────────────────────────
const LINK_HREF: Record<string, (v: string) => string> = {
  email: (v) => `mailto:${v}`,
  github: (v) => `https://github.com/${v.replace(/^@/, '')}`,
  linkedin: (v) => `https://linkedin.com/${v.replace(/^\/+/, '')}`,
  website: (v) => `https://${v.replace(/^https?:\/\//, '')}`,
};

function LinkRow({ T, label, value }: { T: Theme; label: string; value: string }) {
  const href = LINK_HREF[label]?.(value);
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, padding: '7px 0' }}>
      <span
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: 12,
          color: T.chrome.fgFainter,
          width: 78,
          flex: '0 0 78px',
        }}
      >
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target={label === 'email' ? undefined : '_blank'}
          rel="noopener noreferrer"
          style={{ fontSize: 14, color: T.accent, textDecoration: 'none', wordBreak: 'break-word' }}
        >
          {value}
        </a>
      ) : (
        <span style={{ fontSize: 14, color: T.chrome.fg }}>{value}</span>
      )}
    </div>
  );
}

function asText(v: YamlValue | undefined): string {
  return typeof v === 'string' ? v : '';
}
function asMap(v: YamlValue | undefined): Record<string, YamlLeaf> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, YamlLeaf>) : {};
}

function ContactCard({ T, data }: { T: Theme; data: Record<string, YamlValue> }) {
  const availability = asMap(data.availability);
  const response = asMap(data.response_time);
  const modes = Array.isArray(availability.modes) ? availability.modes : [];
  const notDoing = Array.isArray(availability.not_doing) ? availability.not_doing : [];
  const status = asText(availability.status as YamlValue);

  return (
    <>
      <div style={{ fontSize: 21, fontWeight: 700, color: T.chrome.fg }}>Get in touch</div>
      <div style={{ fontSize: 13.5, color: T.chrome.fgFainter, marginTop: 6 }}>
        Email is best — it actually gets read.
      </div>

      {/* links */}
      <div style={{ marginTop: 22, borderTop: '1px solid ' + T.chrome.border, paddingTop: 8 }}>
        {(['email', 'github', 'linkedin', 'website'] as const).map((k) => {
          const v = asText(data[k]);
          return v ? <LinkRow key={k} T={T} label={k} value={v} /> : null;
        })}
      </div>

      {/* availability */}
      {(status || modes.length > 0) && (
        <>
          <SectionLabel T={T}>Availability</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: status === 'available' ? STATUS_GREEN : T.chrome.fgFainter,
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: 14, color: T.chrome.fg, fontWeight: 600 }}>
              {status || 'unknown'}
            </span>
            {availability.start_date && (
              <span style={{ fontSize: 13, color: T.chrome.fgFainter }}>
                from {fmtMonth(asText(availability.start_date as YamlValue))}
              </span>
            )}
          </div>
          {modes.length > 0 && (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
              {modes.map((m) => (
                <Tag key={m} T={T} label={m} />
              ))}
            </div>
          )}
          {notDoing.length > 0 && (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 11.5, color: T.chrome.fgFainter, fontFamily: '"Geist Mono", monospace' }}>
                not:
              </span>
              {notDoing.map((m) => (
                <Tag key={m} T={T} label={m} muted />
              ))}
            </div>
          )}
        </>
      )}

      {/* response time */}
      {(response.median || response.signature) && (
        <>
          <SectionLabel T={T}>Response time</SectionLabel>
          <div style={{ fontSize: 13.5, color: T.chrome.fgDim, fontFamily: '"Geist Mono", monospace' }}>
            {asText(response.median as YamlValue) && <>median {asText(response.median as YamlValue)}</>}
            {asText(response.worst as YamlValue) && <> · worst {asText(response.worst as YamlValue)}</>}
          </div>
          {asText(response.signature as YamlValue) && (
            <div style={{ fontSize: 13.5, color: T.chrome.fgFainter, fontStyle: 'italic', marginTop: 8 }}>
              “{asText(response.signature as YamlValue)}”
            </div>
          )}
        </>
      )}

      {/* footer facts */}
      <div
        style={{
          marginTop: 34,
          paddingTop: 16,
          borderTop: '1px solid ' + T.chrome.border,
          display: 'flex',
          gap: 22,
          flexWrap: 'wrap',
          fontFamily: '"Geist Mono", monospace',
          fontSize: 12,
          color: T.chrome.fgFainter,
        }}
      >
        {asText(data.based_in) && <span>📍 {asText(data.based_in)}</span>}
        {asText(data.timezone) && <span>🕑 {asText(data.timezone)}</span>}
      </div>
      {asText(data.prefers) && (
        <div style={{ fontSize: 13, color: T.chrome.fgFainter, fontStyle: 'italic', marginTop: 10 }}>
          {asText(data.prefers)}
        </div>
      )}
    </>
  );
}

// ── error fallback ──────────────────────────────────────────────────────────
function ParseError({ T, kind, message }: { T: Theme; kind: string; message: string }) {
  return (
    <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 13, color: T.chrome.fgFainter }}>
      <div style={{ color: T.chrome.fgDim }}>could not render {kind} preview</div>
      <div style={{ marginTop: 8 }}>{message}</div>
      <div style={{ marginTop: 8 }}>switch to the source view to see the raw file.</div>
    </div>
  );
}

// ── entry point ─────────────────────────────────────────────────────────────
interface DataPreviewProps {
  body: string;
  path: string;
}

export default function DataPreview({ body, path }: DataPreviewProps) {
  const T = useContext(ThemeCtx) as Theme;

  let content: React.ReactNode;
  if (path === 'experience.json') {
    try {
      content = <CareerTimeline T={T} data={JSON.parse(body) as ExperienceData} />;
    } catch (e) {
      content = <ParseError T={T} kind="JSON" message={e instanceof Error ? e.message : String(e)} />;
    }
  } else if (path === 'contact.yaml') {
    try {
      content = <ContactCard T={T} data={parseMiniYaml(body)} />;
    } catch (e) {
      content = <ParseError T={T} kind="YAML" message={e instanceof Error ? e.message : String(e)} />;
    }
  } else {
    content = <ParseError T={T} kind="data" message="no renderer registered for this file" />;
  }

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '36px 56px 80px',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        color: T.chrome.fg,
      }}
    >
      <article style={{ maxWidth: 680, margin: '0 auto' }}>{content}</article>
    </div>
  );
}
