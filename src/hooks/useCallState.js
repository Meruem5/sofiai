import { useCallback, useEffect, useRef, useState } from 'react'
import { EXPERTS, SOFIA } from '../data/experts'

const THINK_MS = 1100   // think() default in the source file
const SAY_MS = 1700     // say(text, after) delay in the source file
const HANDOFF_MS = 1800 // "no more questions" → back to Sofia

const EMPTY_STEPS = { follow: false, ping: false, live: false }

/**
 * The whole call state machine, ported from the source file's globals
 * (thread / unread / activeExpert) and its DOM mutations.
 */
export function useCallState() {
  const [thread, setThread] = useState([])
  const [unread, setUnread] = useState(0)
  const [activeExpert, setActiveExpert] = useState(null)
  const [lightTier, setLightTier] = useState(null)
  const [readout, setReadout] = useState({ text: SOFIA.readout })
  const [caption, setCaption] = useState(SOFIA.greeting)
  const [thinking, setThinking] = useState(false)
  const [followupOn, setFollowupOn] = useState(false)
  const [askDisabled, setAskDisabled] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [demoSteps, setDemoSteps] = useState(EMPTY_STEPS)

  // Mirrors the source file's mutable `activeExpert` global so deferred
  // timer callbacks read the same value the original handlers did.
  const expertRef = useRef(null)
  const timers = useRef([])

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  // setTimeout that is tracked, so a reset or unmount cancels it.
  const later = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timers.current = timers.current.filter((t) => t !== id)
      fn()
    }, ms)
    timers.current.push(id)
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const pushMsg = useCallback((role, data) => {
    setThread((t) => [...t, { role, data }])
  }, [])

  const bumpChat = useCallback(() => setUnread((u) => u + 1), [])

  const say = useCallback((text, after) => {
    setCaption(text)
    if (after) later(after, SAY_MS)
  }, [later])

  const think = useCallback((cb, ms = THINK_MS) => {
    setThinking(true)
    setCaption('')
    later(() => { setThinking(false); cb() }, ms)
  }, [later])

  const showPersona = useCallback((expert) => {
    expertRef.current = expert
    setActiveExpert(expert)
  }, [])

  const backToSofia = useCallback(() => {
    showPersona(null)
    setLightTier('red')
    setReadout({ text: SOFIA.readout })
    say(SOFIA.greeting)
  }, [showPersona, say])

  const askExpert = useCallback((key) => {
    const e = EXPERTS[key]
    if (!e) return
    setAskDisabled(true)
    pushMsg('you', { text: e.ask })
    say('Egy pillanat, ránézek...')
    think(() => {
      showPersona(e)
      const d = e.hybrid
      setLightTier(d.tier)
      setReadout({ pct: d.pct, tier: d.tier })
      say(d.caption, () => {
        pushMsg('bot', {
          name: e.name, cloth: e.cloth, tier: d.tier, pct: d.pct,
          txt: d.txt, srcs: d.srcs, breakdown: d.breakdown,
        })
        bumpChat()
        say('Van még kérdésed a témában?')
        setFollowupOn(true)
        setDemoSteps((s) => ({ ...s, follow: true }))
      })
    })
  }, [pushMsg, say, think, showPersona, bumpChat])

  const followUp = useCallback((yes) => {
    setFollowupOn(false)
    setDemoSteps((s) => ({ ...s, follow: false }))
    const e = expertRef.current
    if (!yes) {
      say(e ? 'Örülök, ha segíthettem! Visszaadom a szót Sofiának.' : 'Örülök, ha segíthettem!')
      later(backToSofia, HANDOFF_MS)
      return
    }
    if (e && e.allowEscalation) {
      say('Nincs több publikált anyagom erről — szeretnéd, hogy behívjam élőben a chatbe?')
      pushMsg('bot', {
        name: e.name, cloth: e.cloth, tier: 'amber', pct: e.hybrid.pct,
        txt: ['Nincs több publikált anyagom erről a témáról.'],
        srcs: [], breakdown: [], escalate: true,
      })
      bumpChat()
      setDemoSteps((s) => ({ ...s, ping: true }))
    } else {
      say(e
        ? 'Erről ennyi anyagom van most — kérdezz mást, vagy váltsunk vissza Sofiára.'
        : 'Mesélj bővebbet, és megnézem, mit tudok kideríteni.')
    }
  }, [say, later, backToSofia, pushMsg, bumpChat])

  // The source file's window.__demoPing, called from the escalation row.
  const demoPing = useCallback(() => {
    setDemoSteps((s) => ({ ...s, ping: true }))
  }, [])

  const pingExpert = useCallback((yes) => {
    setDemoSteps((s) => ({ ...s, ping: false }))
    if (!yes) { say('Rendben, ha mégis szeretnéd, csak szólj.'); return }
    say('Pingelem ' + expertRef.current.name + 't...')
    setDemoSteps((s) => ({ ...s, live: true }))
  }, [say])

  const liveResult = useCallback((ok) => {
    setDemoSteps((s) => ({ ...s, live: false }))
    const e = expertRef.current
    if (ok) {
      setLightTier('green')
      setReadout({ pct: e.human.pct, tier: 'green' })
      say(e.name + ' csatlakozott — átadom neki a szót.', () => {
        pushMsg('bot', {
          name: e.name, cloth: e.cloth, tier: 'green', pct: e.human.pct,
          txt: e.human.txt, srcs: e.human.srcs, breakdown: e.human.breakdown, liveOk: true,
        })
        bumpChat()
      })
    } else {
      say(e.name + ' most nem válaszol.', () => {
        pushMsg('bot', {
          name: e.name, cloth: e.cloth, tier: 'amber', pct: e.hybrid.pct,
          txt: [e.name + ' most nem érhető el élőben.'],
          srcs: [], breakdown: [], liveFail: true,
        })
        bumpChat()
      })
    }
  }, [say, pushMsg, bumpChat])

  const resetAll = useCallback(() => {
    clearTimers() // nothing scheduled by the previous call may fire into the new one
    setThread([])
    setUnread(0)
    showPersona(null)
    setLightTier(null)
    setReadout({ text: SOFIA.readout })
    setCaption(SOFIA.greeting)
    setThinking(false)
    setFollowupOn(false)
    setDemoSteps(EMPTY_STEPS)
    setAskDisabled(false)
    setChatOpen(false)
  }, [clearTimers, showPersona])

  const openChat = useCallback(() => { setChatOpen(true); setUnread(0) }, [])
  const closeChat = useCallback(() => setChatOpen(false), [])

  return {
    thread, unread, activeExpert, lightTier, readout, caption, thinking,
    followupOn, askDisabled, chatOpen, demoSteps,
    askExpert, followUp, pingExpert, liveResult, demoPing, resetAll, openChat, closeChat,
  }
}
