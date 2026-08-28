/**
 * Live-walkthrough control panel. Not part of the real product UI — it is
 * gated behind ?demo=1 or VITE_SHOW_DEMO=true (see App.jsx).
 */
export default function DemoPanel({
  collapsed, onToggle, steps, askDisabled,
  onAsk, onFollowUp, onPing, onLive, onReset,
}) {
  return (
    <div className={'demo' + (collapsed ? ' collapsed' : '')}>
      <div className="demo-hd" onClick={onToggle}>
        <b>DEMO VEZÉRLŐ</b>
        <span>{collapsed ? 'zárva' : 'nyitva'}</span>
      </div>
      <div className="demo-bd">
        <div className="lab">1 · kérdés indítása</div>
        <button disabled={askDisabled} onClick={() => onAsk('tibor')}>🎤 „Mi az az üzleti modell canvas?"</button>
        <button disabled={askDisabled} onClick={() => onAsk('balint')}>🎤 „Csöpög a mosogatóm, mit tegyek?"</button>
        <button disabled={askDisabled} onClick={() => onAsk('anna')}>🎤 „A főbérlő nem adja vissza a kauciót…"</button>

        {steps.follow && <div className="lab">2 · van még kérdés?</div>}
        {steps.follow && (
          <div className="two">
            <button onClick={() => onFollowUp(true)}>Igen</button>
            <button onClick={() => onFollowUp(false)}>Nem</button>
          </div>
        )}

        {steps.ping && <div className="lab">3 · nincs több tartalom → élő hívás?</div>}
        {steps.ping && (
          <div className="two">
            <button onClick={() => onPing(true)}>Igen, hívd</button>
            <button onClick={() => onPing(false)}>Nem</button>
          </div>
        )}

        {steps.live && <div className="lab">4 · a szakértő élőben...</div>}
        {steps.live && (
          <div className="two">
            <button onClick={() => onLive(true)}>Válaszol</button>
            <button onClick={() => onLive(false)}>Nem válaszol</button>
          </div>
        )}

        <div className="lab">újrakezdés</div>
        <button onClick={onReset}>↺ Új hívás</button>
      </div>
    </div>
  )
}
