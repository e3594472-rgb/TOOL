import { useEffect, useMemo, useRef, useState } from 'react'
import { Confetti, EmptyResult, LoadingResult, PrimaryButton, RollingDisplay, ToolLayout } from './components.jsx'
import { useNameRoll, useTimedReveal } from './hooks.js'
import { makePairs, makeTeams, shuffle } from './utils.js'
import { playRevealSound, primeSound } from './sound.js'

function choose(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function nameLengthClass(name = '') {
  if (name.length > 14) return 'name-very-long'
  if (name.length > 9) return 'name-long'
  return ''
}

function FanCards({ winner = '' }) {
  return (
    <div className={`card-fan-stage ${winner ? 'has-winner' : 'is-shuffling'}`} aria-live="polite" aria-label={winner ? `Selected student: ${winner}` : 'Shuffling student cards'}>
      <div className="fan-table-glow" />
      {Array.from({ length: 7 }, (_, index) => (
        <div className="fan-card-runner" style={{ '--fan-index': index, '--fan-position': index - 3, '--fan-z': 10 - Math.abs(index - 3) }} key={index}>
          <div className="mystery-card"><span>?</span><i>✦</i></div>
        </div>
      ))}
      {winner ? (
        <div className="selected-card-lift">
          <div className="selected-card-flip">
            <div className="selected-card-face selected-card-back"><span>?</span><i>✦</i></div>
            <div className="selected-card-face selected-card-front"><span>Who's next?</span><strong className={nameLengthClass(winner)}>{winner}</strong><i aria-hidden="true">✦</i></div>
          </div>
        </div>
      ) : <div className="fan-caption"><span>Choosing a card</span><strong>Who's next?</strong></div>}
    </div>
  )
}

function DualDeckReveal({ shuffling = false, result = null }) {
  const DeckStack = () => (
    <div className="deck-stack" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => <i style={{ '--shuffle-index': index }} key={index}/>) }
    </div>
  )

  return (
    <div className={`dual-deck-scene ${shuffling ? 'is-mixing' : 'is-open'}`} aria-live="polite">
      <div className="dual-deck-glow" />
      <section className="class-deck deck-students">
        <DeckStack />
        {result && <div className="drawn-card drawn-student-card"><div className="drawn-card-inner"><div className="drawn-face drawn-back"><span>?</span></div><div className="drawn-face drawn-front student-card-front"><small>Your speaker</small><strong className={nameLengthClass(result.student)}>{result.student}</strong><i>★</i></div></div></div>}
      </section>
      <span className="deck-plus" aria-hidden="true">+</span>
      <section className="class-deck deck-questions">
        <DeckStack />
        {result && <div className="drawn-card drawn-question-card"><div className="drawn-card-inner"><div className="drawn-face drawn-back"><span>?</span></div><div className="drawn-face drawn-front question-card-front"><small>Let's talk</small><strong>{result.question}</strong><i>?</i></div></div></div>}
      </section>
    </div>
  )
}

function OrderShuffle() {
  return (
    <div className="order-shuffle" aria-live="polite">
      <div className="order-shuffle-deck" aria-hidden="true">
        {[1, 2, 3].map((number, index) => <i style={{ '--order-count-index': index }} key={number}><span>{number}</span></i>) }
      </div>
      <h2>Get ready…</h2>
    </div>
  )
}

function PairPuzzleMatch() {
  return (
    <div className="pair-puzzle-match" aria-live="polite" aria-label="Matching puzzle pieces">
      <div className="puzzle-glow" aria-hidden="true" />
      <svg className="puzzle-board" viewBox="0 0 520 250" role="img" aria-hidden="true">
        <g className="puzzle-piece puzzle-piece-left">
          <path d="M42 41 Q42 31 52 31 H235 V65 C235 52 246 42 260 42 C278 42 292 56 292 74 C292 92 278 106 260 106 C246 106 235 96 235 83 V179 H52 Q42 179 42 169 Z" />
          <circle cx="119" cy="105" r="26" />
          <path className="puzzle-mark" d="M106 105 L116 115 L135 94" />
        </g>
        <g className="puzzle-piece puzzle-piece-right">
          <path d="M235 31 H468 Q478 31 478 41 V169 Q478 179 468 179 H235 V83 C235 96 246 106 260 106 C278 106 292 92 292 74 C292 56 278 42 260 42 C246 42 235 52 235 65 Z" />
          <circle cx="401" cy="105" r="26" />
          <path className="puzzle-mark" d="M388 105 L398 115 L417 94" />
        </g>
      </svg>
      <h2>Finding the perfect match…</h2>
    </div>
  )
}

function TeamPuzzleMatch() {
  return (
    <div className="team-puzzle-match" aria-live="polite" aria-label="Four puzzle pieces forming teams">
      <div className="team-puzzle-glow" aria-hidden="true" />
      <svg className="team-puzzle-board" viewBox="0 0 520 310" role="img" aria-hidden="true">
        <g className="team-puzzle-piece team-puzzle-one">
          <path d="M100 30 H260 V63 C260 52 270 43 282 43 C300 43 314 57 314 75 C314 93 300 107 282 107 C270 107 260 98 260 87 V150 H183 C193 150 201 160 201 172 C201 190 187 204 169 204 C151 204 137 190 137 172 C137 160 145 150 155 150 H100 Z" />
        </g>
        <g className="team-puzzle-piece team-puzzle-two">
          <path d="M260 30 H420 V150 H365 C375 150 383 160 383 172 C383 190 369 204 351 204 C333 204 319 190 319 172 C319 160 327 150 337 150 H260 V87 C260 98 270 107 282 107 C300 107 314 93 314 75 C314 57 300 43 282 43 C270 43 260 52 260 63 Z" />
        </g>
        <g className="team-puzzle-piece team-puzzle-three">
          <path d="M100 150 H155 C145 150 137 160 137 172 C137 190 151 204 169 204 C187 204 201 190 201 172 C201 160 193 150 183 150 H260 V213 C260 202 270 193 282 193 C300 193 314 207 314 225 C314 243 300 257 282 257 C270 257 260 248 260 237 V280 H100 Z" />
        </g>
        <g className="team-puzzle-piece team-puzzle-four">
          <path d="M260 150 H337 C327 150 319 160 319 172 C319 190 333 204 351 204 C369 204 383 190 383 172 C383 160 375 150 365 150 H420 V280 H260 V237 C260 248 270 257 282 257 C300 257 314 243 314 225 C314 207 300 193 282 193 C270 193 260 202 260 213 Z" />
        </g>
      </svg>
      <h2>Building the teams…</h2>
    </div>
  )
}

export function StudentPicker(props) {
  const { students, soundOn } = props
  const [used, setUsed] = useState([])
  const [result, setResult] = useState('')
  const { isRolling, preview, roll, cancel } = useNameRoll()
  const remaining = useMemo(() => students.filter((student) => !used.includes(student)), [students, used])
  const complete = students.length > 0 && remaining.length === 0 && !isRolling

  useEffect(() => {
    setUsed((current) => current.filter((student) => students.includes(student)))
    if (result && !students.includes(result)) setResult('')
    cancel()
  }, [students])

  const pick = () => {
    if (!remaining.length || isRolling) return
    primeSound(soundOn)
    setResult('')
    const finalName = choose(remaining)
    roll(remaining, finalName, () => {
      setResult(finalName)
      setUsed((current) => [...new Set([...current, finalName])])
      playRevealSound(soundOn)
    })
  }

  const reset = () => {
    cancel()
    setUsed([])
    setResult('')
  }

  return (
    <ToolLayout toolId="student" {...props}>
      {isRolling || result ? (
        <div className={`student-card-play ${result ? 'winner-result' : ''}`}><FanCards winner={result}/>{result && <><Confetti/><p>{remaining.length ? `${remaining.length} still to go this round` : 'That’s everyone!'}</p><div className="result-actions"><PrimaryButton onClick={remaining.length ? pick : () => setResult('')}>{remaining.length ? 'Next' : 'Finish round'}</PrimaryButton><button className="secondary-button" type="button" onClick={reset}>Reset round</button></div></>}</div>
      ) : complete ? (
        <div className="round-complete"><span>Round complete</span><h2>Everyone has had a turn!</h2><p>Nice work — ready to go again?</p><PrimaryButton onClick={reset}>Start new round</PrimaryButton></div>
      ) : (
        <div className="ready-state"><EmptyResult icon="student" title={students.length ? 'Ready to pick?' : 'Add students to get started.'} description={students.length ? 'No repeats until everyone has had a turn.' : 'Use the students panel — you can edit it anytime.'}/><PrimaryButton onClick={pick} disabled={!students.length}>Pick!</PrimaryButton></div>
      )}
      {!!used.length && !result && !complete && !isRolling && <button className="round-reset-link" type="button" onClick={reset}>Reset round</button>}
    </ToolLayout>
  )
}

export function OrderMaker(props) {
  const { students, soundOn } = props
  const [order, setOrder] = useState([])
  const [visibleCount, setVisibleCount] = useState(0)
  const [isShuffling, setIsShuffling] = useState(false)
  const orderTimers = useRef([])

  const clearOrderTimers = () => {
    orderTimers.current.forEach(clearTimeout)
    orderTimers.current = []
  }

  useEffect(() => {
    clearOrderTimers()
    setOrder([])
    setVisibleCount(0)
    setIsShuffling(false)
  }, [students])

  useEffect(() => () => clearOrderTimers(), [])

  const create = () => {
    primeSound(soundOn)
    const next = shuffle(students)
    clearOrderTimers()
    setOrder([])
    setVisibleCount(0)
    setIsShuffling(true)

    const startReveal = setTimeout(() => {
      setIsShuffling(false)
      setOrder(next)
      setVisibleCount(1)
      playRevealSound(soundOn)

      next.slice(1).forEach((_, index) => {
        const timer = setTimeout(() => {
          const nextCount = index + 2
          setVisibleCount(nextCount)
          playRevealSound(soundOn)
        }, (index + 1) * 1000)
        orderTimers.current.push(timer)
      })
    }, 1800)
    orderTimers.current.push(startReveal)
  }

  const building = order.length > 0 && visibleCount < order.length

  return <ToolLayout toolId="order" {...props}>
    {isShuffling ? <OrderShuffle/> : order.length ? <div className={`order-result order-chain ${building ? 'is-building' : 'is-complete'} result-reveal`} aria-live="polite"><div className="result-title"><span>{building ? 'Building the chain' : 'Speaking order'}</span><h2>{building ? 'Who comes next?' : "You're all set!"}</h2></div><ol>{order.slice(0, visibleCount).map((student, index) => <li key={student} style={{ '--chain-index': index }}><span>{index + 1}</span><strong>{student}</strong></li>)}</ol>{building ? <p className="chain-progress"><b>{visibleCount}</b> of {order.length}</p> : <PrimaryButton onClick={create}>Shuffle again</PrimaryButton>}</div> : <div className="ready-state"><EmptyResult icon="order" title={students.length ? 'Who goes first?' : 'Add students to get started.'} description={students.length ? 'Create a clear, random speaking order in one click.' : 'Your speaking order will appear here.'}/><PrimaryButton onClick={create} disabled={!students.length}>Create order</PrimaryButton></div>}
  </ToolLayout>
}

export function PairMaker(props) {
  const { students, soundOn } = props
  const [groups, setGroups] = useState([])
  const { isRevealing, reveal } = useTimedReveal()
  useEffect(() => setGroups([]), [students])

  const create = () => {
    primeSound(soundOn)
    const next = makePairs(students)
    setGroups([])
    reveal(1250, () => { setGroups(next); playRevealSound(soundOn) })
  }

  return <ToolLayout toolId="pairs" {...props}>
    {isRevealing ? <PairPuzzleMatch/> : groups.length ? <div className="groups-result result-reveal" aria-live="polite"><div className="result-title"><span>Ready to speak</span><h2>Partners found!</h2></div><div className="group-grid pairs-grid">{groups.map((group, index) => <article className="pair-card" key={group.join('-')} style={{ '--pair-index': index }}><span>{group.length === 3 ? 'Group' : 'Pair'} {index + 1}</span><div>{group.map((name, nameIndex) => <div className="pair-name" key={name}><strong>{name}</strong>{nameIndex < group.length - 1 && <i aria-hidden="true">+</i>}</div>)}</div></article>)}</div><PrimaryButton onClick={create}>Mix again</PrimaryButton></div> : <div className="ready-state"><EmptyResult icon="pairs" title={students.length < 2 ? 'Add at least 2 students.' : 'Pair them up!'} description={students.length >= 2 ? 'With an odd class size, the last group will have three.' : 'Nobody gets left without a partner.'}/><PrimaryButton onClick={create} disabled={students.length < 2}>Make pairs</PrimaryButton></div>}
  </ToolLayout>
}

export function TeamMaker(props) {
  const { students, soundOn } = props
  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState([])
  const { isRevealing, reveal } = useTimedReveal()
  useEffect(() => setTeams([]), [students, teamCount])

  const create = () => {
    primeSound(soundOn)
    const next = makeTeams(students, teamCount)
    setTeams([])
    reveal(1450, () => { setTeams(next); playRevealSound(soundOn) })
  }

  return <ToolLayout toolId="teams" {...props}>
    <div className="team-controls"><label>Number of teams</label><div>{[2, 3, 4].map((count) => <button type="button" className={teamCount === count ? 'active' : ''} onClick={() => setTeamCount(count)} key={count}>{count}</button>)}</div></div>
    {isRevealing ? <TeamPuzzleMatch/> : teams.length ? <div className="groups-result teams-result result-reveal" aria-live="polite"><div className="result-title"><span>Teams are ready</span><h2>Let's go!</h2></div><div className="group-grid teams-grid">{teams.map((team, index) => <article className={`team-card team-card-${index + 1}`} key={`team-${index}`} style={{ '--team-index': index }}><span><b aria-hidden="true">{index + 1}</b> Team {index + 1}</span><div>{team.length ? team.map((name) => <strong key={name}>{name}</strong>) : <small>Add more students</small>}</div></article>)}</div><PrimaryButton onClick={create}>Mix again</PrimaryButton></div> : <div className="ready-state"><EmptyResult icon="teams" title={students.length < 2 ? 'Add at least 2 students.' : 'Build balanced teams'} description={students.length >= 2 ? 'Class members are shared as evenly as possible.' : 'Choose 2, 3, or 4 teams.'}/><PrimaryButton onClick={create} disabled={students.length < 2}>Create teams</PrimaryButton></div>}
  </ToolLayout>
}

export function PickAndSpeak(props) {
  const { students, questions, soundOn } = props
  const [usedStudents, setUsedStudents] = useState([])
  const [usedQuestions, setUsedQuestions] = useState([])
  const [lastQuestion, setLastQuestion] = useState('')
  const [result, setResult] = useState(null)
  const { isRevealing, reveal, cancel } = useTimedReveal()
  const remaining = useMemo(() => students.filter((student) => !usedStudents.includes(student)), [students, usedStudents])
  const complete = students.length > 0 && remaining.length === 0 && !isRevealing

  useEffect(() => {
    setUsedStudents((current) => current.filter((name) => students.includes(name)))
    setUsedQuestions((current) => current.filter((question) => questions.includes(question)))
    if (result && (!students.includes(result.student) || !questions.includes(result.question))) setResult(null)
    cancel()
  }, [students, questions])

  const pickQuestion = () => {
    let pool = questions.filter((question) => !usedQuestions.includes(question))
    let recycled = false
    if (!pool.length) {
      recycled = true
      pool = questions.length > 1 ? questions.filter((question) => question !== lastQuestion) : questions
    }
    return { question: choose(pool), recycled }
  }

  const pick = () => {
    if (!remaining.length || !questions.length || isRevealing) return
    primeSound(soundOn)
    setResult(null)
    const student = choose(remaining)
    const { question, recycled } = pickQuestion()
    reveal(1450, () => {
      setResult({ student, question })
      setUsedStudents((current) => [...new Set([...current, student])])
      setUsedQuestions((current) => recycled ? [question] : [...new Set([...current, question])])
      setLastQuestion(question)
      playRevealSound(soundOn)
    })
  }

  const reset = () => {
    cancel()
    setUsedStudents([])
    setUsedQuestions([])
    setResult(null)
  }

  const missing = !students.length ? 'Add students to get started.' : !questions.length ? 'Add speaking questions to use this mode.' : ''

  return <ToolLayout toolId="speak" {...props}>
    {isRevealing ? <DualDeckReveal shuffling/> : result ? <div className="speak-result dual-result" aria-live="polite"><Confetti/><DualDeckReveal result={result}/><div className="result-actions"><PrimaryButton onClick={remaining.length ? pick : () => setResult(null)}>{remaining.length ? 'Next' : 'Finish round'}</PrimaryButton><button className="secondary-button" type="button" onClick={reset}>New round</button></div></div> : complete ? <div className="round-complete"><span>Round complete</span><h2>Everyone has had a turn!</h2><p>Every student got a question.</p><PrimaryButton onClick={reset}>Start new round</PrimaryButton></div> : <div className="ready-state"><EmptyResult icon="speak" title={missing || 'Ready?'} description={missing ? 'Use the panels on the left — you can edit them anytime.' : 'One student. One question. No student repeats this round.'}/><PrimaryButton onClick={pick} disabled={!!missing}>Pick & Speak</PrimaryButton></div>}
  </ToolLayout>
}

export function QuestionPicker(props) {
  const { questions, soundOn } = props
  const [used, setUsed] = useState([])
  const [result, setResult] = useState('')
  const { isRevealing, reveal, cancel } = useTimedReveal()
  const remaining = questions.filter((question) => !used.includes(question))
  const complete = questions.length > 0 && remaining.length === 0 && !isRevealing

  useEffect(() => {
    setUsed((current) => current.filter((question) => questions.includes(question)))
    if (result && !questions.includes(result)) setResult('')
    cancel()
  }, [questions])

  const pick = () => {
    if (!remaining.length) return
    primeSound(soundOn)
    const next = choose(remaining)
    setResult('')
    reveal(700, () => { setResult(next); setUsed((current) => [...new Set([...current, next])]); playRevealSound(soundOn) })
  }

  const reset = () => { cancel(); setUsed([]); setResult('') }

  return <ToolLayout toolId="question" {...props}>
    {isRevealing ? <LoadingResult text="Picking a question…"/> : result ? <div className="question-result result-reveal" aria-live="polite"><div className="prompt-card"><span className="result-kicker"><b aria-hidden="true">?</b> Your question</span><h2>{result}</h2><i className="prompt-lines" aria-hidden="true"/><i className="prompt-corner" aria-hidden="true">✦</i></div><p>{remaining.length} {remaining.length === 1 ? 'question' : 'questions'} left</p><PrimaryButton onClick={remaining.length ? pick : () => setResult('')}>{remaining.length ? 'Next question' : 'Finish deck'}</PrimaryButton></div> : complete ? <div className="round-complete"><span>Question deck complete</span><h2>All questions have been used</h2><p>Shuffle the deck and start again.</p><PrimaryButton onClick={reset}>Start again</PrimaryButton></div> : <div className="ready-state"><EmptyResult icon="question" title={questions.length ? 'Pick from the question deck' : 'Add speaking questions to use this mode.'} description={questions.length ? 'Questions will not repeat until the deck is finished.' : 'Paste a whole list or add them one at a time.'}/><PrimaryButton onClick={pick} disabled={!questions.length}>Pick a question</PrimaryButton></div>}
  </ToolLayout>
}
