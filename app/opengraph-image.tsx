import { ImageResponse } from "next/og";

// Generated Open Graph image — a dark IDE-midnight-themed card used as the
// social preview when the site is shared (Slack / LinkedIn / Twitter).
// No static image asset exists, so this is rendered at build time.

export const runtime = "edge";
export const alt = "Saurabh Jalendra · AI Research Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Midnight theme tokens (from lib/theme.ts).
const EDITOR_BG = "#1f1f23";
const TITLEBAR = "#16161a";
const FG = "#e6e6ed";
const FG_DIM = "rgba(205,214,223,0.6)";
const ACCENT = "#c8a4ff";
const GREEN = "#7be39a";
const BORDER = "rgba(255,255,255,0.08)";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: EDITOR_BG,
          fontFamily: "monospace",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 56,
            padding: "0 28px",
            background: TITLEBAR,
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#ff5f57" }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#febc2e" }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#28c840" }} />
          <div style={{ marginLeft: 18, color: FG_DIM, fontSize: 22 }}>
            ~/saurabhjalendra
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: GREEN,
              fontSize: 26,
              letterSpacing: 4,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: GREEN,
              }}
            />
            AVAILABLE — Q3 2026
          </div>
          <div
            style={{
              display: "flex",
              color: FG,
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            Saurabh Jalendra
          </div>
          <div
            style={{
              display: "flex",
              color: ACCENT,
              fontSize: 42,
              marginTop: 22,
            }}
          >
            AI Research Engineer
          </div>
          <div
            style={{
              display: "flex",
              color: FG_DIM,
              fontSize: 26,
              marginTop: 40,
            }}
          >
            world models · reinforcement learning · empirical AI safety
          </div>
        </div>

        {/* Status bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 48,
            padding: "0 28px",
            background: ACCENT,
            color: TITLEBAR,
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          <div style={{ display: "flex" }}>⎇ main</div>
          <div style={{ display: "flex" }}>saurabhjalendra.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
