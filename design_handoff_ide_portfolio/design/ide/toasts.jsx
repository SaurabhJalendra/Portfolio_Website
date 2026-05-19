// Toast system — small floating notifications in the top-right corner.
// Triggered anywhere via window.IDE_TOAST(message, kind, opts).
//
//   IDE_TOAST('Theme \u2192 phosphor', 'ok')
//   IDE_TOAST('something broke', 'err', { ttl: 5000 })
//
// Kinds: 'info' (accent border), 'ok' (green), 'warn' (amber), 'err' (red).

(function () {
  const { useState, useEffect, useContext } = React;

  function ToastHost() {
    const T = useContext(window.ThemeCtx);
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
      window.IDE_TOAST = (text, kind = 'info', opts = {}) => {
        const id = Date.now() + Math.random();
        const ttl = opts.ttl || 2800;
        setToasts(t => [...t, { id, text, kind }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ttl);
      };
      return () => { delete window.IDE_TOAST; };
    }, []);

    return (
      <div style={{
        position:'fixed', top: 44, right: 14, zIndex: 5000,
        display:'flex', flexDirection:'column', gap: 8,
        pointerEvents:'none', maxWidth: 360,
      }}>
        {toasts.map(t => <Toast key={t.id} toast={t} T={T}/>)}
        <style>{`
          @keyframes sj-toast-in {
            from { opacity: 0; transform: translateX(20px) scale(0.97); }
            to   { opacity: 1; transform: translateX(0)    scale(1);    }
          }
        `}</style>
      </div>
    );
  }

  function Toast({ toast, T }) {
    const accent =
      toast.kind === 'ok'   ? '#7be39a' :
      toast.kind === 'err'  ? '#ff8a8a' :
      toast.kind === 'warn' ? '#ffd07a' :
      T.accent;
    return (
      <div style={{
        background: T.chrome.editor,
        color: T.chrome.fg,
        border: '1px solid ' + T.chrome.border,
        borderLeft: '3px solid ' + accent,
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 10px 28px rgba(0,0,0,0.35), 0 0 0 1px ' + T.chrome.borderStrong,
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        fontSize: 13,
        animation: 'sj-toast-in .26s cubic-bezier(.2,.7,.3,1)',
        pointerEvents: 'auto',
      }}>{toast.text}</div>
    );
  }

  window.IDEToasts = ToastHost;
})();
