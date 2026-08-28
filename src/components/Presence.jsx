import { useRef } from 'react'
import PersonaHead from './PersonaHead'

/** Renders Sofia's orb, or the active expert's animated head over it. */
export default function Presence({ expert, thinking }) {
  // Keep the last expert mounted so the head fades out instead of vanishing,
  // exactly as the source did by only removing the .show class.
  const lastExpert = useRef(null)
  if (expert) lastExpert.current = expert
  const head = lastExpert.current

  return (
    <div className="presence">
      <div className={'orb-visual' + (expert ? ' hide' : '') + (thinking ? ' thinking' : '')}>
        <div className="orb">
          <div className="halo" />
          <div className="blob b1" />
          <div className="blob b2" />
        </div>
      </div>
      <PersonaHead
        hair={head?.hair}
        cloth={head?.cloth}
        show={!!expert}
        thinking={thinking}
      />
    </div>
  )
}
