import { useState } from 'react'
import type { RoastMode, RecruiterPersona, RoastResult } from './types'
import { extractTextFromFile } from './lib/extractText'
import { roastCV } from './lib/groq'
import { UploadZone } from './components/UploadZone'
import { RoastModeSelect } from './components/RoastModeSelect'
import { RecruiterPersonaSelect } from './components/RecruiterPersonaSelect'
import { LoadingScreen } from './components/LoadingScreen'
import { ResultsView } from './components/ResultsView'

type State = 'idle' | 'loading' | 'done' | 'error'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<RoastMode>('recruiter')
  const [persona, setPersona] = useState<RecruiterPersona>('senior_hr')
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<RoastResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleRoast() {
    if (!file) return
    setState('loading')
    setErrorMsg(null)
    try {
      const text = await extractTextFromFile(file)
      if (text.trim().length < 50) {
        throw new Error("Couldn't extract enough text from the file. Try a different format.")
      }
      const roast = await roastCV(text, mode, persona)
      setResult(roast)
      setState('done')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong.')
      setState('error')
    }
  }

  function reset() {
    setFile(null)
    setResult(null)
    setErrorMsg(null)
    setState('idle')
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-purple-700/20 blur-[130px]" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[400px] h-[400px] rounded-full bg-pink-700/15 blur-[100px]" />
        <div className="absolute top-1/2 left-[-150px] w-[300px] h-[300px] rounded-full bg-blue-700/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce-slow">🔥</div>
          <h1 className="text-4xl md:text-5xl font-black gradient-text mb-2">
            AI CV Roaster
          </h1>
          <p className="text-gray-400 text-lg italic">Get roasted. Get hired.</p>
        </header>

        {state === 'loading' && <LoadingScreen />}

        {state === 'done' && result && (
          <ResultsView result={result} fileName={file?.name ?? 'cv'} onReset={reset} />
        )}

        {(state === 'idle' || state === 'error') && (
          <div className="glass-card p-6 md:p-8 space-y-5 animate-slide-up">

            <UploadZone file={file} onFile={setFile} error={null} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RoastModeSelect value={mode} onChange={setMode} />
              <RecruiterPersonaSelect value={persona} onChange={setPersona} />
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              onClick={handleRoast}
              disabled={!file}
              className={`
                w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
                ${file
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/40 hover:scale-[1.02] hover:shadow-purple-900/60 active:scale-[0.98]'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'}
              `}
            >
              🔥 Roast My CV
            </button>

            <p className="text-center text-gray-600 text-xs">
              Your CV is processed locally and sent to Groq for AI analysis. Nothing is stored.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
