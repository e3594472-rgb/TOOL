import { useEffect, useState } from 'react'
import { Header, Home } from './components.jsx'
import { useStoredState } from './hooks.js'
import { OrderMaker, PairMaker, PickAndSpeak, QuestionPicker, StudentPicker, TeamMaker } from './modes.jsx'

// Keep one local origin so students and questions always use the same localStorage.
if (window.location.hostname === 'localhost' && window.location.port === '5173') {
  window.location.replace(`http://127.0.0.1:5173${window.location.pathname}${window.location.search}${window.location.hash}`)
}

const modeComponents = {
  student: StudentPicker,
  order: OrderMaker,
  pairs: PairMaker,
  teams: TeamMaker,
  speak: PickAndSpeak,
  question: QuestionPicker,
}

const previousDemoStudents = ['Anna', 'Max', 'Sophie', 'Leo', 'Emma', 'Daniel', 'Kate', 'Ksenya']
const previousDemoQuestions = [
  'What do you usually do at weekends?',
  'Would you rather live in the city or in the countryside?',
  'What is your favourite way to relax?',
  'What would you like to learn in the future?',
  'If you could travel anywhere, where would you go?',
  'If you could learn any new skill, what would you choose?',
]

const starterStudents = ['Roma', 'Vika', 'Varya', 'Mark', 'Lera']
const starterQuestions = [
  'Is summer your favourite season?',
  'What is your favourite summer activity?',
  'Can you swim?',
  'Which is better for you: the sea or the swimming pool?',
  'What is your favourite summer food?',
  'What do you do on sunny days?',
]

function seedStarterDataOnce() {
  const marker = 'pick-speak-starter-data-v2'
  try {
    if (localStorage.getItem(marker)) return
    const storedStudents = localStorage.getItem('pick-speak-students')
    const storedQuestions = localStorage.getItem('pick-speak-questions')
    const hasOldDemoStudents = storedStudents === JSON.stringify(previousDemoStudents)
    const hasOldDemoQuestions = storedQuestions === JSON.stringify(previousDemoQuestions)
    if (storedStudents === null || storedStudents === '[]' || hasOldDemoStudents) {
      localStorage.setItem('pick-speak-students', JSON.stringify(starterStudents))
    }
    if (storedQuestions === null || storedQuestions === '[]' || hasOldDemoQuestions) {
      localStorage.setItem('pick-speak-questions', JSON.stringify(starterQuestions))
    }
    localStorage.setItem(marker, '1')
  } catch {
    // The hook below still supplies starter data when localStorage is unavailable.
  }
}

seedStarterDataOnce()

function modeFromHash() {
  const hash = window.location.hash.replace('#/', '')
  return modeComponents[hash] ? hash : 'home'
}

export default function App() {
  const [students, setStudents] = useStoredState('pick-speak-students', starterStudents)
  const [questions, setQuestions] = useStoredState('pick-speak-questions', starterQuestions)
  const [soundOn, setSoundOn] = useStoredState('pick-speak-sound', true)
  const [activeTool, setActiveTool] = useState(modeFromHash)

  useEffect(() => {
    const onHashChange = () => setActiveTool(modeFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (tool) => {
    window.location.hash = tool === 'home' ? '/' : `/${tool}`
    setActiveTool(tool)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sharedProps = { students, onStudentsChange: setStudents, questions, onQuestionsChange: setQuestions, soundOn }
  const ActiveMode = modeComponents[activeTool]

  return (
    <div className="app-shell">
      <Header activeTool={activeTool} onNavigate={navigate} soundOn={soundOn} onToggleSound={() => setSoundOn((value) => !value)} />
      {activeTool === 'home' ? <Home onNavigate={navigate} students={students} onStudentsChange={setStudents} /> : <ActiveMode {...sharedProps} />}
      <footer><span>Pick & Speak</span><span>Made for real classrooms, one click at a time.</span></footer>
    </div>
  )
}
