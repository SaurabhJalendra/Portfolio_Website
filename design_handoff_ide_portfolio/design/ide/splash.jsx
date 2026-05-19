// Boot splash — first-visit-only "workspace loading" sequence.
// Sits as a full-viewport overlay on first mount in a session; once it
// finishes (or the user clicks / hits Escape) it fades out and unmounts.
// Subsequent navigations within the same tab skip it entirely.
//
// Persona-correct: speaks like a real toolchain ("resolved 13 files"),
// not like a marketing splash. Lines are characterful, time-of-day
// greeting near the end, then a tip teaser.

const { useState: useStateSp, useEffect: useEffectSp, useRef: useRefSp, useContext: useCtxSp } = React;

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'still up?';
  if (h < 12) return 'good morning';
  if (h < 17) return 'good afternoon';
  if (h < 22) return 'good evening';
  return 'night owl';
}

// Lines arrive at variable delays so the boot feels rhythmic rather than
// metronomic. Kinds:
//   sect → small section divider (no checkmark)
//   ok   → green ✓ line
//   wait → grey · line
//   warn → amber ! line
//   done → final ↵ line in accent
function bootLinesFor(platform) {
  return [
    { delay:  60, kind: 'sect', text: 'BIOS' },
    { delay: 140, kind: 'ok',   text: 'saurabhjalendra.com · boot ROM v.2026.05' },
    { delay: 110, kind: 'ok',   text: 'CPU · curiosity@3.4GHz · 8 cores online' },
    { delay:  90, kind: 'ok',   text: 'MEM · 64GB ECC checked' },
    { delay: 120, kind: 'ok',   text: 'NET · eth0 link up · 1Gbps' },

    { delay: 160, kind: 'sect', text: 'FILESYSTEM' },
    { delay: 100, kind: 'ok',   text: 'mounting /portfolio' },
    { delay:  90, kind: 'ok',   text: '/projects · 6 entries · 2018–2026' },
    { delay:  80, kind: 'ok',   text: '/writing · 3 entries' },
    { delay:  90, kind: 'ok',   text: '/experience.json · 4 jobs' },

    { delay: 160, kind: 'sect', text: 'SERVICES' },
    { delay: 100, kind: 'ok',   text: 'syntax engine ready · md · json · yaml' },
    { delay: 120, kind: 'ok',   text: 'assistant grounded in 13 documents' },
    { delay:  90, kind: 'warn', text: 'caffeine daemon at high load · nominal ☕' },
    { delay: 110, kind: 'ok',   text: 'session opened · ' + greeting() },

    { delay: 220, kind: 'done', text: 'ready in 1.4s ✓' },
  ];
}

function Splash() {
  const T = useCtxSp(window.ThemeCtx);
  const platform = useCtxSp(window.PlatformCtx);
  const [shown, setShown]   = useStateSp([]);
  const [phase, setPhase]   = useStateSp('boot');  // 'boot' | 'flash' | 'fade' | 'gone'
  const [progress, setProg] = useStateSp(0);
  const [tipIdx, setTipIdx] = useStateSp(0);
  const timersRef = useRefSp([]);

  const mod = window.modKey ? window.modKey(platform) : '⌘';
  const tips = [
    'press ' + mod + 'P to open any file',
    'press ' + mod + 'K to run a command',
    'press ' + mod + 'J to toggle the terminal',
    'try `:tour` in the terminal for a walkthrough',
    'click ↗ chips in the assistant to fly into a tab',
  ];

  useEffectSp(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const skipped = sessionStorage.getItem('sj.boot.skipped');
    if (skipped || reduced) { setPhase('gone'); return; }

    const BOOT_LINES = bootLinesFor(platform);
    let cum = 0;
    BOOT_LINES.forEach((line, i) => {
      cum += line.delay;
      const t = setTimeout(() => {
        setShown(s => [...s, line]);
        setProg(((i + 1) / BOOT_LINES.length) * 100);
      }, cum);
      timersRef.current.push(t);
    });
    // After the last line lands, brief "flash" phase that wipes a bright
    // sweep across the card, then fade out + unmount.
    const tFlash = setTimeout(() => setPhase('flash'),    cum + 240);
    const tFade  = setTimeout(() => setPhase('fade'),     cum + 760);
    const tGone  = setTimeout(() => {
      setPhase('gone');
      sessionStorage.setItem('sj.boot.skipped', '1');
    }, cum + 1320);
    timersRef.current.push(tFlash, tFade, tGone);

    // Tip rotator while booting.
    const tipTimer = setInterval(() => setTipIdx(i => (i + 1) % tips.length), 1800);
    timersRef.current.push({ clear: () => clearInterval(tipTimer) });

    return () => timersRef.current.forEach(t => t.clear ? t.clear() : clearTimeout(t));
  }, []);

  // Escape / click dismisses early.
  useEffectSp(() => {
    if (phase !== 'boot') return;
    const dismiss = () => setPhase('fade');
    const onKey = (e) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    setTimeout(() => sessionStorage.setItem('sj.boot.skipped', '1'), 100);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  if (phase === 'gone') return null;

  const fading = phase === 'fade';
  return (
    <div
      onClick={() => setPhase('fade')}
      style={{
        position:'fixed', inset:0, zIndex: 9000,
        background: T.chrome.titlebar, color: T.chrome.fg,
        fontFamily: '"Geist Mono","IBM Plex Mono",monospace',
        display:'flex', alignItems:'center', justifyContent:'center',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
        transition: 'opacity .5s ease-out',
        animation: 'sj-splash-in .4s ease-out',
      }}
    >
      {/* Faint dot grid for texture */}
      <div style={{
        position:'absolute', inset:0, opacity:0.07,
        backgroundImage:'radial-gradient(currentColor 1px, transparent 1px)',
        backgroundSize:'18px 18px',
      }}/>

      {/* CRT scanline overlay — only during boot, then gone */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:'repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 1px, transparent 1px, transparent 3px)',
        mixBlendMode:'multiply', opacity: 0.6,
      }}/>

      <div style={{
        width: 560, maxWidth:'92vw', position:'relative',
        padding:'22px 26px 18px',
        background: T.chrome.editor,
        border:'1px solid '+T.chrome.borderStrong,
        borderRadius: 14,
        boxShadow:'0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px '+T.chrome.borderStrong,
        transform: fading ? 'translateY(-6px) scale(0.99)' : 'translateY(0) scale(1)',
        transition: 'transform .5s ease-out',
        animation: 'sj-card-in .5s cubic-bezier(.2,.7,.3,1)',
        overflow:'hidden',
      }}>
        {/* Heading row */}
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom: 4}}>
          <span style={{
            width:8, height:8, borderRadius:'50%', background: T.accent,
            boxShadow:'0 0 10px '+T.accent,
            animation: 'sj-splash-pulse 1.4s ease-in-out infinite',
          }}/>
          <div style={{
            fontFamily:'"Geist Mono",monospace', fontSize:10.5,
            letterSpacing:'0.18em', textTransform:'uppercase', color: T.chrome.fgFainter,
          }}>portfolio · cold boot</div>
        </div>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
          <div style={{fontSize:20, color: T.chrome.fg, fontWeight:600, letterSpacing:'-0.005em'}}>saurabhjalendra.com</div>
          <div style={{fontSize:11.5, color: T.chrome.fgFainter}}>v · 2026.05</div>
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop:18, height:3, background: T.chrome.hoverBg, borderRadius:2, overflow:'hidden',
          position:'relative',
        }}>
          <div style={{
            height:'100%', width: progress + '%', background: T.accent,
            transition: 'width .2s ease', boxShadow:'0 0 12px '+T.accent,
          }}/>
          {/* Bright sweep at 'flash' phase */}
          {phase === 'flash' && (
            <div style={{
              position:'absolute', top:0, bottom:0,
              width: '40%', left: '-40%',
              background: 'linear-gradient(90deg, transparent, '+T.accent+', transparent)',
              animation: 'sj-sweep .6s ease-out forwards',
            }}/>
          )}
        </div>

        {/* Streaming log */}
        <div style={{
          marginTop:14, fontSize: 12.5, lineHeight: 1.65,
          minHeight: 13 * 22,
        }}>
          {shown.map((line, i) => {
            if (line.kind === 'sect') {
              return (
                <div key={i} style={{
                  marginTop: i === 0 ? 0 : 10, marginBottom: 4,
                  fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: T.chrome.fgFainter,
                  animation: 'sj-line-in .22s ease-out',
                }}>{line.text}</div>
              );
            }
            const tickColor =
              line.kind === 'done' ? T.accent :
              line.kind === 'warn' ? '#ffb86b' :
              line.kind === 'ok'   ? '#7be39a' :
                                     T.chrome.fgFainter;
            const tick =
              line.kind === 'done' ? '↵' :
              line.kind === 'warn' ? '!' :
              line.kind === 'wait' ? '·' :
                                     '✓';
            return (
              <div key={i} style={{
                display:'flex', gap:10, color: T.chrome.fg,
                animation: 'sj-line-in .22s ease-out',
              }}>
                <span style={{width: 14, textAlign:'center', flex:'0 0 auto', color: tickColor, fontWeight:600}}>
                  {tick}
                </span>
                <span style={{
                  color: line.kind === 'done' ? T.chrome.fg : T.chrome.fgDim,
                  fontWeight: line.kind === 'done' ? 600 : 400,
                }}>{line.text}</span>
              </div>
            );
          })}
        </div>

        {/* Footer with tip rotator */}
        <div style={{
          marginTop:14, display:'flex', justifyContent:'space-between', alignItems:'center',
          fontFamily:'"Geist Mono",monospace', fontSize:10.5, color: T.chrome.fgFainter,
          paddingTop: 12, borderTop:'1px solid '+T.chrome.border,
        }}>
          <span style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <span style={{color: T.accent, opacity: 0.8}}>tip ·</span>
            <span key={tipIdx} style={{animation:'sj-tip-in .26s ease-out'}}>{tips[tipIdx]}</span>
          </span>
          <span>
            <kbd style={kbdStyle(T)}>esc</kbd> skip · <span style={{color: T.chrome.fg}}>{Math.round(progress)}%</span>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes sj-splash-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sj-card-in {
          from { opacity: 0; transform: translateY(10px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0)    scale(1);     }
        }
        @keyframes sj-line-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sj-tip-in {
          from { opacity: 0; transform: translateX(4px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes sj-splash-pulse {
          0%,100% { transform: scale(1);   opacity: 1;   }
          50%     { transform: scale(1.5); opacity: 0.6; }
        }
        @keyframes sj-sweep {
          from { left: -40%; }
          to   { left: 140%; }
        }
      `}</style>
    </div>
  );
}

function kbdStyle(T) {
  return {
    display:'inline-flex', alignItems:'center', justifyContent:'center',
    minWidth: 20, height: 18, padding:'0 5px', borderRadius:4, margin:'0 2px',
    background: T.chrome.hoverBg, color: T.chrome.fg,
    fontFamily:'"Geist Mono",monospace', fontSize:10.5,
    border:'1px solid '+T.chrome.border,
  };
}

window.IDESplash = Splash;
