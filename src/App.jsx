import { useState } from 'react'
import { useCallState } from './hooks/useCallState'
import { SOFIA, TIER_READOUT } from './data/experts'
import Lights from './components/Lights'
import Presence from './components/Presence'
import Caption from './components/Caption'
import Followup from './components/Followup'
import ChatButton from './components/ChatButton'
import ChatPanel from './components/ChatPanel'
import DemoPanel from './components/DemoPanel'

// The demo control panel is hidden for ordinary visitors. It shows up when
// the URL carries ?demo=1, or when the build sets VITE_SHOW_DEMO=true.
function demoEnabled() {
  if (import.meta.env.VITE_SHOW_DEMO === 'true') return true
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('demo') === '1'
}

export default function App() {
  const call = useCallState()
  const [showDemo] = useState(demoEnabled)
  const [demoCollapsed, setDemoCollapsed] = useState(false)

  // window.__demoPing in the source: reveal step 3 and pop the panel open.
  const handleEscalate = () => {
    call.demoPing()
    setDemoCollapsed(false)
  }

  const { readout } = call

  return (
    <>
      <div className="stage">
        <Lights tier={call.lightTier} />
        <div className="readout">
          {readout.text ?? (<><b>{readout.pct}%</b> · {TIER_READOUT[readout.tier]}</>)}
        </div>

        <div className="orb-zone">
          <Presence expert={call.activeExpert} thinking={call.thinking} />
          <div className="name">{call.activeExpert ? call.activeExpert.name : SOFIA.name}</div>
          <div className="role">{call.activeExpert ? call.activeExpert.role : SOFIA.role}</div>
          <Caption text={call.caption} />
          <Followup on={call.followupOn} onAnswer={call.followUp} />
        </div>

        <p className="footnote">
          Ez egy korai prototípus — Sofia és a szakértők válaszai előre elkészített
          forgatókönyvek, nem élő AI.
        </p>

        <ChatButton unread={call.unread} onClick={call.openChat} />
      </div>

      <ChatPanel
        open={call.chatOpen}
        thread={call.thread}
        onBack={call.closeChat}
        onEscalate={handleEscalate}
      />

      {showDemo && (
        <DemoPanel
          collapsed={demoCollapsed}
          onToggle={() => setDemoCollapsed((c) => !c)}
          steps={call.demoSteps}
          askDisabled={call.askDisabled}
          onAsk={call.askExpert}
          onFollowUp={call.followUp}
          onPing={call.pingExpert}
          onLive={call.liveResult}
          onReset={call.resetAll}
        />
      )}
    </>
  )
}
