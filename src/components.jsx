import { useEffect, useState } from 'react'
import { ListOrdered, MessageCircleQuestion, MessagesSquare, UserRound, Users, UsersRound } from 'lucide-react'
import { cleanLines, countLabel } from './utils.js'

const icons = {
  student: UserRound,
  order: ListOrdered,
  pairs: Users,
  teams: UsersRound,
  speak: MessagesSquare,
  question: MessageCircleQuestion,
}

export function Icon({ name, size = 24 }) {
  const IconComponent = icons[name] || MessageCircleQuestion
  return <IconComponent className="icon" size={size} strokeWidth={2.15} aria-hidden="true" />
}

export const tools = [
  { id: 'student', title: 'Pick a Student', short: 'Pick Student', description: 'Choose who answers next', cta: 'Pick a student' },
  { id: 'order', title: 'Set the Order', short: 'Order', description: 'Create a random speaking order', cta: 'Create order' },
  { id: 'pairs', title: 'Make Pairs', short: 'Pairs', description: 'Create random pairs', cta: 'Make pairs' },
  { id: 'teams', title: 'Make Teams', short: 'Teams', description: 'Split the class into teams', cta: 'Make teams' },
  { id: 'speak', title: 'Pick & Speak', short: 'Pick & Speak', description: 'Match a student with a speaking question', cta: 'Start activity' },
  { id: 'question', title: 'Question Only', short: 'Question', description: 'Pick a random speaking question', cta: 'Pick a question' },
]

const toolImage = (id) => `${import.meta.env.BASE_URL}tool-images/${id === 'teams' ? 'teams-v2' : id}.png`

export function Header({ activeTool, onNavigate, soundOn, onToggleSound }) {
  return (
    <>
      <header className="site-header">
        <button className="brand" type="button" onClick={() => onNavigate('home')} aria-label="Pick & Speak home">
          <span className="brand-mark"><Icon name="speak" size={26}/></span>
          <span><strong>Pick <i>&</i> Speak</strong><small>Quick classroom tools</small></span>
        </button>
        <button className="sound-button" type="button" onClick={onToggleSound} aria-pressed={soundOn} title={soundOn ? 'Turn sound off' : 'Turn sound on'}>
          <span aria-hidden="true">{soundOn ? '🔊' : '🔇'}</span>
          <span className="sound-label">Sound {soundOn ? 'on' : 'off'}</span>
        </button>
      </header>
      {activeTool !== 'home' && (
        <nav className="tool-nav" aria-label="Classroom tools">
          <button className="all-tools" type="button" onClick={() => onNavigate('home')}>← All tools</button>
          <div className="tool-nav-scroll">
            {tools.map((tool) => (
              <button className={activeTool === tool.id ? 'active' : ''} type="button" key={tool.id} onClick={() => onNavigate(tool.id)} aria-current={activeTool === tool.id ? 'page' : undefined}><Icon name={tool.id} size={16}/><span>{tool.short}</span></button>
            ))}
          </div>
        </nav>
      )}
    </>
  )
}

export function Home({ onNavigate, students, onStudentsChange }) {
  const [showHow, setShowHow] = useState(false)
  return (
    <main className="home-page">
      <section className="hero">
        <span className="eyebrow">Ready when your class is</span>
        <h1>Pick <em>&</em> Speak</h1>
        <p>Quick classroom tools for speaking lessons</p>
        <div className="home-setup">
          <div><strong>{countLabel(students.length, 'student')}</strong><span>{students.length ? ' ready to go' : 'Add your class once, use every tool'}</span></div>
          <button type="button" onClick={() => document.getElementById('home-students')?.scrollIntoView({ behavior: 'smooth' })}>{students.length ? 'Edit students' : 'Add students'} ↓</button>
        </div>
      </section>

      <section className="tools-section" aria-labelledby="tools-title">
        <div className="section-heading"><div><span className="step">01</span><h2 id="tools-title">Choose a tool</h2></div><button className="text-button" type="button" onClick={() => setShowHow(!showHow)}>How it works</button></div>
        {showHow && <div className="how-it-works"><span><b>1</b> Add your students</span><span><b>2</b> Choose a tool</span><span><b>3</b> Use it during your lesson</span><span><b>4</b> Edit anytime</span></div>}
        <div className="tool-grid">
          {tools.map((tool, index) => (
            <button className={`tool-card tool-${tool.id} ${tool.id === 'speak' ? 'featured' : ''}`} type="button" key={tool.id} onClick={() => onNavigate(tool.id)}>
              {tool.id === 'speak' && <span className="popular">CLASS FAVOURITE</span>}
              <span className="tool-number">0{index + 1}</span>
              <span className="tool-picture"><img src={toolImage(tool.id)} alt="" /></span>
              <span className="tool-title">{tool.title}</span>
              <span className="tool-description">{tool.description}</span>
              <span className="tool-link">{tool.cta} <b>→</b></span>
            </button>
          ))}
        </div>
      </section>

      <section id="home-students" className="home-students">
        <div className="section-heading"><div><span className="step">02</span><h2>Add your class</h2></div><p>Saved automatically on this device</p></div>
        <ListPanel type="students" items={students} onChange={onStudentsChange} expanded />
      </section>
    </main>
  )
}

export function ListPanel({ type, items, onChange, expanded = false }) {
  const isQuestions = type === 'questions'
  const singular = isQuestions ? 'question' : 'student'
  const [single, setSingle] = useState('')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    if (editing) setDraft(items.join('\n'))
  }, [editing])

  const addItem = (event) => {
    event.preventDefault()
    const value = single.trim()
    if (!value || items.some((item) => item.toLocaleLowerCase() === value.toLocaleLowerCase())) return
    onChange([...items, value])
    setSingle('')
  }

  const apply = () => {
    onChange(cleanLines(draft))
    setEditing(false)
  }

  return (
    <section className={`list-panel ${expanded ? 'list-panel-expanded' : ''}`} aria-label={isQuestions ? 'Questions' : 'Students'}>
      <div className="panel-title-row">
        <div><h3>{isQuestions ? 'Questions' : 'Students'}</h3><span className="counter">{countLabel(items.length, singular)}</span></div>
        <button className="edit-button" type="button" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : `Edit ${isQuestions ? 'questions' : 'list'}`}</button>
      </div>

      {editing ? (
        <div className="bulk-editor">
          <label htmlFor={`bulk-${type}`}>One {singular} per line</label>
          <textarea id={`bulk-${type}`} value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus placeholder={isQuestions ? 'What do you usually do at weekends?\nWhat would you like to learn?' : 'Anna\nMax\nSophie\nLeo'} />
          <button className="small-primary" type="button" onClick={apply}>Apply list</button>
        </div>
      ) : (
        <>
          {items.length ? (
            <div className={isQuestions ? 'question-list' : 'chip-list'}>
              {items.map((item) => (
                <div className={isQuestions ? 'question-row' : 'student-chip'} key={item}><span>{item}</span><button type="button" onClick={() => onChange(items.filter((value) => value !== item))} aria-label={`Remove ${item}`}>×</button></div>
              ))}
            </div>
          ) : <div className="panel-empty">{isQuestions ? 'Add speaking questions to use this mode.' : 'Add students to get started.'}</div>}
          <form className="add-form" onSubmit={addItem}>
            <label className="sr-only" htmlFor={`add-${type}`}>Add {singular}</label>
            <input id={`add-${type}`} value={single} onChange={(event) => setSingle(event.target.value)} placeholder={`Add ${singular}`} />
            <button type="submit" aria-label={`Add ${singular}`}>+</button>
          </form>
        </>
      )}

      {!!items.length && !editing && (
        <div className="clear-area">
          {confirmClear ? <><span>Clear all?</span><button type="button" onClick={() => { onChange([]); setConfirmClear(false) }}>Yes, clear</button><button type="button" onClick={() => setConfirmClear(false)}>Cancel</button></> : <button type="button" onClick={() => setConfirmClear(true)}>Clear {isQuestions ? 'questions' : 'students'}</button>}
        </div>
      )}
    </section>
  )
}

export function ToolLayout({ toolId, students, onStudentsChange, questions, onQuestionsChange, children }) {
  const tool = tools.find((item) => item.id === toolId)
  return (
    <main className={`tool-page page-${toolId}`}>
      <header className="tool-heading">
        <span className={`heading-picture heading-picture-${toolId}`}><img src={toolImage(toolId)} alt="" /></span>
        <div><h1>{tool.title}</h1><p>{tool.description}</p></div>
      </header>
      <div className={`workspace ${toolId === 'speak' ? 'has-questions' : ''}`}>
        <aside className="workspace-sidebar">
          {toolId !== 'question' && <ListPanel type="students" items={students} onChange={onStudentsChange} />}
          {(toolId === 'speak' || toolId === 'question') && <ListPanel type="questions" items={questions} onChange={onQuestionsChange} />}
        </aside>
        <section className="result-stage">
          <StageDecor toolId={toolId} />
          {children}
        </section>
      </div>
    </main>
  )
}

function StageDecor({ toolId }) {
  return (
    <div className={`stage-decor decor-${toolId}`} aria-hidden="true">
      <i className="decor-orb decor-orb-one" />
      <i className="decor-orb decor-orb-two" />
      <i className="decor-spark decor-spark-one">✦</i>
      <i className="decor-spark decor-spark-two">✦</i>
      <i className="decor-card decor-card-one" />
      <i className="decor-card decor-card-two" />
    </div>
  )
}

export function PrimaryButton({ children, onClick, disabled, className = '' }) {
  return <button className={`primary-button ${className}`} type="button" onClick={onClick} disabled={disabled}>{children}<span aria-hidden="true">→</span></button>
}

export function EmptyResult({ icon, title, description }) {
  return <div className="empty-result"><span className={`empty-result-picture empty-picture-${icon}`}><img src={toolImage(icon)} alt="" /></span><h2>{title}</h2>{description && <p>{description}</p>}</div>
}

export function RollingDisplay({ label, preview }) {
  return <div className="rolling-display" aria-live="polite"><div className="shuffle-stack" aria-hidden="true"><i/><i/></div><div className="rolling-card"><span>{label}</span><strong>{preview || '...'}</strong><div className="rolling-line" /></div><b className="rolling-spark rolling-spark-one" aria-hidden="true">✦</b><b className="rolling-spark rolling-spark-two" aria-hidden="true">✦</b></div>
}

export function Confetti() {
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} style={{ '--i': index }} />)}</div>
}

export function LoadingResult({ text = 'Mixing things up…' }) {
  return <div className="loading-result" aria-live="polite"><div className="loading-deck" aria-hidden="true"><i/><i/><i/></div><span className="shuffle-dots"><i/><i/><i/></span><h2>{text}</h2></div>
}
