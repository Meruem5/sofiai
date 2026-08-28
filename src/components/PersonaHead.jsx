/**
 * The headSVG(hair, cloth) template string from the source file, as real JSX.
 * `thinking` drives the .thinking class that the source toggled on #headWrap.
 */
export default function PersonaHead({ hair, cloth, show, thinking }) {
  return (
    <div className={'headwrap' + (show ? ' show' : '') + (thinking ? ' thinking' : '')}>
      {hair && (
        <svg viewBox="0 0 104 104" width="104" height="104">
          <path d="M20 100c4-18 16-28 32-28s28 10 32 28z" fill={cloth} />
          <circle cx="52" cy="46" r="26" fill="#F3DCC3" />
          <path
            d="M22 40c-2-20 12-32 30-32s32 12 30 32c-5-3-8-9-8-14-7 6-14 8-22 8s-15-2-22-8c0 5-3 11-8 14z"
            fill={hair}
          />
          <g className="eye" style={{ transformOrigin: '42px 47px' }}>
            <circle cx="42" cy="47" r="2.8" fill="#2E2A26" />
          </g>
          <g className="eye2" style={{ transformOrigin: '62px 47px' }}>
            <circle cx="62" cy="47" r="2.8" fill="#2E2A26" />
          </g>
          <path className="mouth-s" d="M43 58c4 4 12 4 16 0" stroke="#8C5A4A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <ellipse className="mouth-t" cx="52" cy="59" rx="3.4" ry="2.8" fill="none" stroke="#8C5A4A" strokeWidth="2.2" />
        </svg>
      )}
    </div>
  )
}
