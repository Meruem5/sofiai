import ConfidenceCard from './ConfidenceCard'
import { TIER_CHIP } from '../data/experts'

function BotMessage({ d, onEscalate }) {
  const miniStyle = d.cloth
    ? { background: d.cloth }
    : { background: 'linear-gradient(135deg,var(--sofia-1),var(--sofia-2))' }

  return (
    <div className="msg bot">
      <div className="who">
        <div className="mini" style={miniStyle} />
        <b>{d.name}</b>
        <span className={'tier ' + d.tier}>{d.pct}% · {TIER_CHIP[d.tier]}</span>
      </div>
      <div className="txt">{d.txt.map((p, i) => <p key={i}>{p}</p>)}</div>

      <ConfidenceCard pct={d.pct} tier={d.tier} breakdown={d.breakdown} />

      {d.srcs && d.srcs.length > 0 && (
        <div className="srclist">
          {d.srcs.map((s, i) => (
            <div className="srcrow" key={i}>
              <div className="ic">{s.ic}</div>
              <div>
                <h5>{s.t}</h5>
                <p>{s.by}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {d.escalate && (
        <div className="escrow">
          <p>Nincs több publikált tartalom ebben a témában.</p>
          <button onClick={onEscalate}>Hívjuk élőben?</button>
        </div>
      )}

      {d.liveOk && (
        <div className="livejoin">
          <div className="who"><div className="dot2" /><b>{d.name} csatlakozott élőben</b></div>
          <p>„Szia! Sofia mondta, hogy még kérdésed van — miben segíthetek?”</p>
        </div>
      )}

      {d.liveFail && (
        <div className="livejoin" style={{ background: 'rgba(217,106,92,.1)', borderColor: 'rgba(217,106,92,.35)' }}>
          <div className="who">
            <div className="dot2" style={{ background: 'var(--red)', boxShadow: '0 0 8px 1px rgba(217,106,92,.6)' }} />
            <b>{d.name} most nem elérhető</b>
          </div>
          <p>Kérhetsz visszajelzést tőle később, vagy Sofia kiválaszthat egy másik szakértőt.</p>
        </div>
      )}
    </div>
  )
}

export default function ChatPanel({ open, thread, onBack, onEscalate }) {
  return (
    <div className={'chatpanel' + (open ? ' open' : '')}>
      <div className="chat-hd">
        <button onClick={onBack}>← Vissza a híváshoz</button>
        <div className="ttl">Eddigi beszélgetés</div>
      </div>
      <div className="thread">
        {thread.length === 0 ? (
          <p style={{ color: 'var(--ink-3)', textAlign: 'center', marginTop: 60 }}>
            Még nincs mit megjeleníteni — kérdezz valamit a hívásban.
          </p>
        ) : (
          thread.map((m, i) =>
            m.role === 'you' ? (
              <div className="msg you" key={i}><div className="bub">{m.data.text}</div></div>
            ) : (
              <BotMessage key={i} d={m.data} onEscalate={onEscalate} />
            )
          )
        )}
      </div>
    </div>
  )
}
