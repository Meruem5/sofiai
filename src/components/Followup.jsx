export default function Followup({ on, onAnswer }) {
  return (
    <div className={'followup' + (on ? ' on' : '')}>
      <button onClick={() => onAnswer(true)}>Igen</button>
      <button onClick={() => onAnswer(false)}>Nem, köszi</button>
    </div>
  )
}
