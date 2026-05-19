// Tweaks panel — theme, motion, layout toggles. Wraps the starter
// useTweaks/TweaksPanel/TweakSection/TweakSelect/TweakToggle.

function IDETweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Chrome">
        <TweakSelect
          label="Window controls"
          value={tweaks.chrome}
          onChange={(v) => setTweak('chrome', v)}
          options={[
            { value:'auto',    label:'Auto · match your OS' },
            { value:'mac',     label:'macOS · traffic lights' },
            { value:'windows', label:'Windows · min / max / close' },
            { value:'linux',   label:'Linux · close only' },
          ]}
        />
      </TweakSection>

      <TweakSection label="Theme">
        <TweakSelect
          label="Palette"
          value={tweaks.theme}
          onChange={(v) => setTweak('theme', v)}
          options={[
            { value:'midnight', label:'Midnight (default)' },
            { value:'phosphor', label:'Phosphor (terminal green)' },
            { value:'paper',    label:'Paper (light)' },
            { value:'solar',    label:'Solar (amber)' },
          ]}
        />
      </TweakSection>

      <TweakSection label="Motion">
        <TweakToggle
          label="Typing intro"
          value={tweaks.motion}
          onChange={(v) => setTweak('motion', v)}
        />
        <TweakToggle
          label="Scanline overlay"
          value={tweaks.scanlines}
          onChange={(v) => setTweak('scanlines', v)}
        />
      </TweakSection>

      <TweakSection label="Layout">
        <TweakToggle
          label="Assistant panel"
          value={tweaks.assistant}
          onChange={(v) => setTweak('assistant', v)}
        />
        <TweakToggle
          label="Minimap"
          value={tweaks.minimap}
          onChange={(v) => setTweak('minimap', v)}
        />
        <TweakToggle
          label="Integrated terminal"
          value={tweaks.terminal}
          onChange={(v) => setTweak('terminal', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

window.IDETweaks = IDETweaks;
