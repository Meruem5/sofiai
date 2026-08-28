import { TIER_SHORT } from '../data/experts'

export default function ConfidenceCard({ pct, tier, breakdown }) {
  const filled = Math.round(pct / 10)
  return (
    <div className="confcard">
      <div className="row">
        <span className="pct">{pct}%</span>
        <span style={{ color: 'var(--ink-2)', fontSize: 13 }}>— {TIER_SHORT[tier]} biztonság</span>
      </div>
      <div className="bars">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} className={i < filled ? 'on ' + tier : ''} />
        ))}
      </div>
      <ul>
        {breakdown.map(([label, value], i) => (
          <li key={i}>
            <span>{label}</span>
            <b>{value ? (value > 0 ? '+' : '') + value : '0'}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}
