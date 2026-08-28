const TIERS = [
  { key: 'red', lbl: 'alacsony' },
  { key: 'amber', lbl: 'közepes' },
  { key: 'green', lbl: 'magas' },
]

export default function Lights({ tier }) {
  return (
    <div className="lights">
      {TIERS.map((t) => (
        <div key={t.key} className={'lite ' + t.key + (tier === t.key ? ' on' : '')}>
          <div className="dot" />
          <div className="lbl">{t.lbl}</div>
        </div>
      ))}
    </div>
  )
}
